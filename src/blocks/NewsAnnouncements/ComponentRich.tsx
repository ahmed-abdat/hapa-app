"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bell,
  AlertCircle,
  FileText,
  Star,
  ChevronRight,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale } from "@/utilities/locale";
import type { Post } from "@/payload-types";

type NewsAnnouncementsRichProps = {
  title?: string;
  description?: string;
  posts?: Post[];
  showFeatured?: boolean;
  maxPosts?: number;
  showUrgentBanner?: boolean;
  disableInnerContainer?: boolean;
};

// Helpers to safely handle localized or plain fields
const getLocalizedTitle = (title: unknown, locale: Locale): string => {
  if (!title) return "";
  if (typeof title === "string") return title;
  if (typeof title === "object") {
    const t = title as { fr?: string; ar?: string };
    return (t as any)?.[locale] || t.fr || "";
  }
  return "";
};

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

// Mock data for development - replace with actual posts from CMS
const mockPosts: Partial<Post>[] = [
  {
    id: 1,
    title: "Nouvelles réglementations pour les médias audiovisuels",
    meta: {
      description:
        "La HAPA annonce de nouvelles directives pour améliorer la qualité du contenu audiovisuel en Mauritanie.",
    },
    publishedAt: "2025-01-23T10:00:00.000Z",
    slug: "nouvelles-reglementations-medias-audiovisuels",
    _status: "published",
  },
  {
    id: 2,
    title: "Formation professionnelle pour les journalistes",
    meta: {
      description:
        "Programme de formation continue pour renforcer les compétences des professionnels des médias.",
    },
    publishedAt: "2025-01-22T14:30:00.000Z",
    slug: "formation-professionnelle-journalistes",
    _status: "published",
  },
  {
    id: 3,
    title: "Rapport annuel sur la liberté de la presse",
    meta: {
      description:
        "Publication du rapport annuel 2024 sur l'état de la liberté de la presse en Mauritanie.",
    },
    publishedAt: "2025-01-21T09:00:00.000Z",
    slug: "rapport-annuel-liberte-presse-2024",
    _status: "published",
  },
  {
    id: 4,
    title: "Nouvelle procédure de licensing médiatique",
    meta: {
      description:
        "Simplification des démarches pour obtenir une licence médiatique en Mauritanie.",
    },
    publishedAt: "2025-01-20T11:15:00.000Z",
    slug: "nouvelle-procedure-licensing-mediatique",
    _status: "published",
  },
  {
    id: 5,
    title: "Mise à jour du code de déontologie",
    meta: {
      description:
        "Révision des standards éthiques pour les professionnels des médias mauritaniens.",
    },
    publishedAt: "2025-01-19T16:45:00.000Z",
    slug: "mise-a-jour-code-deontologie",
    _status: "published",
  },
];

const urgentAnnouncements = [
  {
    id: "urgent-1",
    type: "urgent" as const,
    title: {
      fr: "Suspension temporaire des licences TV",
      ar: "إيقاف مؤقت للتراخيص التلفزيونية",
    },
    date: "2025-01-24T08:00:00.000Z",
  },
  {
    id: "urgent-2",
    type: "alert" as const,
    title: {
      fr: "Mise à jour des procédures de plainte",
      ar: "تحديث إجراءات الشكاوى",
    },
    date: "2025-01-23T16:30:00.000Z",
  },
  {
    id: "urgent-3",
    type: "important" as const,
    title: {
      fr: "Échéance pour renouvellement de licences radio",
      ar: "موعد نهائي لتجديد تراخيص الإذاعة",
    },
    date: "2025-01-23T12:00:00.000Z",
  },
];

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

const urgentBannerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
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

const getTimeAgo = (dateString: string, locale: Locale): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return locale === "ar"
      ? `منذ ${diffInMinutes} دقيقة`
      : `Il y a ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return locale === "ar"
      ? `منذ ${diffInHours} ساعة`
      : `Il y a ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return locale === "ar"
    ? `منذ ${diffInDays} يوم`
    : `Il y a ${diffInDays} jours`;
};

const getUrgentIcon = (type: "urgent" | "alert" | "important") => {
  switch (type) {
    case "urgent":
      return AlertCircle;
    case "alert":
      return Bell;
    case "important":
      return Zap;
    default:
      return Bell;
  }
};

// Removed unused getUrgentColor function

export const NewsAnnouncementsRichBlock: React.FC<
  NewsAnnouncementsRichProps
> = ({
  title,
  description,
  posts = mockPosts,
  showFeatured = true,
  maxPosts = 6,
  showUrgentBanner = true,
  disableInnerContainer,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const isRtl = locale === "ar";
  const t = useTranslations();

  const featuredPost = showFeatured ? posts[0] : null;
  const regularPosts = showFeatured
    ? posts.slice(1, maxPosts)
    : posts.slice(0, maxPosts);

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      <div className="hapa-container">
        {/* Urgent Announcements Banner */}
        {showUrgentBanner && urgentAnnouncements.length > 0 && (
          <motion.div
            variants={urgentBannerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8 sm:mb-12"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 sm:p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                    <span className="font-bold text-sm sm:text-base">
                      {t("urgentAnnouncements")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {urgentAnnouncements
                    .slice(0, 3)
                    .map((announcement, index) => {
                      const Icon = getUrgentIcon(announcement.type);
                      return (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-grow">
                            <p className="text-sm font-medium">
                              {typeof announcement.title === "object"
                                ? announcement.title[locale]
                                : announcement.title}
                            </p>
                            <p className="text-xs text-white/80">
                              {getTimeAgo(announcement.date, locale)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isRtl ? (
                              <ChevronLeft className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="header-spacing"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {title || t("newsAnnouncements")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || t("newsAnnouncementsDesc")}
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-6 sm:mt-8 rounded-full" />
        </motion.div>

        {/* Featured Post Section */}
        {showFeatured && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 sm:mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">
                {t("featured")}
              </span>
            </div>

            <Link href={`/posts/${featuredPost.slug}`} className="block group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-primary/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Featured Image */}
                  <div className="h-64 sm:h-80 lg:h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                    <FileText className="h-16 w-16 text-primary/40 relative z-10" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {t("featured")}
                      </div>
                    </div>
                  </div>

                  {/* Featured Content */}
                  <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {featuredPost.publishedAt
                            ? formatDate(featuredPost.publishedAt, locale)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {featuredPost.publishedAt
                            ? getTimeAgo(featuredPost.publishedAt, locale)
                            : ""}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {getLocalizedTitle(featuredPost?.title, locale)}
                    </h3>

                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 line-clamp-3">
                      {getLocalizedDescription(
                        featuredPost?.meta?.description,
                        locale
                      )}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold text-lg">
                        {t("readMore")}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        {isRtl ? (
                          <ArrowLeft className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                        ) : (
                          <ArrowRight className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Regular News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing"
        >
          {regularPosts.map((post, index) => (
            <motion.div
              key={post.id || index}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-primary/30 h-full flex flex-col">
                  {/* Image placeholder */}
                  <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary/40" />
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {post.publishedAt
                            ? formatDate(post.publishedAt, locale)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-primary font-medium">
                          {post.publishedAt
                            ? getTimeAgo(post.publishedAt, locale)
                            : ""}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-grow">
                      {getLocalizedTitle(post?.title, locale)}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {getLocalizedDescription(post?.meta?.description, locale)}
                    </p>

                    <div className="flex items-center justify-between">
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
