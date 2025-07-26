"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  FileText
} from "lucide-react";
import { useTranslations } from 'next-intl';
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import { getMediaUrl } from "@/utilities/getMediaUrl";
import type { Post } from "@/payload-types";

// Helper function to handle both localized and non-localized titles
const getLocalizedTitle = (title: string | { fr: string; ar?: string }, locale: Locale): string => {
  if (typeof title === 'string') {
    return title;
  }
  return title[locale] || title.fr || '';
};

// Helper function to handle both localized and non-localized descriptions
const getLocalizedDescription = (description: string | { fr: string; ar?: string } | null | undefined, locale: Locale): string => {
  if (!description) return '';
  if (typeof description === 'string') {
    return description;
  }
  return description[locale] || description.fr || '';
};

type NewsAnnouncementsProps = {
  title?: string;
  description?: string;
  posts?: Post[];
  showFeatured?: boolean;
  maxPosts?: number;
};


// Removed unused urgentAnnouncements data

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
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
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const localeCode = locale === 'ar' ? 'ar-MR' : 'fr-MR';
  return date.toLocaleDateString(localeCode, options);
};


// Removed unused getTimeAgo function

export const NewsAnnouncementsBlock: React.FC<NewsAnnouncementsProps> = ({
  title,
  description,
  posts = [],
  showFeatured: _showFeatured = true,
  maxPosts = 6,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";
  const t = useTranslations();

  // Remove unused variables
  // const featuredPost = posts[0];
  // const regularPosts = posts.slice(1, maxPosts);

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/20"
      dir={direction}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {title || t("newsAnnouncements")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || t("newsAnnouncementsDesc")}
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-6 sm:mt-8 rounded-full" />
        </motion.div>


        {/* News Grid */}
        {posts && posts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {posts.slice(0, maxPosts).map((post, index) => (
            <motion.div
              key={post.id || index}
              variants={itemVariants}
              className="group h-full"
            >
              <Link href={`/posts/${post.slug}`} className="block h-full">
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-primary/30 h-full flex flex-col">
                  {/* Image section - consistent height */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage && post.heroImage.url ? (
                      <Image 
                        src={getMediaUrl(post.heroImage.url, post.heroImage.updatedAt)} 
                        alt={post.heroImage.alt || getLocalizedTitle(post.title, locale)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAEXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAVBJREFUWAnt1rEKgkAUhmHPU9B7OLWFYw"
                      />
                    ) : (
                      <FileText className="h-10 w-10 text-primary/40" />
                    )}
                  </div>
                  
                  {/* Content section - flex grow to fill remaining space */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span>{post.publishedAt ? formatDate(post.publishedAt, locale) : ''}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-shrink-0">
                      {getLocalizedTitle(post.title, locale)}
                    </h3>
                    
                    {getLocalizedDescription(post.meta?.description, locale) && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                        {getLocalizedDescription(post.meta?.description, locale)}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between flex-shrink-0 mt-auto">
                      <span className="text-primary font-medium text-sm">
                        {t("readMore")}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                        {isRtl ? (
                          <ArrowLeft className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" />
                        ) : (
                          <ArrowRight className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            ))}
          </motion.div>
        ) : (
          /* No posts available fallback */
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {locale === 'ar' ? 'لا توجد أخبار متاحة حالياً' : 'Aucune actualité disponible pour le moment'}
            </p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
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
        </motion.div>
      </div>
    </section>
  );
};