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
import { type Locale } from "@/utilities/locale";

type MediaSpaceProps = {
  title?: string;
  description?: string;
};

const mediaCategories = [
  {
    icon: Radio,
    titleKey: "radioStations",
    descKey: "radioStationsDesc",
    href: "/espace-mediatique/radio",
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
    href: "/espace-mediatique/television",
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
    href: "/espace-mediatique/digital",
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
    href: "/espace-mediatique/print",
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
  const isRtl = locale === "ar";
  const t = useTranslations();

  return (
    <section className="section-spacing-lg bg-gradient-to-br from-white via-gray-50/50 to-primary/5">
      <div className="hapa-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="header-spacing"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {title || t("mediaSpace")}
          </h2>
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
                    className={`${category.bgColor} ${category.hoverColor} rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-500 ease-out border border-white/70 hover:border-primary/30 hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col backdrop-blur-sm relative overflow-hidden`}
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

        {/* CTA removed as per request (previously rendered 'viewAllMedia' link) */}
      </div>
    </section>
  );
};
