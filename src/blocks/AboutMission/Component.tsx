"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useTranslations } from 'next-intl';
import { 
  Shield, 
  Eye, 
  Heart, 
  Target, 
  Users2, 
  Scale, 
  BookOpen,
  CheckCircle
} from "lucide-react";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import { Media } from "@/components/Media";
import type { Media as MediaType } from "@/payload-types";

type AboutMissionProps = {
  title?: string;
  description?: string;
  media?: MediaType;
  showStats?: boolean;
};

const missionValues = [
  {
    icon: Shield,
    titleKey: "independenceIntegrity",
    descKey: "independenceIntegrityDesc",
    color: "from-primary to-accent",
    bgColor: "bg-green-50",
  },
  {
    icon: Eye,
    titleKey: "transparencyAccountability", 
    descKey: "transparencyAccountabilityDesc",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Heart,
    titleKey: "publicService",
    descKey: "publicServiceDesc",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: Target,
    titleKey: "professionalExcellence",
    descKey: "professionalExcellenceDesc",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
];

const achievements = [
  {
    number: "15+",
    labelKey: "yearsExperience",
    icon: BookOpen,
  },
  {
    number: "450+",
    labelKey: "registeredJournalists",
    icon: Users2,
  },
  {
    number: "40+",
    labelKey: "mediaOperators",
    icon: Shield,
  },
  {
    number: "89%",
    labelKey: "complaintsResolved",
    icon: CheckCircle,
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

export const AboutMissionBlock: React.FC<AboutMissionProps> = ({
  title,
  description,
  media,
  showStats = true,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const t = useTranslations();

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-gray-50/50 to-green-50/30"
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {title || t("aboutHapa")}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || t("aboutHapaDesc")}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-8 rounded-full" />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-16">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("ourMission")}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("ourMissionDesc")}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("ourVision")}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("ourVisionDesc")}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("ourMandate")}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("ourMandateDesc")}
              </p>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {media && typeof media === "object" ? (
                <Media
                  resource={media}
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] sm:h-[500px] bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                  <Scale className="h-24 w-24 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Stats Card */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="absolute -bottom-8 -left-4 sm:-left-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 backdrop-blur-sm"
              >
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">15+</div>
                    <div className="text-sm text-gray-600">{t("yearsExperience")}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">89%</div>
                    <div className="text-sm text-gray-600">{t("successRate")}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("ourValues")}
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("ourValuesDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <div className={`${value.bgColor} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 ease-out border border-white/70 hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.02] backdrop-blur-sm`}>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-[1.05] group-hover:rotate-1 transition-all duration-300 ease-out shadow-md`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {t(value.titleKey)}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(value.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievement Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 sm:p-12 text-white"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                {t("ourImpact")}
              </h3>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                {t("ourImpactDesc")}
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
                      {achievement.number}
                    </div>
                    <div className="text-white/90 text-sm sm:text-base">
                      {t(achievement.labelKey)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};