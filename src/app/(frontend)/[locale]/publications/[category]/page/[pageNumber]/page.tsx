import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { Pagination } from "@/components/Pagination";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";

// Force dynamic rendering to avoid database connectivity issues during build
export const dynamic = "force-dynamic";
export const revalidate = 600;

type Args = {
  params: Promise<{
    locale: string;
    category: string;
    pageNumber: string;
  }>;
};

// Category mapping for publications - matches actual database slugs and navigation
const categoryMappings: Record<string, { fr: string; ar: string }> = {
  decisions: { fr: "Décisions et communiqués", ar: "قرارات و بيانات" },
  rapports: { fr: "Rapports", ar: "تقارير" },
  "lois-et-reglements": { fr: "Lois et règlements", ar: "قوانين و تشريعات" },
  "qwanyn-w-tshryaat": { fr: "Lois et règlements", ar: "قوانين و تشريعات" }, // Arabic slug variant
  publications: { fr: "Publications", ar: "إصدارات" },
  actualites: { fr: "Actualités", ar: "الأخبار" },
};

export default async function PublicationCategoryPaginationPage({
  params: paramsPromise,
}: Args) {
  const { locale, category, pageNumber } = await paramsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Validate category
  if (!categoryMappings[category]) {
    notFound();
  }

  const currentPage = parseInt(pageNumber, 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  // 1. Find category by slug (using the category parameter)
  const categoryResult = await payload.find({
    collection: "categories",
    where: { slug: { equals: category } },
    limit: 1,
    locale,
  });

  // If category doesn't exist in CMS, create empty state
  const categoryData =
    categoryResult.docs.length > 0
      ? categoryResult.docs[0]
      : {
          id: "",
          title: categoryMappings[category][locale as "fr" | "ar"],
          slug: category,
        };

  // 2. Find posts in this category with pagination
  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 12,
    page: currentPage,
    locale,
    overrideAccess: false,
    where:
      categoryResult.docs.length > 0
        ? { categories: { in: [categoryData.id] } }
        : { id: { equals: "nonexistent" } }, // Return empty if category doesn't exist
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      createdAt: true,
    },
  });

  // If page number is beyond available pages, redirect to 404
  if (currentPage > posts.totalPages && posts.totalPages > 0) {
    notFound();
  }

  return (
    <div className="py-8">
      {/* Category Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryData.title}</h1>
          <p className="text-muted-foreground">
            {locale === "ar" ? "الصفحة" : "Page"} {currentPage}{" "}
            {locale === "ar" ? "من" : "de"} {posts.totalPages} -{" "}
            {posts.totalDocs} {locale === "ar" ? "مقال" : "articles"}
          </p>
        </div>
      </div>

      {/* Posts Count */}
      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      {/* Posts Grid or Empty State */}
      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs} locale={locale} />
      ) : (
        <div className="container">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "لا توجد مقالات في هذه الفئة حاليًا"
                : "Aucun article dans cette catégorie pour le moment"}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
            basePath={`/${locale}/publications/${category}`}
          />
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale, category, pageNumber } = await paramsPromise;

  if (!isValidLocale(locale)) {
    return {};
  }

  // Validate category
  if (!categoryMappings[category]) {
    return {};
  }

  const categoryTitle = categoryMappings[category][locale as "fr" | "ar"];
  const title = `${categoryTitle} - ${
    locale === "ar" ? "الصفحة" : "Page"
  } ${pageNumber} - HAPA`;

  return {
    title,
    description:
      locale === "ar"
        ? `مقالات في فئة ${categoryTitle} - الصفحة ${pageNumber}`
        : `Articles dans la catégorie ${categoryTitle} - Page ${pageNumber}`,
    alternates: {
      languages: {
        fr: `/fr/publications/${category}/page/${pageNumber}`,
        ar: `/ar/publications/${category}/page/${pageNumber}`,
      },
    },
  };
}

export async function generateStaticParams() {
  // Skip static generation during build - render pages on demand
  // This avoids database connectivity issues during the build process
  return [];
}
