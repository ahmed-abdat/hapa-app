import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { Pagination } from "@/components/Pagination";
import { PublicationsCategoryHero } from "@/heros/PublicationsCategoryHero";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 600;

type Args = {
  params: Promise<{
    locale: string;
    category: string;
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

export default async function PublicationCategoryPage({
  params: paramsPromise,
}: Args) {
  const { locale, category } = await paramsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Validate category
  if (!categoryMappings[category]) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  // Optimized approach based on Payload best practices and Context7 documentation
  
  // 1. Query category with performance optimizations
  const categoryResult = await payload.find({
    collection: "categories",
    where: { slug: { equals: category } },
    limit: 1, // Payload best practice: limit 1 for unique fields
    depth: 0, // Performance optimization: don't populate relationships
    select: {
      id: true,
      title: true,
      slug: true,
    },
    locale,
  });

  // Use actual category data or fall back to static mapping
  const categoryData = categoryResult.docs.length > 0
    ? categoryResult.docs[0]
    : {
        id: `static-${category}`,
        title: categoryMappings[category][locale as "fr" | "ar"],
        slug: category,
      };

  // 2. Query posts with optimized where clause and select fields
  const posts = await payload.find({
    collection: "posts",
    depth: 1, // Limited depth for performance
    limit: 12,
    locale,
    overrideAccess: false,
    where: categoryResult.docs.length > 0
      ? { categories: { in: [categoryData.id] } } // Use relationship query if category exists
      : { id: { equals: "nonexistent" } }, // Return empty if category doesn't exist in DB
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="pb-24">
      {/* Category Hero Section */}
      <PublicationsCategoryHero 
        locale={locale}
        categoryTitle={categoryData.title}
        categorySlug={category}
        totalDocs={posts.totalDocs}
      />

      {/* Content Section */}
      <div className="container">
        {/* Posts Count */}
        <div className="mb-6">
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
            locale={locale}
          />
        </div>

        {/* Posts Grid or Empty State */}
        {posts.docs.length > 0 ? (
          <CollectionArchive posts={posts.docs} locale={locale} />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === "ar" ? "لا توجد وثائق" : "Aucun document"}
              </h3>
              <p className="text-gray-600">
                {locale === "ar"
                  ? "لا توجد وثائق في هذه الفئة حاليًا. تحقق لاحقًا للحصول على تحديثات."
                  : "Aucun document dans cette catégorie pour le moment. Revenez plus tard pour les mises à jour."}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {posts.totalPages > 1 && posts.page && (
          <div className="mt-12">
            <Pagination
              page={posts.page}
              totalPages={posts.totalPages}
              basePath={`/${locale}/publications/${category}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale, category } = await paramsPromise;

  if (!isValidLocale(locale)) {
    return {};
  }

  // Validate category
  if (!categoryMappings[category]) {
    return {};
  }

  const categoryTitle = categoryMappings[category][locale as "fr" | "ar"];
  const title = `${categoryTitle} - HAPA`;

  return {
    title,
    description:
      locale === "ar"
        ? `مقالات في فئة ${categoryTitle}`
        : `Articles dans la catégorie ${categoryTitle}`,
    alternates: {
      languages: {
        fr: `/fr/publications/${category}`,
        ar: `/ar/publications/${category}`,
      },
    },
  };
}

export async function generateStaticParams() {
  // Skip static generation during build due to database connection issues
  // Pages will be generated on-demand which is acceptable for dynamic content
  return [];
}
