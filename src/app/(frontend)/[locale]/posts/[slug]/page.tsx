import type { Metadata } from "next";

import { RelatedPosts } from "@/blocks/RelatedPosts/Component";
import { PayloadRedirects } from "@/components/PayloadRedirects";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { draftMode } from "next/headers";
import React, { cache } from "react";
import RichText from "@/components/RichText";
import { logger } from "@/utilities/logger";

import type { Post } from "@/payload-types";
import type { Locale } from "@/utilities/locale";

import { PostHero } from "@/heros/PostHero";
import { generateMeta } from "@/utilities/generateMeta";
import PageClient from "./page.client";
import { LivePreviewListener } from "@/components/LivePreviewListener";

// Use ISR for better performance with automatic revalidation
export const revalidate = 300 // 5 minutes - good balance for news content

export async function generateStaticParams() {
  // Generate static params for most popular posts at build time
  try {
    const payload = await getPayload({ config: configPromise });
    
    const posts = await payload.find({
      collection: 'posts',
      limit: 20, // Generate top 20 posts at build time
      sort: '-publishedAt',
      where: {
        _status: { equals: 'published' }
      },
      locale: 'fr', // Generate French versions first
      select: {
        slug: true,
      },
    });

    // Generate params for both locales
    const params = [];
    for (const post of posts.docs) {
      if (post.slug) {
        params.push({ locale: 'fr', slug: post.slug });
        params.push({ locale: 'ar', slug: post.slug });
      }
    }
    
    return params;
  } catch (error) {
    // Fallback to empty array if database connection fails during build
    logger.warn('Failed to generate static params for posts', {
      component: 'PostsPageGeneration',
      action: 'generate_static_params',
      metadata: { error: error instanceof Error ? error.message : String(error) }
    });
    return [];
  }
}

type Args = {
  params: Promise<{
    locale: Locale;
    slug?: string;
  }>;
};

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { locale, slug = "" } = await paramsPromise;
  const url = "/posts/" + slug;

  const post = await queryPostBySlug({ slug, locale });

  if (!post) {
    return <PayloadRedirects url={url} />;
  }

  return (
    <article className="py-8">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} locale={locale} />

      {/* Article Content */}
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText
            className="max-w-[48rem] mx-auto"
            data={post.content}
            enableGutter={false}
          />
        </div>
      </div>

      {/* Related Posts Section */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <RelatedPosts
          className="mt-16 mb-8"
          docs={post.relatedPosts.filter((post) => typeof post === "object")}
          locale={locale}
        />
      )}
    </article>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale, slug = "" } = await paramsPromise;
  const post = await queryPostBySlug({ slug, locale });

  return generateMeta({ doc: post });
}

const queryPostBySlug = cache(
  async ({ slug, locale }: { slug: string; locale?: Locale }) => {
    const { isEnabled: draft } = await draftMode();

    const payload = await getPayload({ config: configPromise });

    const shouldDisableFallback = locale && locale !== "fr";

    const result = await payload.find({
      collection: "posts",
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      locale: locale || "fr",
      fallbackLocale: shouldDisableFallback ? false : undefined,
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    return result.docs?.[0] || null;
  }
);
