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
import { getTranslation, translations } from "@/utilities/translations";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

type CoreServicesGridPatternProps = {
  title?: string;
  description?: string;
};

const services = [
  {
    icon: Tv,
    titleKey: "mediaLicensing",
    descKey: "mediaLicensingDesc",
    href: "/services/media-licensing",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
  },
  {
    icon: UserCheck,
    titleKey: "professionalRegistration",
    descKey: "professionalRegistrationDesc",
    href: "/services/professional-registration",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
  },
  {
    icon: MessageSquareWarning,
    titleKey: "publicComplaints",
    descKey: "publicComplaintsDesc",
    href: "/services/complaints",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
  },
  {
    icon: FileText,
    titleKey: "officialDocuments",
    descKey: "officialDocumentsDesc",
    href: "/documents",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
  },
  {
    icon: Scale,
    titleKey: "legalFramework",
    descKey: "legalFrameworkDesc",
    href: "/legal",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
  },
  {
    icon: Phone,
    titleKey: "informationServices",
    descKey: "informationServicesDesc",
    href: "/contact",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
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

export const CoreServicesGridPatternBlock: React.FC<CoreServicesGridPatternProps> = ({
  title,
  description,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden"
      dir={direction}
    >
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#065986_1px,transparent_1px),linear-gradient(to_bottom,#065986_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {title || getTranslation("coreServices", locale)}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || getTranslation("coreServicesDesc", locale)}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-8 rounded-full" />
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group h-full"
              >
                <Link href={service.href} className="block h-full">
                  <div
                    className={`${service.bgColor} ${service.hoverColor} rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-white/70 hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.005] h-full flex flex-col backdrop-blur-sm relative overflow-hidden`}
                  >
                    {/* Subtle grid pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#065986_1px,transparent_1px),linear-gradient(to_bottom,#065986_1px,transparent_1px)] bg-[size:12px_12px]" />
                    </div>
                    
                    {/* Icon */}
                    <div
                      className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-[1.02] group-hover:rotate-1 transition-all duration-300 ease-out shadow-md relative z-10`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow relative z-10">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 ease-out">
                        {getTranslation(
                          service.titleKey as keyof typeof translations.fr,
                          locale
                        )}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {getTranslation(
                          service.descKey as keyof typeof translations.fr,
                          locale
                        )}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200/40 relative z-10">
                      <span className="text-primary font-medium text-sm sm:text-base">
                        {getTranslation("learnMore", locale)}
                      </span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-[1.02] transition-all duration-300 ease-out">
                        {isRtl ? (
                          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 text-primary group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300 ease-out" />
                        ) : (
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 ease-out" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};