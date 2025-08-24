"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants, useReducedMotion } from "framer-motion";
import { useTranslations, useLocale } from 'next-intl';
import { 
  Shield, 
  Eye, 
  Heart, 
  Target, 
  Users2, 
  BookOpen,
  CheckCircle
} from "lucide-react";
import { type Locale } from "@/utilities/locale";
import { Media } from "@/components/Media";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedCounter } from "@/components/AnimatedCounter";
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
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const valueCardVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateY: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const statCounterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55], // Spring easing
    },
  },
};

export const AboutMissionBlock: React.FC<AboutMissionProps> = ({
  title,
  description,
  media,
  showStats = true,
}) => {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="section-spacing bg-gradient-to-br from-white via-gray-50/50 to-green-50/30"
    >
      <div className="hapa-container">
        {/* Section Header */}
        <SectionHeader
          title={title || t("aboutHapa")}
          description={description || t("aboutHapaDesc")}
          variant="main"
          alignment="center"
          showGradient={true}
          gradientSize="md"
          animate={!shouldReduceMotion}
        />

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
                <Image
                  src="/hapa-director-press-conference.webp"
                  alt="HAPA Director addressing media at official press conference"
                  width={1920}
                  height={1080}
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                  priority
                />
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
          <SectionHeader
            title={t("ourValues")}
            description={t("ourValuesDesc")}
            variant="subsection"
            alignment="center"
            showGradient={true}
            gradientSize="sm"
            animate={!shouldReduceMotion}
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={valueCardVariants}
                  whileHover={!shouldReduceMotion ? {
                    y: -8,
                    scale: 1.03,
                    transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] }
                  } : {}}
                  className="group perspective-1000"
                >
                  <div className={`${value.bgColor} rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 ease-out border border-white/70 hover:border-primary/30 backdrop-blur-sm transform-gpu`}>
                    <motion.div
                      whileHover={!shouldReduceMotion ? {
                        scale: 1.1,
                        rotate: 3,
                        transition: { duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] }
                      } : {}}
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 mx-auto shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {t(String(value.titleKey))}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(String(value.descKey))}
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
                    variants={statCounterVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.15 }}
                    viewport={{ once: true }}
                    whileHover={!shouldReduceMotion ? {
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    } : {}}
                    className="text-center group"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <AnimatedCounter
                      value={achievement.number}
                      duration={2.5}
                      className="text-3xl sm:text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 block"
                    />
                    <div className="text-white/90 text-sm sm:text-base">
                      {t(String(achievement.labelKey))}
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