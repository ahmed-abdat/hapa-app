import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
import React from "react";
import { Search } from "@/search/Component";
import PageClient from "./page.client";
import { CardPostData } from "@/components/Card";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/utilities/locale";
import { notFound } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import {
  searchPostsWithAnalytics,
  getPopularSearchTerms,
} from "@/app/actions/search";
import { SearchSuggestions } from "./SearchSuggestions";
import { CategoryCards } from "./CategoryCards";
import { ViewAllButton } from "./ViewAllButton";

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

  const t = await getTranslations();

  // Use server actions for search functionality with analytics
  const searchResults = query
    ? await searchPostsWithAnalytics({
        query,
        locale: locale as "fr" | "ar",
        limit: 24,
        offset: 0,
      })
    : await searchPostsWithAnalytics({
        query: "",
        locale: locale as "fr" | "ar",
        limit: 6,
        offset: 0,
      });

  const posts = {
    docs: searchResults.posts,
    totalDocs: searchResults.totalDocs,
    totalPages: searchResults.totalPages,
    hasNextPage: searchResults.hasNextPage,
    hasPrevPage: searchResults.hasPrevPage,
  };

  // Get popular search terms for suggestions
  const popularTerms = await getPopularSearchTerms(locale as "fr" | "ar");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageClient />

      {/* Hero Search Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-accent overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {t("search")}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {locale === "fr"
                  ? "Recherchez dans nos articles, décisions et publications officielles"
                  : "ابحث في مقالاتنا وقراراتنا ومنشوراتنا الرسمية"}
              </p>
            </div>

            {/* Enhanced Search Component */}
            <div className="max-w-2xl mx-auto mb-8">
              <Search
                variant="hero"
                showQuickResults={true}
                initialValue={query || ""}
              />
            </div>

            {/* Search Stats */}
            {query && (
              <div className="text-white/80 text-sm">
                {posts.totalDocs > 0 && (
                  <p>
                    {t("searchStats", {
                      count: posts.totalDocs,
                      query,
                      plural: posts.totalDocs > 1 ? "s" : "",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      <section className="py-12 lg:py-16">
        <div className="container px-0">
          {query ? (
            posts.totalDocs > 0 ? (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {t("searchResults")}
                  </h2>
                  <p className="text-gray-600">
                    {locale === "fr"
                      ? `Affichage de ${posts.totalDocs} résultat${
                          posts.totalDocs > 1 ? "s" : ""
                        }`
                      : `عرض ${posts.totalDocs} نتيجة`}
                  </p>
                </div>

                {/* Results Grid */}
                <CollectionArchive
                  posts={posts.docs as CardPostData[]}
                  locale={locale}
                />
              </div>
            ) : (
              /* No Results */
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("noResults")}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {t("noResultsText", { query })}
                  </p>
                </div>

                {/* Search Suggestions */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t("searchSuggestions")}
                  </h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <SearchSuggestions
                      suggestions={popularTerms.slice(0, 4)}
                      locale={locale as "fr" | "ar"}
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Welcome State - No Query */
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {locale === "fr" ? "Explorez notre contenu" : "ابدأ البحث"}
                </h2>
                <p className="text-lg text-gray-600">
                  {locale === "fr"
                    ? "Découvrez nos dernières publications, décisions et actualités"
                    : "ابحث في مقالاتنا وقراراتنا ومنشوراتنا الرسمية"}
                </p>
              </div>

              {/* Recent Posts Preview */}
              {posts.totalDocs > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {locale === "fr"
                        ? "Publications récentes"
                        : "المنشورات الحديثة"}
                    </h3>
                    <ViewAllButton text={t("viewAll")} href="/actualites" />
                  </div>
                  <CollectionArchive
                    posts={posts.docs.slice(0, 6) as CardPostData[]}
                    locale={locale}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale } = await paramsPromise;

  if (!isValidLocale(locale)) {
    return {
      title: "Search",
    };
  }

  const t = await getTranslations();

  return {
    title: `${t("search")} - HAPA`,
    description: t("siteDescription"),
  };
}
