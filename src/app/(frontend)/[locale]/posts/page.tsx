import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { PaginationSuspense } from "@/components/Pagination/PaginationSuspense";
import { CategoryFilterSuspense } from "@/components/CategoryFilter/CategoryFilterSuspense";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import PageClient from "./page.client";
import { isValidLocale, type Locale } from "@/utilities/locale";
import { notFound } from "next/navigation";
import { Calendar, FileText, Filter, Newspaper } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Use ISR for posts listing with shorter revalidation
export const revalidate = 180; // 3 minutes for posts listing

type Args = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
};

export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise;
  const { category, page } = await searchParamsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations();
  const isRtl = locale === 'ar';

  // Parse page number from search params
  const currentPage = page ? parseInt(page, 10) : 1;
  const postsPerPage = 12;

  const payload = await getPayload({ config: configPromise });

  // Build query with optional category filter
  let whereClause = {};
  let selectedCategory = null;

  if (category) {
    // Find category by slug
    const categoryResult = await payload.find({
      collection: "categories",
      where: { slug: { equals: category } },
      limit: 1,
      locale,
    });

    if (categoryResult.docs.length > 0) {
      selectedCategory = categoryResult.docs[0];
      whereClause = {
        categories: { in: [selectedCategory.id] },
      };
    }
  }

  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: postsPerPage,
    page: currentPage,
    locale,
    overrideAccess: false,
    where: whereClause,
    sort: '-publishedAt', // Sort by newest first
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // Get all categories for filter dropdown
  const allCategories = await payload.find({
    collection: "categories",
    limit: 100,
    locale,
    sort: "title",
  });

  return (
    <div className="pb-24">
      <PageClient />

      {/* Hero Section - Matching Publications Design */}
      <div className="relative -mt-[10.4rem] min-h-[60vh] overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.08)_0%,transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[60vh] items-center pt-[10.4rem] pb-12">
          <div className="hapa-container">
            <div className="max-w-4xl mx-auto text-center">
              {/* Category Icon */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Newspaper className="h-10 w-10 text-primary" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-6 mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                  {selectedCategory ? selectedCategory.title : t('articlesAndNews')}
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto" />
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
                {selectedCategory ? (
                  <>
                    {t('exploreContentInCategory')} {selectedCategory.title}
                  </>
                ) : (
                  t('newsAnnouncementsDesc')
                )}
              </p>

              {/* Statistics */}
              {posts.totalDocs > 0 && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-primary">{posts.totalDocs}</span>
                  <span className="text-gray-600">
                    {posts.totalDocs === 1 ? t('article') : t('articles')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Section */}
      <section className="bg-gray-50/50 border-b border-gray-200/50">
        <div className="hapa-container">
          <CategoryFilterSuspense
            categories={allCategories.docs}
            selectedCategory={category}
            locale={locale as Locale}
          />
        </div>
      </section>

      {/* Content Section */}
      <div className="container">
        {/* Posts Count */}
        <div className="mb-6">
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
            locale={locale as Locale}
          />
        </div>

        {/* Posts Grid or Empty State */}
        {posts.docs.length > 0 ? (
          <CollectionArchive posts={posts.docs} locale={locale as Locale} showDescription={true} />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noArticlesFound')}
              </h3>
              <p className="text-gray-600">
                {t('noArticlesInCategory')}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {posts.totalDocs > 12 && (
          <div className="mt-12">
            <PaginationSuspense
              totalItems={posts.totalDocs}
              itemsPerPage={postsPerPage}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `HAPA - Posts`,
  };
}

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "ar" }];
}
