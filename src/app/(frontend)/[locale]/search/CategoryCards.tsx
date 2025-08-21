"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FileText,
  Gavel,
  Radio,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react";

interface CategoryCardsProps {
  locale: "fr" | "ar";
  variant?: "default" | "compact";
}

export function CategoryCards({
  locale,
  variant = "default",
}: CategoryCardsProps) {
  const router = useRouter();
  const t = useTranslations();
  const isRtl = locale === "ar";

  const categories = [
    {
      title: t("news"),
      description: t("newsAnnouncementsDesc"),
      icon: Radio,
      href: "/actualites", // Direct route to news - EXISTS
      color: "from-green-500 to-green-600",
    },
    {
      title: t("printPublications"),
      description: t("officialDocumentsDesc"),
      icon: FileText,
      href: "/posts", // Direct route to all posts - EXISTS
      color: "from-purple-500 to-purple-600",
    },
    {
      title: t("decisionsAndRegulations"),
      description:
        locale === "fr"
          ? "Décisions réglementaires et administratives officielles"
          : "القرارات التنظيمية والإدارية الرسمية",
      icon: Gavel,
      href: "/publications/decisions", // Dynamic category route - EXISTS
      color: "from-blue-500 to-blue-600",
    },
    {
      title: locale === "fr" ? "Événements" : "الأحداث",
      description:
        locale === "fr"
          ? "Événements et conférences organisés"
          : "الأحداث والمؤتمرات المنظمة",
      icon: Calendar,
      href: "/posts/category/evenements", // Category route - MAY EXIST
      color: "from-orange-500 to-orange-600",
    },
  ];

  const handleCategoryClick = (category: (typeof categories)[0]) => {
    try {
      // All categories now have href, so just navigate
      if (category.href) {
        router.push(category.href);
      }
    } catch (error) {
      console.error("Error navigating:", error);
      // Fallback to window.location
      if (category.href) {
        window.location.href = category.href;
      }
    }
  };

  const getVariantStyles = () => {
    if (variant === "compact") {
      return {
        card: "p-3 sm:p-4 h-20 sm:h-24",
        content: "flex-row items-center gap-2 sm:gap-3",
        icon: "w-5 h-5 sm:w-6 sm:h-6",
        iconContainer: "w-8 h-8 sm:w-10 sm:h-10",
        title: "text-xs sm:text-sm font-medium",
        hideDescription: true,
      };
    }
    return {
      card: "p-3 sm:p-4 min-h-[120px] sm:min-h-[140px]",
      content: "flex-col items-start gap-2 sm:gap-3",
      icon: "w-5 h-5 sm:w-6 sm:h-6",
      iconContainer: "w-10 h-10 sm:w-12 sm:h-12",
      title: "text-base sm:text-lg font-semibold",
      hideDescription: false,
    };
  };

  const styles = getVariantStyles();

  return (
    <>
      {categories.map((category, index) => {
        const IconComponent = category.icon;
        return (
          <motion.div
            key={`${category.title}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCategoryClick(category);
            }}
          >
            <Card
              className={cn(
                "transition-all duration-300 group border-gray-200/80",
                "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
                "bg-gradient-to-br from-white via-white to-gray-50/30",
                "backdrop-blur-sm active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none",
                styles.card
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(category);
                }
              }}
              aria-label={`${locale === "fr" ? "Rechercher" : "البحث عن"} ${
                category.title
              }`}
            >
              <CardContent
                className={cn(
                  "p-3 sm:p-4 pt-0 flex h-full relative overflow-hidden",
                  styles.content,
                  isRtl && "text-right"
                )}
              >
                {/* Background gradient effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200",
                    category.color
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-xl relative z-10",
                    "bg-gradient-to-br group-hover:scale-105 transition-transform duration-200",
                    category.color,
                    styles.iconContainer
                  )}
                >
                  <IconComponent className={cn("text-white", styles.icon)} />
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "flex-1 min-w-0 relative z-10",
                    isRtl && "text-right"
                  )}
                >
                  <h3
                    className={cn(
                      "text-gray-900 group-hover:text-primary transition-colors",
                      "truncate font-semibold",
                      styles.title
                    )}
                  >
                    {category.title}
                  </h3>
                  {!styles.hideDescription && (
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Action indicator */}
                <div
                  className={cn(
                    "absolute top-2 sm:top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    isRtl ? "left-2 sm:left-2" : "right-2 sm:right-2"
                  )}
                >
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {t("learnMore")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </>
  );
}
