import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { PaginationSuspense } from "@/components/Pagination/PaginationSuspense";
import { PublicationsCategoryHero } from "@/heros/PublicationsCategoryHero";
import configPromise from "@payload-config";
import { getPayload } from "payload";
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
        {posts.totalDocs > 12 && (
          <div className="mt-12">
            <PaginationSuspense
              totalItems={posts.totalDocs}
              itemsPerPage={12}
              currentPage={posts.page || 1}
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
