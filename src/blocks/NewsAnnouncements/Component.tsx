"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { PostCard } from "@/components/PostCard";
import { SectionHeader } from "@/components/SectionHeader";

// Dynamically import motion components and types
const MotionDiv = dynamic(
  () =>
    import("framer-motion").then((mod) => ({
      default: mod.motion.div,
    })),
  {
    loading: () => <div className="opacity-0" />,
    ssr: false,
  }
);

import Image from "next/image";
import { Calendar, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { type Locale } from "@/utilities/locale";
import { getMediaUrl } from "@/utilities/getMediaUrl";
import { getCachedPosts } from "@/utilities/cached-queries";
import type { Post, Category } from "@/payload-types";

// Helper function to handle both localized and non-localized titles
const getLocalizedTitle = (title: unknown, locale: Locale): string => {
  if (!title) return "";
  if (typeof title === "string") return title;
  if (typeof title === "object") {
    const t = title as { fr?: string; ar?: string };
    return (t as any)?.[locale] || t.fr || "";
  }
  return "";
};

// Helper function to handle both localized and non-localized descriptions
const getLocalizedDescription = (
  description: unknown,
  locale: Locale
): string => {
  if (!description) return "";
  if (typeof description === "string") return description;
  if (typeof description === "object") {
    const d = description as { fr?: string; ar?: string };
    return (d as any)?.[locale] || d.fr || "";
  }
  return "";
};

type NewsAnnouncementsProps = {
  title?: string;
  description?: string;
  posts?: Post[];
  showFeatured?: boolean;
  showPostDescriptions?: boolean;
  maxPosts?: number;
  locale?: Locale;
};

// Animation configurations as simple objects
const containerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const formatDate = (dateString: string, locale: Locale): string => {
  const date = new Date(dateString);

  if (locale === "ar") {
    // For Arabic, use Arabic month names but regular numerals
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      numberingSystem: "latn", // Force Latin numerals (0-9) instead of Arabic-Indic
    };
    return date.toLocaleDateString("ar-MR", options);
  } else {
    // For French, standard formatting
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("fr-MR", options);
  }
};

// Removed unused getTimeAgo function

export const NewsAnnouncementsBlock: React.FC<NewsAnnouncementsProps> = ({
  title,
  description,
  posts = [],
  showFeatured: _showFeatured = true,
  showPostDescriptions = false,
  maxPosts = 6,
  locale: localeProp,
}) => {
  const currentLocale = useLocale() as Locale;
  const locale = localeProp || currentLocale;
  const isRtl = locale === "ar";
  const t = useTranslations();

  // Remove unused variables
  // const featuredPost = posts[0];
  // const regularPosts = posts.slice(1, maxPosts);

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      <div className="hapa-container">
        {/* Section Header */}
        <SectionHeader
          title={title || t("newsAnnouncements")}
          description={description || t("newsAnnouncementsDesc")}
          variant="main"
          alignment="center"
          showGradient={true}
          gradientSize="md"
        />

        {/* News Grid */}
        {posts && posts.length > 0 ? (
          <MotionDiv
            initial={{ opacity: 0 }}
            whileInView={{
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            }}
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing"
          >
            {posts.slice(0, maxPosts).map((post, index) => {
              // Get category for the PostCard
              const category =
                post.categories &&
                Array.isArray(post.categories) &&
                post.categories.length > 0
                  ? typeof post.categories[0] === "object" &&
                    post.categories[0] !== null
                    ? post.categories[0].title || t("untitledCategory")
                    : ""
                  : undefined;

              // Get image for the PostCard - pass the whole media object
              const image =
                post.heroImage &&
                typeof post.heroImage === "object" &&
                "url" in post.heroImage
                  ? post.heroImage
                  : undefined;

              return (
                <MotionDiv
                  key={post.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: [0.25, 1, 0.5, 1],
                      delay: index * 0.1,
                    },
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="h-full"
                >
                  <PostCard
                    title={getLocalizedTitle(post.title, locale)}
                    description={getLocalizedDescription(
                      post.meta?.description,
                      locale
                    )}
                    href={`/posts/${post.slug}`}
                    image={image}
                    category={category}
                    date={post.publishedAt || undefined}
                    showDescription={showPostDescriptions}
                  />
                </MotionDiv>
              );
            })}
          </MotionDiv>
        ) : (
          /* No posts available fallback */
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {locale === "ar"
                ? "لا توجد أخبار متاحة حالياً"
                : "Aucune actualité disponible pour le moment"}
            </p>
          </div>
        )}

        {/* View All Button */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link
            href="/posts"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>{t("viewAllNews")}</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center">
              {isRtl ? (
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </div>
          </Link>
        </MotionDiv>
      </div>
    </section>
  );
};
