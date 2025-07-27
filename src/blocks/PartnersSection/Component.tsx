"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  Award,
  Globe,
  Handshake
} from "lucide-react";
import { useTranslations } from "next-intl"; 
import { type Locale, getLocaleDirection } from "@/utilities/locale";

type Partner = {
  name: string;
  logoPath?: string;
  url?: string;
  description?: {
    fr: string;
    ar: string;
  } | string;
};

type PartnersSectionProps = {
  title?: string;
  description?: string;
  showTrustMetrics?: boolean;
  showPartnerLogos?: boolean;
  partners?: Partner[];
};

// Partner data with actual logos from /public/partners
const mockPartners = [
  {
    name: "CNRA - Conseil National de Régulation de l'Audiovisuel",
    logoPath: "/partners/CNRA-logo.jpg",
    url: "https://cnra.sn/",
    description: {
      fr: "Autorité de régulation audiovisuelle du Sénégal",
      ar: "سلطة تنظيم البث السمعي البصري في السنغال"
    }
  },
  {
    name: "RDM - Réseau des Régulateurs des Médias",
    logoPath: "/partners/RDM-logo.jpg", 
    url: "https://rdm-network.org/",
    description: {
      fr: "Réseau international des régulateurs des médias",
      ar: "الشبكة الدولية لمنظمي وسائل الإعلام"
    }
  },
  {
    name: "HAICA - Haute Autorité Indépendante de la Communication Audiovisuelle",
    logoPath: "/partners/logo-HAICA.jpg",
    url: "https://haica.tn/",
    description: {
      fr: "Autorité de régulation audiovisuelle de Tunisie",
      ar: "الهيئة العليا المستقلة للاتصال السمعي البصري في تونس"
    }
  },
  {
    name: "ARCOM - Autorité de Régulation de la Communication",
    logoPath: "/partners/logo_ar_logo.jpg",
    url: "https://arcom.fr/",
    description: {
      fr: "Autorité française de régulation de la communication",
      ar: "السلطة الفرنسية لتنظيم الاتصالات"
    }
  },
  {
    name: "RE - Regulatory Entity",
    logoPath: "/partners/re-logo.jpg",
    url: "#",
    description: {
      fr: "Entité de régulation partenaire",
      ar: "كيان تنظيمي شريك"
    }
  },
  {
    name: "RIARC - Réseau des Instances Africaines de Régulation de la Communication",
    logoPath: "/partners/riarc.jpg",
    url: "https://riarc.org/",
    description: {
      fr: "Réseau des instances africaines de régulation de la communication",
      ar: "شبكة الهيئات الأفريقية لتنظيم الاتصالات"
    }
  }
];

// Removed unused trustMetrics and certifications arrays

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

export const PartnersSectionBlock: React.FC<PartnersSectionProps> = ({
  title,
  description,
  showTrustMetrics: _showTrustMetrics = true,
  showPartnerLogos = true,
  partners = mockPartners,
}) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const direction = getLocaleDirection(locale);
  const t = useTranslations();

  return (
    <section
      className="section-spacing bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30"
      dir={direction}
    >
      <div className="hapa-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="header-spacing"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {title || t("partnersAndTrust")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {description || t("partnersAndTrustDesc")}
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-6 sm:mt-8 rounded-full" />
        </motion.div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-16 md:mb-20">
          
          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, x: direction === "rtl" ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-3xl p-6 sm:p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {t("certifications")}
                </h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Certifications feature removed - can be added back when needed */}
                <p className="text-gray-600 text-center py-8">
                  Certifications coming soon
                </p>
              </div>
            </div>
          </motion.div>

          {/* International Standards */}
          <motion.div
            initial={{ opacity: 0, x: direction === "rtl" ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 sm:p-8 border border-blue-200">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {t("internationalStandards")}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-xl">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">
                    UNESCO Media Freedom Standards
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("unescoCompliance")}
                  </p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">
                    African Union Media Guidelines  
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("auMediaCompliance")}
                  </p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">
                    European Broadcasting Standards
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("euBroadcastingCompliance")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partners Logos */}
        {showPartnerLogos && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("ourPartners")}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                {t("ourPartnersDesc")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  {partner.url && partner.url !== "#" ? (
                    <a 
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                    >
                      {/* Partner Logo */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200">
                        {partner.logoPath ? (
                          <Image
                            src={partner.logoPath}
                            alt={`${partner.name} logo`}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                            unoptimized
                          />
                        ) : (
                          <Handshake className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                        )}
                      </div>
                    </a>
                  ) : (
                    <div className="block bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-sm">
                      {/* Partner Logo */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200">
                        {partner.logoPath ? (
                          <Image
                            src={partner.logoPath}
                            alt={`${partner.name} logo`}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                            unoptimized
                          />
                        ) : (
                          <Handshake className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};