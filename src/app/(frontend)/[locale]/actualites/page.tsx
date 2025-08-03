import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { PaginationSuspense } from "@/components/Pagination/PaginationSuspense";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";
import type { Category, Post } from "@/payload-types";
import { logger } from "@/utilities/logger";

// Force dynamic rendering to avoid database connectivity issues during build
export const dynamic = "force-dynamic";
export const revalidate = 600;

type Args = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ActualitesPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  let categoryResult: { docs: Category[] } = { docs: [] };
  let posts: { docs: Post[], totalDocs: number, totalPages: number, page: number } = { docs: [], totalDocs: 0, totalPages: 1, page: 1 };

  try {
    const payload = await getPayload({ config: configPromise });

    // Try to find the actualites category
    try {
      categoryResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: "actualites" } },
        limit: 1,
        locale,
      });
    } catch (error) {
      logger.error('Error finding actualites category', error as Error, {
        component: 'ActualitesPage',
        action: 'find_category',
        metadata: { locale }
      });
      // Continue with empty categoryResult
    }

    // Find posts in actualites category
    try {
      const postsResult = await payload.find({
        collection: "posts",
        depth: 1,
        limit: 12,
        locale,
        overrideAccess: false,
        where:
          categoryResult.docs.length > 0
            ? { categories: { in: [categoryResult.docs[0].id] } }
            : { id: { equals: "nonexistent" } }, // Return empty if category doesn't exist
        select: {
          id: true,
          title: true,
          slug: true,
          categories: true,
          meta: true,
          publishedAt: true,
          createdAt: true,
        },
      });
      posts = {
        docs: postsResult.docs,
        totalDocs: postsResult.totalDocs,
        totalPages: postsResult.totalPages,
        page: postsResult.page || 1
      };
    } catch (error) {
      logger.error('Error finding posts in actualites category', error as Error, {
        component: 'ActualitesPage',
        action: 'find_posts',
        metadata: { locale, category: 'actualites' }
      });
      // Continue with empty posts
    }
  } catch (error) {
    logger.error('Error connecting to Payload', error as Error, {
      component: 'ActualitesPage',
      action: 'payload_connection',
      metadata: { locale }
    });
    // Continue with empty data
  }

  const categoryTitle =
    categoryResult.docs.length > 0
      ? categoryResult.docs[0].title
      : locale === "ar"
      ? "الأخبار"
      : "Actualités";

  return (
    <div className="py-8">
      {/* Category Header */}
      <div className="container mb-12">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryTitle}</h1>
        </div>
      </div>

      {/* Posts Grid or Empty State */}
      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs} locale={locale} />
      ) : (
        <div className="container">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "لا توجد أخبار حاليًا"
                : "Aucune actualité pour le moment"}
            </p>
          </div>
        </div>
      )}

      {/* Pagination Info and Navigation */}
      <div className="container mt-8 space-y-4">
        {posts.docs.length > 0 && (
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
            locale={locale}
            className="text-center"
          />
        )}

        {posts.totalDocs > 12 && (
          <PaginationSuspense
            totalItems={posts.totalDocs}
            itemsPerPage={12}
            currentPage={posts.page || 1}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale } = await paramsPromise;

  if (!isValidLocale(locale)) {
    return {};
  }

  const title = locale === "ar" ? "الأخبار - الهابا" : "Actualités - HAPA";
  const description =
    locale === "ar"
      ? "آخر الأخبار والتحديثات من الهيئة العليا للصحافة والإذاعة والتلفزيون"
      : "Dernières actualités et mises à jour de la Haute Autorité de la Presse et de l'Audiovisuel";

  return {
    title,
    description,
    alternates: {
      languages: {
        fr: "/fr/actualites",
        ar: "/ar/actualites",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "ar" }];
}
