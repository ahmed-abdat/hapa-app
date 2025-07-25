import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { Pagination } from "@/components/Pagination";
import { CategoryFilter } from "@/components/CategoryFilter";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import PageClient from "./page.client";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 600;

type Args = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise;
  const { category } = await searchParamsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

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
    limit: 12,
    locale,
    overrideAccess: false,
    where: whereClause, // Add conditional filtering
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
    <div className="py-8">
      <PageClient />

      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{selectedCategory ? selectedCategory.title : "Posts"}</h1>
          {selectedCategory && (
            <p className="text-muted-foreground">
              {locale === "ar" ? "في فئة" : "Dans la catégorie"}:{" "}
              {selectedCategory.title}
            </p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mb-8">
        <CategoryFilter
          categories={allCategories.docs}
          selectedCategory={category}
          locale={locale}
        />
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} locale={locale} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
            preserveSearchParams={true}
          />
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
