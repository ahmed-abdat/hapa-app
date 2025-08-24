"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Building } from "lucide-react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

interface ContactUsHeroProps {
  locale: Locale;
}

// Contact information data
const contactInfo = {
  fr: {
    title: "Contactez-nous",
    subtitle: "Nous sommes à votre disposition pour répondre à vos questions et vous accompagner dans vos démarches.",
    address: {
      label: "Adresse",
      value: "Avenue Gamal Abdel Nasser, Nouakchott, Mauritanie"
    },
    phone: {
      label: "Téléphone",
      value: "+222 45 25 26 27"
    },
    email: {
      label: "Email",
      value: "contact@hapa.mr"
    },
    hours: {
      label: "Horaires d'ouverture",
      value: "Lundi - Vendredi: 8h00 - 16h00"
    },
    office: {
      label: "Bureau principal",
      value: "Siège social HAPA"
    }
  },
  ar: {
    title: "اتصل بنا",
    subtitle: "نحن في خدمتكم للإجابة على أسئلتكم ومرافقتكم في إجراءاتكم.",
    address: {
      label: "العنوان",
      value: "شارع جمال عبد الناصر، نواكشوط، موريتانيا"
    },
    phone: {
      label: "الهاتف",
      value: "+222 45 25 26 27"
    },
    email: {
      label: "البريد الإلكتروني",
      value: "contact@hapa.mr"
    },
    hours: {
      label: "ساعات العمل",
      value: "الاثنين - الجمعة: 8:00 - 16:00"
    },
    office: {
      label: "المكتب الرئيسي",
      value: "المقر الرئيسي لهابا"
    }
  }
};

export const ContactUsHero: React.FC<ContactUsHeroProps> = ({ locale }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const content = contactInfo[locale];

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  return (
    <div
      className="relative -mt-[10.4rem] min-h-screen overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5"
      dir={direction}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.1)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <Image
            src="/hero.png"
            alt="HAPA Background"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center pt-[10.4rem] pb-20">
        <div className="hapa-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Side: Title and Description */}
            <div className="space-y-8 text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-primary">
                  {content.title}
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto lg:ms-0" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {content.subtitle}
              </motion.p>

              {/* Contact Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0"
              >
                <div className="text-center lg:text-start">
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-gray-600">
                    {locale === 'ar' ? 'وقت الاستجابة' : 'Temps de réponse'}
                  </div>
                </div>
                <div className="text-center lg:text-start">
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-gray-600">
                    {locale === 'ar' ? 'معدل الرضا' : 'Taux de satisfaction'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Contact Information Cards */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-4"
              >
                {/* Address Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{content.address.label}</h3>
                      <p className="text-gray-600">{content.address.value}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{content.phone.label}</h3>
                      <p className="text-gray-600 font-mono" dir="ltr">{content.phone.value}</p>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{content.email.label}</h3>
                      <p className="text-gray-600">{content.email.value}</p>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{content.hours.label}</h3>
                      <p className="text-gray-600">{content.hours.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Office Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{content.office.value}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};