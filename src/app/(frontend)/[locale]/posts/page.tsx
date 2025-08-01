import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { PaginationSuspense } from "@/components/Pagination/PaginationSuspense";
import { CategoryFilterSuspense } from "@/components/CategoryFilter/CategoryFilterSuspense";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import PageClient from "./page.client";
import { isValidLocale, type Locale } from "@/utilities/locale";
import { notFound } from "next/navigation";
import { Calendar, FileText, Filter } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50" >
      <PageClient />

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5" />
        
        <div className="relative hapa-container section-spacing">
          <div className="text-center text-white">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
              <span>{locale === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">
                {selectedCategory ? selectedCategory.title : (locale === 'ar' ? 'المقالات' : 'Articles')}
              </span>
            </nav>

            {/* Hero Title */}
            <div className="max-w-4xl mx-auto">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${isRtl ? 'text-right' : 'text-left'} md:text-center`}>
                {selectedCategory ? selectedCategory.title : (locale === 'ar' ? 'المقالات والأخبار' : 'Articles et Actualités')}
              </h1>
              
              <p className={`text-lg sm:text-xl md:text-2xl text-white/90 mb-8 leading-relaxed ${isRtl ? 'text-right' : 'text-left'} md:text-center`}>
                {selectedCategory ? (
                  <>
                    {locale === 'ar' ? 'استكشف المحتوى في فئة' : 'Explorez le contenu de la catégorie'} <span className="font-semibold">{selectedCategory.title}</span>
                  </>
                ) : (
                  locale === 'ar' 
                    ? 'ابق على اطلاع على آخر الأخبار والتحديثات التنظيمية من الهيئة العليا للصحافة والإعلام'
                    : 'Restez informé des dernières actualités et mises à jour réglementaires de HAPA'
                )}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {posts.totalDocs} {locale === 'ar' ? 'مقال' : 'articles'}
                  </span>
                </div>
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {locale === 'ar' ? 'فئة مختارة' : 'Catégorie sélectionnée'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Main Content */}
      <div className="relative">
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

        {/* Posts Archive Section */}
        <section className="py-2">
          <>
            {/* Page Range */}
            <div className="mb-6">
              <PageRange
                collection="posts"
                currentPage={posts.page}
                limit={12}
                totalDocs={posts.totalDocs}
                locale={locale as Locale}
              />
            </div>

            {/* Posts Grid */}
            <CollectionArchive posts={posts.docs} locale={locale as Locale} />

            {/* Pagination - Only shows when there are 10+ posts */}
            <PaginationSuspense
              totalItems={posts.totalDocs}
              itemsPerPage={postsPerPage}
              currentPage={currentPage}
              className="mt-8"
            />
          </>
        </section>
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
