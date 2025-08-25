"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FormSubmissionProgressProps {
  isVisible: boolean;
  stage:
    | "preparing"
    | "uploading"
    | "validating"
    | "saving"
    | "complete"
    | "error";
  progress: number;
  uploadStats?: {
    total: number;
    completed: number;
    failed: number;
  };
  errorMessage?: string;
  locale?: "fr" | "ar";
  onClose?: () => void;
}

const stageMessages = {
  fr: {
    preparing: "Préparation de la soumission...",
    uploading: "Téléchargement des fichiers...",
    validating: "Validation des données...",
    saving: "Enregistrement de la soumission...",
    complete: "Soumission réussie!",
    error: "Erreur lors de la soumission",
  },
  ar: {
    preparing: "إعداد الإرسال...",
    uploading: "رفع الملفات...",
    validating: "التحقق من البيانات...",
    saving: "حفظ الإرسال...",
    complete: "تم الإرسال بنجاح!",
    error: "خطأ في الإرسال",
  },
};

export function FormSubmissionProgress({
  isVisible,
  stage,
  progress,
  uploadStats,
  errorMessage,
  locale = "fr",
  onClose,
}: FormSubmissionProgressProps) {
  const t = useTranslations();
  const isRTL = locale === "ar";
  const messages = stageMessages[locale];

  const getStageIcon = () => {
    switch (stage) {
      case "preparing":
        return (
          <Clock className="h-5 w-5 text-blue-500 motion-safe:animate-pulse" />
        );
      case "uploading":
        return (
          <Upload className="h-5 w-5 text-blue-500 motion-safe:animate-bounce" />
        );
      case "validating":
      case "saving":
        return (
          <Clock className="h-5 w-5 text-blue-500 motion-safe:animate-spin" />
        );
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgressColor = () => {
    switch (stage) {
      case "complete":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "uploading":
        return "bg-blue-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          dir={isRTL ? "rtl" : "ltr"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4,
            }}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center gap-3 mb-4 motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:fade-in motion-safe:duration-700",
                isRTL && "flex-row-reverse"
              )}
            >
              <div className="motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-500 motion-safe:delay-300">
                {getStageIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  <bdi>{messages[stage]}</bdi>
                </h3>
                {uploadStats && stage === "uploading" && (
                  <p className="text-sm text-gray-600 mt-1">
                    <bdi>
                      {uploadStats.completed}/{uploadStats.total}{" "}
                      {t("filesUploaded")}
                      {uploadStats.failed > 0 &&
                        ` (${uploadStats.failed} ${t("uploadFailures")})`}
                    </bdi>
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 motion-safe:animate-in motion-safe:slide-in-from-left motion-safe:fade-in motion-safe:duration-500 motion-safe:delay-500">
              <Progress
                value={progress}
                className={cn(
                  "h-3 transition-all duration-500",
                  stage === "error" && "opacity-50"
                )}
              />
              <div
                className={cn(
                  "flex justify-between items-center mt-2 text-sm text-gray-600 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:delay-700",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span>{Math.round(progress)}%</span>
                {stage === "uploading" && uploadStats && (
                  <span>
                    <bdi>
                      {uploadStats.completed + uploadStats.failed}/
                      {uploadStats.total}
                    </bdi>
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {stage === "error" && errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:fade-in motion-safe:duration-300">
                <div
                  className={cn(
                    "flex items-start gap-2",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    <bdi>{errorMessage}</bdi>
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {stage === "complete" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 motion-safe:animate-in motion-safe:zoom-in motion-safe:fade-in motion-safe:duration-500">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300 motion-safe:delay-200" />
                  <p className="text-sm text-green-700">
                    <bdi>{t("submissionSuccessfullyRecorded")}</bdi>
                  </p>
                </div>
              </div>
            )}

            {/* Upload Details for Error State */}
            {stage === "error" && uploadStats && uploadStats.failed > 0 && (
              <div className="text-xs text-gray-500 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:delay-1000">
                <bdi>
                  {t("filesSuccessful")}: {uploadStats.completed},
                  {t("failures")}: {uploadStats.failed}
                </bdi>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
