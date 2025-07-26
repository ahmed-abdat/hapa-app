"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  Radio,
  Tv,
  Globe,
  Newspaper,
  ArrowRight,
  ArrowLeft,
  Building,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

type MediaSpaceProps = {
  title?: string;
  description?: string;
};

const mediaCategories = [
  {
    icon: Radio,
    titleKey: "radioStations",
    descKey: "radioStationsDesc",
    href: "/media/radio",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
    count: "12+",
    countKey: "licensedStations",
  },
  {
    icon: Tv,
    titleKey: "televisionChannels",
    descKey: "televisionChannelsDesc",
    href: "/media/television", 
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    count: "8+",
    countKey: "broadcastChannels",
  },
  {
    icon: Globe,
    titleKey: "newsWebsites",
    descKey: "newsWebsitesDesc",
    href: "/media/digital",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    count: "25+",
    countKey: "digitalPlatforms",
  },
  {
    icon: Newspaper,
    titleKey: "pressMagazines",
    descKey: "pressMagazinesDesc",
    href: "/media/print",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
    count: "15+",
    countKey: "printPublications",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export const MediaSpaceBlock: React.FC<MediaSpaceProps> = ({
  title,
  description,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";
  const t = useTranslations();

  return (
    <section
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-white via-gray-50/50 to-primary/5"
      dir={direction}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center mb-6">
            <Building className="h-8 w-8 sm:h-10 sm:w-10 text-primary mr-3" />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              {title || t("mediaSpace")}
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || t("mediaSpaceDesc")}
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-8 rounded-full" />
        </motion.div>

        {/* Media Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto"
        >
          {mediaCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group h-full"
              >
                <Link href={category.href} className="block h-full">
                  <div
                    className={`${category.bgColor} ${category.hoverColor} rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out border border-white/70 hover:border-primary/30 hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col backdrop-blur-sm relative overflow-hidden`}
                  >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 -translate-y-4 translate-x-4">
                      <Icon className="w-full h-full" />
                    </div>

                    {/* Icon and Count */}
                    <div className="relative z-10 flex items-start justify-between mb-6">
                      <div
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-[1.05] group-hover:rotate-2 transition-all duration-500 ease-out shadow-lg`}
                      >
                        <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                          {category.count}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {t(category.countKey as any)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow relative z-10">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 ease-out line-clamp-2">
                        {t(category.titleKey as any)}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-3">
                        {t(category.descKey as any)}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 relative z-10">
                      <span className="text-primary font-semibold text-sm sm:text-base group-hover:text-accent transition-colors duration-300">
                        {t("viewDirectory")}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-[1.05] transition-all duration-300 ease-out">
                        {isRtl ? (
                          <ArrowLeft className="h-4 w-4 text-primary group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300 ease-out" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 ease-out" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Optional CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            href="/media"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            <Building className="h-5 w-5" />
            {t("viewAllMedia")}
            {isRtl ? (
              <ArrowLeft className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};