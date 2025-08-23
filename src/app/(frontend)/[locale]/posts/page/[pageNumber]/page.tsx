import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import { PageRange } from "@/components/PageRange";
import { PaginationSuspense } from "@/components/Pagination/PaginationSuspense";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import PageClient from "./page.client";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/utilities/locale";

export const revalidate = 600;
// Force dynamic rendering to avoid database connectivity issues during build
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    pageNumber: string;
    locale: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber, locale } = await paramsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  const sanitizedPageNumber = Number(pageNumber);

  if (!Number.isInteger(sanitizedPageNumber)) notFound();

  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    locale,
    overrideAccess: false,
  });

  return (
    <div className="py-8">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
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
        {posts?.totalDocs && posts.totalDocs > 12 && (
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
  const { pageNumber } = await paramsPromise;
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ""}`,
  };
}

export async function generateStaticParams() {
  // Skip static generation during build - render pages on demand
  // This avoids database connectivity issues during the build process  
  return [];
}
