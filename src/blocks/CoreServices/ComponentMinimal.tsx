"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  Tv,
  UserCheck,
  MessageSquareWarning,
  FileText,
  Scale,
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from 'next-intl';
import { type Locale, getLocaleDirection } from "@/utilities/locale";

type CoreServicesMinimalProps = {
  title?: string;
  description?: string;
};

const services = [
  {
    icon: Tv,
    titleKey: "mediaLicensing",
    descKey: "mediaLicensingDesc",
    href: "/services/media-licensing",
  },
  {
    icon: UserCheck,
    titleKey: "professionalRegistration",
    descKey: "professionalRegistrationDesc",
    href: "/services/professional-registration",
  },
  {
    icon: MessageSquareWarning,
    titleKey: "publicComplaints",
    descKey: "publicComplaintsDesc",
    href: "/services/complaints",
  },
  {
    icon: FileText,
    titleKey: "officialDocuments",
    descKey: "officialDocumentsDesc",
    href: "/documents",
  },
  {
    icon: Scale,
    titleKey: "legalFramework",
    descKey: "legalFrameworkDesc",
    href: "/legal",
  },
  {
    icon: Phone,
    titleKey: "informationServices",
    descKey: "informationServicesDesc",
    href: "/contact",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export const CoreServicesMinimalBlock: React.FC<CoreServicesMinimalProps> = ({
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
      className="py-12 sm:py-16 md:py-20 bg-white"
      dir={direction}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title || t('coreServices')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description || t('coreServicesDesc')}
          </p>
        </motion.div>

        {/* Services List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <Link href={service.href} className="block">
                  <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                        {t(service.titleKey as any)}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {t(service.descKey as any)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {isRtl ? (
                        <ArrowLeft className="h-5 w-5 text-primary" />
                      ) : (
                        <ArrowRight className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-gray-600 mb-4">
            {t('needHelp')}
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors duration-300"
          >
            <span>{t('contactSupport')}</span>
            {isRtl ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};