import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MessageCircle, Shield, Clock, UserCheck } from "lucide-react";

import { DynamicMediaContentComplaintForm } from "@/components/CustomForms/DynamicMediaContentComplaintForm";
import { isValidLocale } from "@/utilities/locale";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations();

  return {
    title: t("mediaContentComplaintTitle"),
    description: t("mediaContentComplaintDesc"),
    openGraph: {
      title: t("mediaContentComplaintTitle"),
      description: t("mediaContentComplaintDesc"),
      type: "website",
    },
  };
}

export default async function MediaContentComplaintPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="bg-white/20 rounded-full p-2 md:p-3">
                <MessageCircle className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              {t("mediaContentComplaintTitle")}
            </h1>
            <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              {t("mediaContentComplaintDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards - Mobile Optimized */}
      <div className="container mx-auto px-4 -mt-4 md:-mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* Official Response */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">
                  {t("officialResponse")}
                </h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t("officialResponseDesc")}
              </p>
            </div>

            {/* Legal Protection */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">
                  {t("legalProtection")}
                </h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t("legalProtectionDesc")}
              </p>
            </div>

            {/* Follow-up Guaranteed */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">
                  {t("followupGuaranteed")}
                </h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t("followupGuaranteedDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice - Mobile Optimized */}
      <div className="container mx-auto px-4 mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 md:p-5">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 rounded-lg p-1.5 md:p-2 flex-shrink-0">
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-1.5 md:mb-2 text-sm md:text-base">
                  {t("officialComplaint")}
                </h3>
                <p className="text-primary/80 text-xs md:text-sm leading-relaxed">
                  {t("officialComplaintNotice")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <DynamicMediaContentComplaintForm />
        </div>
      </div>

      {/* Help Section - Mobile Optimized */}
      <div className="bg-gray-50 py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
              {t("processQuestionsTitle")}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">{t("guidanceText")}</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium text-sm md:text-base"
              >
                {t("contactUs")}
              </a>
              <a
                href={`/${locale}/forms/media-content-report`}
                className="inline-flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium text-sm md:text-base"
              >
                {t("simpleReportText")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "ar" }];
}
