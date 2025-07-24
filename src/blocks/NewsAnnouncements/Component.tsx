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
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { getTranslation, translations } from "@/utilities/translations";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import { Media } from "@/components/Media";
import type { Post, Media as MediaType } from "@/payload-types";

type NewsAnnouncementsProps = {
  title?: string;
  description?: string;
  posts?: Post[];
  showFeatured?: boolean;
  maxPosts?: number;
};

// Mock data for development - replace with actual posts from CMS
const mockPosts: Partial<Post>[] = [
  {
    id: "1",
    title: {
      fr: "Nouvelles réglementations pour les médias audiovisuels",
      ar: "قوانين جديدة لوسائل الإعلام السمعية البصرية"
    },
    meta: {
      description: {
        fr: "La HAPA annonce de nouvelles directives pour améliorer la qualité du contenu audiovisuel en Mauritanie.",
        ar: "تعلن الهيئة العليا للصحافة والإعلام عن توجيهات جديدة لتحسين جودة المحتوى السمعي البصري في موريتانيا."
      }
    },
    publishedAt: "2025-01-20T10:00:00.000Z",
    slug: "nouvelles-reglementations-medias-audiovisuels",
    _status: "published"
  },
  {
    id: "2", 
    title: {
      fr: "Formation professionnelle pour les journalistes",
      ar: "تدريب مهني للصحفيين"
    },
    meta: {
      description: {
        fr: "Programme de formation continue pour renforcer les compétences des professionnels des médias.",
        ar: "برنامج تدريب مستمر لتعزيز مهارات المهنيين في وسائل الإعلام."
      }
    },
    publishedAt: "2025-01-18T14:30:00.000Z",
    slug: "formation-professionnelle-journalistes",
    _status: "published"
  },
  {
    id: "3",
    title: {  
      fr: "Rapport annuel sur la liberté de la presse",
      ar: "التقرير السنوي حول حرية الصحافة"
    },
    meta: {
      description: {
        fr: "Publication du rapport annuel 2024 sur l'état de la liberté de la presse en Mauritanie.",
        ar: "نشر التقرير السنوي 2024 حول حالة حرية الصحافة في موريتانيا."
      }
    },
    publishedAt: "2025-01-15T09:00:00.000Z",
    slug: "rapport-annuel-liberte-presse-2024",
    _status: "published"
  }
];

const urgentAnnouncements = [
  {
    id: "urgent-1",
    type: "urgent" as const,
    title: {
      fr: "Suspension temporaire des licences TV",
      ar: "إيقاف مؤقت للتراخيص التلفزيونية"
    },
    date: "2025-01-22T08:00:00.000Z"
  },
  {
    id: "urgent-2", 
    type: "alert" as const,
    title: {
      fr: "Mise à jour des procédures de plainte",
      ar: "تحديث إجراءات الشكاوى"
    },
    date: "2025-01-21T16:30:00.000Z"
  }
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

const getTimeAgo = (dateString: string, locale: Locale): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return locale === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `Il y a ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return locale === 'ar' ? `منذ ${diffInHours} ساعة` : `Il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return locale === 'ar' ? `منذ ${diffInDays} يوم` : `Il y a ${diffInDays} jours`;
};

export const NewsAnnouncementsBlock: React.FC<NewsAnnouncementsProps> = ({
  title,
  description,
  posts = mockPosts,
  showFeatured = true,
  maxPosts = 6,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1, maxPosts);

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
            {title || getTranslation("newsAnnouncements", locale)}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || getTranslation("newsAnnouncementsDesc", locale)}
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-6 sm:mt-8 rounded-full" />
        </motion.div>


        {/* News Grid */}
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
              className="group"
            >
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-primary/30">
                  {/* Image placeholder */}
                  <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary/40" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{post.publishedAt ? formatDate(post.publishedAt, locale) : ''}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {typeof post.title === 'object' ? post.title[locale] : post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {post.meta?.description && typeof post.meta.description === 'object' 
                        ? post.meta.description[locale]
                        : post.meta?.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-medium text-sm">
                        {getTranslation("readMore", locale)}
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
            <span>{getTranslation("viewAllNews", locale)}</span>
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