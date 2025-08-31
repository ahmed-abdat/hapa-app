import type { Metadata } from "next";

import { RelatedPosts } from "@/blocks/RelatedPosts/Component";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import RichText from "@/components/RichText";
import { logger } from "@/utilities/logger";
import { getTranslations } from 'next-intl/server';

import type { Post } from "@/payload-types";
import type { Locale } from "@/utilities/locale";

import { PostHero } from "@/heros/PostHero";
import { generateMeta } from "@/utilities/generateMeta";
import PageClient from "./page.client";
import { LivePreviewListener } from "@/components/LivePreviewListener";
import { Link } from "@/i18n/navigation";
import { ShareButton } from "@/components/ShareButton";
import { formatDateTime } from "@/utilities/formatDateTime";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, FileText, ChevronRight, ChevronLeft } from "lucide-react";

// Use ISR for better performance with automatic revalidation
export const revalidate = 300 // 5 minutes - good balance for news content

// Allow dynamic params for on-demand generation of posts not in generateStaticParams
export const dynamicParams = true // This enables ISR fallback for non-pre-generated posts

export async function generateStaticParams() {
  // Generate static params for most popular posts at build time
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Increase the number of pre-generated posts for better coverage
    // This reduces 404s for popular content while keeping build times reasonable
    const posts = await payload.find({
      collection: 'posts',
      limit: 100, // Increased from 20 to 100 for better ISR coverage
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
    return notFound();
  }

  // Get translations
  const t = await getTranslations({ locale });

  return (
    <article className="py-8">
      <PageClient />

      {draft && <LivePreviewListener />}

      <PostHero post={post} locale={locale} />

      {/* Main content container with consistent max-width */}
      <div className="container px-4 lg:px-8">
        <div className="max-w-[48rem] mx-auto">
          {/* Enhanced Breadcrumb Navigation */}
          <div className="mt-8 mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Home className="h-3.5 w-3.5" />
                      <span>{t('home')}</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  {locale === 'ar' ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/posts" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{t('posts')}</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  {locale === 'ar' ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[300px] truncate font-medium">
                    {post.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Post Metadata Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
              {/* Publish Date */}
              {post.publishedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{t('datePublished')}:</span>
                  <time 
                    dateTime={post.publishedAt}
                    className="text-gray-700"
                  >
                    {formatDateTime(post.publishedAt)}
                  </time>
                </div>
              )}
              
              {/* Share Button */}
              <div className="flex items-center">
                <ShareButton url={url} title={post.title} locale={locale} shareText={t('share')} />
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <RichText
              data={post.content}
              enableGutter={false}
              locale={locale}
            />
          </div>
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
    const startTime = Date.now();
    const { isEnabled: draft } = await draftMode();

    const payload = await getPayload({ config: configPromise });

    const shouldDisableFallback = locale && locale !== "fr";

    // Log query details in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info('Querying post by slug', {
        component: 'PostPage',
        action: 'query_post',
        metadata: { 
          slug, 
          locale, 
          draft,
          fallbackDisabled: shouldDisableFallback 
        }
      });
    }

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

    const queryTime = Date.now() - startTime;
    
    // Log slow queries for performance monitoring
    if (queryTime > 1000) {
      logger.warn('Slow post query detected', {
        component: 'PostPage',
        action: 'slow_query',
        metadata: { 
          slug, 
          locale, 
          queryTime,
          found: !!result.docs?.[0]
        }
      });
    }

    return result.docs?.[0] || null;
  }
);