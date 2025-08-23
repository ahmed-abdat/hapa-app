import type { Metadata } from "next/types";

import { CollectionArchive } from "@/components/CollectionArchive";
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
            <div className="max-w-3xl mx-auto mb-8">
              <Search
                variant="hero"
                showQuickResults={true}
                initialValue={query || ""}
              />
            </div>

            {/* Enhanced Search Stats */}
            {query && (
              <div className="text-white/90 text-sm">
                {posts.totalDocs > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="font-medium">
                      {locale === "fr"
                        ? `${posts.totalDocs} résultat${posts.totalDocs > 1 ? "s" : ""} trouvé${posts.totalDocs > 1 ? "s" : ""}`
                        : `تم العثور على ${posts.totalDocs} نتيجة`}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <p>{locale === "fr" ? "Aucun résultat trouvé" : "لا توجد نتائج"}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      <section className="py-8 lg:py-12">
        <div className="container px-4 lg:px-0">
          {query ? (
            posts.totalDocs > 0 ? (
              <div className="space-y-8">
                {/* Enhanced Results Header */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {t("searchResults")}
                      </h2>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {posts.totalDocs}
                        </span>
                        {locale === "fr"
                          ? `résultat${posts.totalDocs > 1 ? "s" : ""} trouvé${posts.totalDocs > 1 ? "s" : ""} pour "${query}"`
                          : `نتيجة موجودة لـ "${query}"`}
                      </p>
                    </div>
                    
                    {/* Search Quality Indicator */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{locale === "fr" ? "Résultats pertinents" : "نتائج ذات صلة"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Grid - Show descriptions for search results */}
                <CollectionArchive
                  posts={posts.docs as CardPostData[]}
                  locale={locale}
                  showDescription={true}
                />
              </div>
            ) : (
              /* Simplified No Results State */
              <div className="max-w-2xl mx-auto py-12 lg:py-16">
                {/* Simple No Results Message */}
                <div className="text-center mb-8">
                  {/* Simple Icon */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <SearchIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t("noResults")}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {locale === "fr" 
                      ? `Aucun résultat trouvé pour "${query}". Essayez d'affiner votre recherche.`
                      : `لم يتم العثور على نتائج للبحث عن "${query}". حاول تعديل البحث.`
                    }
                  </p>
                </div>

                {/* Simple Popular Searches */}
                {popularTerms.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      {locale === "fr" ? "Recherches populaires:" : "البحث الشائع:"}
                    </p>
                    <SearchSuggestions
                      suggestions={popularTerms.slice(0, 3)}
                      locale={locale as "fr" | "ar"}
                      variant="compact"
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            /* Enhanced Welcome State - No Query */
            <div className="max-w-6xl mx-auto">
              {/* Welcome Header */}
              <div className="text-center mb-12 lg:mb-16 px-4">
                <div className="relative mb-6 lg:mb-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                    {locale === "fr" ? "Explorez notre contenu" : "ابدأ البحث"}
                  </h2>
                  <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                    {locale === "fr"
                      ? "Découvrez nos dernières publications, décisions réglementaires et actualités du secteur audiovisuel mauritanien"
                      : "استكشف أحدث منشوراتنا وقراراتنا التنظيمية وأخبار قطاع الإعلام الموريتاني"}
                  </p>
                </div>

                {/* Quick Search Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                  <CategoryCards 
                    locale={locale as "fr" | "ar"} 
                    variant="default"
                  />
                </div>
              </div>

              {/* Recent Posts Preview with Enhanced Layout */}
              {posts.totalDocs > 0 && (
                <div className="space-y-8">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {locale === "fr"
                              ? "Publications récentes"
                              : "المنشورات الحديثة"}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {locale === "fr"
                              ? "Nos derniers contenus officiels"
                              : "أحدث محتوياتنا الرسمية"}
                          </p>
                        </div>
                      </div>
                      <ViewAllButton text={t("viewAll")} href="/actualites" />
                    </div>
                  </div>

                  {/* Posts Grid - Don't show descriptions for recent posts preview */}
                  <CollectionArchive
                    posts={posts.docs.slice(0, 6) as CardPostData[]}
                    locale={locale}
                    showDescription={false}
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
