import type { Metadata } from "next";

import { RelatedPosts } from "@/blocks/RelatedPosts/Component";
import { PayloadRedirects } from "@/components/PayloadRedirects";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { draftMode } from "next/headers";
import React, { cache } from "react";
import RichText from "@/components/RichText";

import type { Post } from "@/payload-types";
import type { Locale } from "@/utilities/locale";

import { PostHero } from "@/heros/PostHero";
import { generateMeta } from "@/utilities/generateMeta";
import PageClient from "./page.client";
import { LivePreviewListener } from "@/components/LivePreviewListener";

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise });
    const posts = await payload.find({
      collection: "posts",
      draft: false,
      limit: 10, // Only generate static pages for top 10 most recent posts
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt', // Sort by most recent first
      select: {
        slug: true,
      },
    });

    const locales = ["fr", "ar"];
    const params: { locale: string; slug: string }[] = [];

    posts.docs.forEach(({ slug }) => {
      if (slug) {
        locales.forEach((locale) => {
          params.push({ locale, slug });
        });
      }
    });

    return params;
  } catch (error) {
    console.error('Error generating static params for posts:', error);
    // Return empty array to skip static generation - pages will be rendered on demand
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
