"use client";

import React from "react";
import { useField, FieldLabel, useDocumentInfo } from "@payloadcms/ui";
import { getMediaChannelLabel } from "@/lib/media-mappings";
import { logger } from "@/utilities/logger";

type LocalizedChannelFieldProps = {
  field: {
    name: string;
    label?: Record<string, string> | string;
    required?: boolean;
    admin?: {
      description?: Record<string, string> | string;
    };
  };
  path: string;
};

/**
 * Custom field component that displays media channel names in the submission's language
 * rather than the Payload CMS admin language
 */
const LocalizedChannelField: React.FC<LocalizedChannelFieldProps> = ({
  field,
  path,
}) => {
  const { value } = useField<string>({ path });
  const documentInfo = useDocumentInfo();

  // Get the submission's locale from the document data
  const submissionLocale = (documentInfo?.data?.locale || "fr") as "fr" | "ar";

  // Get the media type from the document data
  const mediaType =
    documentInfo?.data?.contentInfo?.mediaType ||
    documentInfo?.data?.mediaType ||
    "";

  // Get localized label based on submission locale, not admin locale
  const displayValue = React.useMemo((): string => {
    if (!value || typeof value !== "string") {
      return submissionLocale === "ar" ? "غير محدد" : "Non spécifié";
    }

    try {
      // Clean the value first - remove any technical keys in parentheses
      let cleanValue = value;
      
      // Remove technical keys like "(radio_jeunesse)" from display
      cleanValue = cleanValue.replace(/\([^)]*\)$/, '').trim();
      
      // If the clean value is empty after removing parentheses, use the original value
      if (!cleanValue) {
        cleanValue = value;
      }

      // Determine if this is radio or television
      const channelType = mediaType?.toLowerCase().includes("radio")
        ? "radio"
        : mediaType?.toLowerCase().includes("télévision") ||
          mediaType?.toLowerCase().includes("television")
        ? "television"
        : null;

      if (!channelType) {
        return cleanValue; // Return cleaned value if we can't determine the type
      }

      // Get the localized label for the clean value
      const localizedLabel = getMediaChannelLabel(cleanValue, channelType, submissionLocale);
      
      // If the localized label is the same as the clean value, 
      // try with the original value (in case it's a technical key)
      if (localizedLabel === cleanValue && cleanValue !== value) {
        return getMediaChannelLabel(value, channelType, submissionLocale);
      }
      
      return localizedLabel;
    } catch (error) {
      logger.error("Error getting localized channel label", {
        component: "LocalizedChannelField",
        action: "get_label",
        metadata: {
          value,
          mediaType,
          submissionLocale,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      
      // Fallback: return clean value without technical keys
      const cleanFallback = String(value).replace(/\([^)]*\)$/, '').trim();
      return cleanFallback || String(value);
    }
  }, [value, mediaType, submissionLocale]);

  // Determine the icon based on media type
  const icon: string = React.useMemo((): string => {
    if (mediaType?.toLowerCase().includes("radio")) {
      return "📻";
    } else if (
      mediaType?.toLowerCase().includes("télévision") ||
      mediaType?.toLowerCase().includes("television")
    ) {
      return "📺";
    } else if (mediaType?.toLowerCase().includes("site")) {
      return "🌐";
    }
    return "📡";
  }, [mediaType]);

  const isRTL = submissionLocale === "ar";

  // Get field label
  const fieldLabel =
    typeof field.label === "string"
      ? field.label
      : (field.label as Record<string, string>)?.[submissionLocale] ||
        (field.label as Record<string, string>)?.fr ||
        "Channel/Station";

  // Get field description
  const fieldDescription = field.admin?.description
    ? typeof field.admin.description === "string"
      ? field.admin.description
      : (field.admin.description as Record<string, string>)?.[
          submissionLocale
        ] ||
        (field.admin.description as Record<string, string>)?.fr ||
        ""
    : "";

  return (
    <div className="field-type text">
      <FieldLabel
        htmlFor={`field-${path}`}
        label={fieldLabel}
        required={field.required}
      />
      <div
        className="field-value-wrapper"
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "6px",
          padding: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          className="field-value styled-read-only"
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            padding: "10px 12px",
            minHeight: "38px",
            display: "flex",
            alignItems: "center",
            direction: isRTL ? "rtl" : "ltr",
            transition: "all 0.2s ease",
          }}
        >
          {/* Icon */}
          <span
            style={{
              fontSize: "18px",
              flexShrink: 0,
              marginRight: isRTL ? "0" : "10px",
              marginLeft: isRTL ? "10px" : "0",
            }}
          >
            {String(icon)}
          </span>

          <span
            className="value-display"
            style={{
              flex: 1,
              fontSize: "14px",
              color: value ? "#111827" : "#9ca3af",
              fontStyle: !value ? "italic" : "normal",
              fontWeight: value ? "500" : "normal",
              lineHeight: "1.5",
            }}
          >
            {displayValue}
          </span>

          {/* Channel type badge */}
          {value && (
            <span
              style={{
                fontSize: "11px",
                color: "#6b7280",
                fontFamily: "monospace",
                backgroundColor:
                  mediaType?.toLowerCase().includes("radio")
                    ? "#fef3c7"
                    : mediaType?.toLowerCase().includes("télévision") ||
                      mediaType?.toLowerCase().includes("television")
                    ? "#dbeafe"
                    : "#f3f4f6",
                padding: "3px 8px",
                borderRadius: "3px",
                marginLeft: isRTL ? "0" : "8px",
                marginRight: isRTL ? "8px" : "0",
                border: `1px solid ${
                  mediaType?.toLowerCase().includes("radio")
                    ? "#fde68a"
                    : mediaType?.toLowerCase().includes("télévision") ||
                      mediaType?.toLowerCase().includes("television")
                    ? "#93c5fd"
                    : "#e5e7eb"
                }`,
              }}
            >
              {mediaType?.toLowerCase().includes("radio")
                ? "Radio"
                : mediaType?.toLowerCase().includes("télévision") ||
                  mediaType?.toLowerCase().includes("television")
                ? "TV"
                : "Media"}
            </span>
          )}
        </div>

        {/* Description */}
        {fieldDescription && (
          <div
            className="field-description"
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#6b7280",
              direction: isRTL ? "rtl" : "ltr",
              paddingLeft: isRTL ? "0" : "28px",
              paddingRight: isRTL ? "28px" : "0",
            }}
          >
            {fieldDescription}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalizedChannelField;
