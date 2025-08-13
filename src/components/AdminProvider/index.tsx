"use client";
import React from "react";
import { Toaster } from "@/components/ui/sonner";

const AdminProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <style jsx global>{`
        /* Custom Avatar Styling - Optimized for Payload admin header integration */
        .custom-avatar-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--theme-elevation-200);
          border: 1px solid var(--theme-elevation-300);
          transition: all 0.2s ease;
          cursor: pointer;
          margin: 0; /* Let Payload handle the natural account area spacing */
          padding: 0;
        }

        .custom-avatar-container:hover {
          border-color: var(--theme-success-500);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .custom-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .custom-avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          text-transform: uppercase;
          line-height: 1;
          border-radius: 50%;
          letter-spacing: 0.5px;
        }

        /* Responsive sizing adjustments only - let Payload handle positioning */
        @media (max-width: 768px) {
          .custom-avatar-container {
            width: 28px;
            height: 28px;
          }
          
          .custom-avatar-initials {
            font-size: 11px;
          }
        }

        /* Dark mode support */
        [data-theme="dark"] .custom-avatar-container {
          background: var(--theme-elevation-200);
          border-color: var(--theme-elevation-300);
        }

        [data-theme="dark"] .custom-avatar-container:hover {
          border-color: var(--theme-text);
        }

        /* Remove default gravatar hiding since we're properly replacing it now */
        /* This CSS is no longer needed as we use the official avatar replacement */
      `}</style>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </>
  );
};

export default AdminProvider;