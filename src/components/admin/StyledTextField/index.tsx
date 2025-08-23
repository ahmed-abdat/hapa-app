"use client";

import React from "react";
import { useField, FieldLabel, useDocumentInfo } from "@payloadcms/ui";

type StyledTextFieldProps = {
  field: {
    name: string;
    label?: Record<string, string> | string;
    required?: boolean;
    admin?: {
      description?: Record<string, string> | string;
      icon?: string;
    };
  };
  path: string;
};

/**
 * Styled text field component for better visual presentation in admin
 */
const StyledTextField: React.FC<StyledTextFieldProps> = ({ field, path }) => {
  const { value } = useField({ path });
  const documentInfo = useDocumentInfo();

  // Get the submission's locale from the document data
  const submissionLocale = (documentInfo?.data?.locale || "fr") as "fr" | "ar";
  const isRTL = submissionLocale === "ar";

  // Get the field label
  const label =
    typeof field.label === "string"
      ? field.label
      : (field.label as Record<string, string>)?.[submissionLocale] ||
        (field.label as Record<string, string>)?.fr ||
        "Field";

  // Get the field description
  const description = field.admin?.description
    ? typeof field.admin.description === "string"
      ? field.admin.description
      : (field.admin.description as Record<string, string>)?.[
          submissionLocale
        ] ||
        (field.admin.description as Record<string, string>)?.fr ||
        ""
    : "";

  const displayValue = value || (isRTL ? "غير محدد" : "Non spécifié");
  const icon = field.admin?.icon || "📝";

  return (
    <div className="field-type text">
      <FieldLabel
        htmlFor={`field-${path}`}
        label={label}
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
              fontSize: "16px",
              flexShrink: 0,
              marginRight: isRTL ? "0" : "10px",
              marginLeft: isRTL ? "10px" : "0",
              opacity: 0.7,
            }}
          >
            {icon}
          </span>

          {/* Value */}
          <span
            className="value-display"
            style={{
              flex: 1,
              fontSize: "14px",
              color: value ? "#111827" : "#9ca3af",
              fontStyle: !value ? "italic" : "normal",
              lineHeight: "1.5",
            }}
          >
            {displayValue as string}
          </span>

        </div>

        {/* Description */}
        {description && (
          <div
            className="field-description"
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#6b7280",
              direction: isRTL ? "rtl" : "ltr",
              paddingLeft: isRTL ? "0" : "26px",
              paddingRight: isRTL ? "26px" : "0",
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default StyledTextField;