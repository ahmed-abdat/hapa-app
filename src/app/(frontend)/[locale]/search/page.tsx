import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";
import { Search } from "@/search/Component";
import PageClient from "./page.client";
import { CardPostData } from "@/components/Card";
import { t } from "@/utilities/translations";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";

type Args = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q: string;
  }>;
};
export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise;
  const { q: query } = await searchParamsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  const posts = await payload.find({
    collection: "search",
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                "meta.description": {
                  like: query,
                },
              },
              {
                "meta.title": {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  });

  return (
    <div className="py-8">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive
          posts={posts.docs as CardPostData[]}
          locale={locale}
        />
      ) : (
        <div className="container">{t("noResults", locale)}</div>
      )}
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  };
}
