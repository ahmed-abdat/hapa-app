import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, ArrowLeft, AlertTriangle, MessageCircle, CheckCircle, HelpCircle } from "lucide-react";

export const MediaReportingCTA: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <div className="hapa-container">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight ${isRtl ? 'text-right' : 'text-left'} sm:text-center`}>
            {t("mediaReportingCTATitle")}
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 leading-relaxed ${isRtl ? 'text-right' : 'text-left'} sm:text-center`}>
            {t("mediaReportingCTASubtitle")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Report Content Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Card Header */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
              <div className={`flex items-center gap-4`}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {t("reportContentCardTitle")}
                  </h3>
                  <div className="w-16 h-0.5 bg-white/50 mt-2" />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              <p className={`text-gray-600 leading-relaxed`}>
                {t("reportContentCardDesc")}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {(t.raw("reportContentCardFeatures") as string[]).map((feature, index) => (
                  <div key={index} className={`flex items-center gap-3`}>
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className={`text-sm text-gray-700`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link 
                href="/forms/media-content-report" 
                className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-center group-hover:shadow-lg"
              >
                <span className={`flex items-center justify-center gap-2`}>
                  <span>{t("startReport")}</span>
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </Link>
            </div>
          </div>

          {/* Complaint Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Card Header */}
            <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
              <div className={`flex items-center gap-4`}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {t("complaintCardTitle")}
                  </h3>
                  <div className="w-16 h-0.5 bg-white/50 mt-2" />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              <p className={`text-gray-600 leading-relaxed`}>
                {t("complaintCardDesc")}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {(t.raw("complaintCardFeatures") as string[]).map((feature, index) => (
                  <div key={index} className={`flex items-center gap-3`}>
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className={`text-sm text-gray-700`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link 
                href="/forms/media-content-complaint" 
                className="block w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-center group-hover:shadow-lg"
              >
                <span className={`flex items-center justify-center gap-2`}>
                  <span>{t("fileComplaint")}</span>
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-gray-700 text-sm">
              {t("ctaHelpText")}
            </span>
            <Link 
              href="/contact" 
              className="text-primary hover:text-accent font-medium text-sm transition-colors underline decoration-2 underline-offset-2"
            >
              {t("ctaHelpLink")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};