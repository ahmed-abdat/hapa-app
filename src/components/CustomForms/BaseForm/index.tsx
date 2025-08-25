"use client";

import React, { ReactNode } from "react";
import { FormProvider, UseFormReturn, FieldValues } from "react-hook-form";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { FormTranslations } from "../types";

interface BaseFormProps<T extends FieldValues = FieldValues> {
  children: ReactNode;
  methods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  translations: FormTranslations;
  locale: "fr" | "ar";
  isLoading?: boolean;
  className?: string;
}

export function BaseForm<T extends FieldValues = FieldValues>({
  children,
  methods,
  onSubmit,
  translations,
  locale,
  isLoading = false,
  className = "",
}: BaseFormProps<T>) {
  const config = translations[locale] || translations["fr"]; // Fallback to French if locale not found

  return (
    <div className={className}>
      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {children}

          {/* Enhanced Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full overflow-hidden
                bg-gradient-to-r from-primary to-accent
                hover:from-primary/90 hover:to-accent/90
                disabled:from-primary/60 disabled:to-accent/60
                text-white font-semibold py-4 px-8 rounded-xl
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
                shadow-lg hover:shadow-xl hover:shadow-primary/25
                transform hover:scale-[1.02] active:scale-[0.98]
                disabled:transform-none disabled:cursor-not-allowed
                ${locale === "ar" ? "flex-row-reverse" : "flex-row"}
              `}
            >
              {/* Background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

              {/* Button content */}
              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    {/* Enhanced loading spinner */}
                    <div className="relative">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-white/30" />
                    </div>

                    {/* Loading text with fade effect */}
                    <span className="animate-pulse font-medium">
                      {locale === "fr"
                        ? "Envoi en cours..."
                        : "جاري الإرسال..."}
                    </span>

                    {/* Progress dots */}
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Submit text */}
                    <span className="font-medium">
                      {config.submitButtonText}
                    </span>

                    {/* Send icon placed after text for better UX in LTR/RTL */}
                    <Send className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </>
                )}
              </div>
            </button>

            {/* Success indicator (shown briefly after successful submission) */}
            <div
              className="mt-3 text-center opacity-0 transition-opacity duration-300"
              id="submit-success-indicator"
            >
              <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {locale === "fr"
                    ? "Formulaire soumis avec succès !"
                    : "تم إرسال النموذج بنجاح!"}
                </span>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
