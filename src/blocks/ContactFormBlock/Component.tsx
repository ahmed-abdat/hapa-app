'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ContactForm } from '@/components/CustomForms/ContactForm'
import { FormSubmissionResponse } from '@/components/CustomForms/types'
import { MessageCircle, Send, Phone, MapPin, Mail, Clock } from 'lucide-react'
import { getLocaleDirection } from '@/utilities/locale'

interface ContactFormBlockProps {
  locale?: 'fr' | 'ar'
  [key: string]: unknown // Allow other props from Payload
}

const content = {
  fr: {
    formTitle: "Envoyez-nous un message",
    formSubtitle: "Nous vous répondrons dans les plus brefs délais",
    contactInfo: "Informations de contact",
    alternativeContact: "Autres moyens de contact",
    quickContact: "Contact rapide",
    address: "Avenue Gamal Abdel Nasser, Nouakchott",
    phone: "+222 45 25 26 27",
    email: "contact@hapa.mr",
    hours: "Lun - Ven: 8h00 - 16h00"
  },
  ar: {
    formTitle: "أرسل لنا رسالة",
    formSubtitle: "سنرد عليك في أقرب وقت ممكن",
    contactInfo: "معلومات الاتصال",
    alternativeContact: "وسائل الاتصال الأخرى",
    quickContact: "اتصال سريع",
    address: "شارع جمال عبد الناصر، نواكشوط",
    phone: "+222 45 25 26 27",
    email: "contact@hapa.mr",
    hours: "الاثنين - الجمعة: 8:00 - 16:00"
  }
}

export function ContactFormBlock({ locale = 'fr' }: ContactFormBlockProps) {
  const direction = getLocaleDirection(locale)
  const t = content[locale]

  const handleSuccess = (_response: FormSubmissionResponse) => {
    // Form submitted successfully - logged via payload.logger
    // You can add additional success handling here (e.g., analytics, redirects)
  }

  const handleError = (_error: string) => {
    // Form submission error - logged via payload.logger
    // You can add additional error handling here (e.g., error tracking)
  }

  return (
    <div className="section-spacing-lg bg-gradient-to-br from-gray-50 via-white to-primary/5" dir={direction}>
      <div className="hapa-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Form - Takes 2/3 of the space */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {t.formTitle}
                  </h2>
                </div>
                <p className="text-gray-600 text-lg">
                  {t.formSubtitle}
                </p>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mt-4" />
              </div>

              <ContactForm 
                locale={locale}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </motion.div>

          {/* Contact Information Sidebar - Takes 1/3 of the space */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Information Card */}
            <div className="bg-primary rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t.contactInfo}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">
                      {locale === 'ar' ? 'العنوان' : 'Adresse'}
                    </p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {t.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">
                      {locale === 'ar' ? 'الهاتف' : 'Téléphone'}
                    </p>
                    <p className="text-white/90 font-mono text-sm">
                      {t.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <p className="text-white/90 text-sm">
                      {t.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">
                      {locale === 'ar' ? 'ساعات العمل' : 'Horaires'}
                    </p>
                    <p className="text-white/90 text-sm">
                      {t.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                {t.quickContact}
              </h4>
              <div className="space-y-3">
                <a 
                  href={`tel:${t.phone}`}
                  className="block w-full bg-primary/5 hover:bg-primary/10 rounded-lg p-3 text-center text-primary font-medium transition-colors duration-200"
                >
                  {locale === 'ar' ? 'اتصل الآن' : 'Appeler maintenant'}
                </a>
                <a 
                  href={`mailto:${t.email}`}
                  className="block w-full bg-accent/5 hover:bg-accent/10 rounded-lg p-3 text-center text-accent font-medium transition-colors duration-200"
                >
                  {locale === 'ar' ? 'أرسل بريد إلكتروني' : 'Envoyer un email'}
                </a>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-secondary/10 rounded-xl p-4 border-l-4 border-secondary">
              <p className="text-sm text-gray-700">
                <strong className="text-primary">
                  {locale === 'ar' ? 'للحالات الطارئة:' : 'Pour les urgences:'}
                </strong><br />
                {locale === 'ar' 
                  ? 'اتصل مباشرة بالرقم أعلاه أو قم بزيارة مكاتبنا.'
                  : 'Appelez directement le numéro ci-dessus ou visitez nos bureaux.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}