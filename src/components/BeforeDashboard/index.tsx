'use client'

import { Banner } from "@payloadcms/ui/elements/Banner";
import { useAuth } from '@payloadcms/ui';
import React from "react";
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { Inbox, FolderCog } from "lucide-react"; // Modern descriptive icons
import { useAdminTranslation } from '@/utilities/admin-translations'
import type { User } from '@/payload-types'

import "./index.scss";

const baseClass = "before-dashboard";

const BeforeDashboard: React.FC = () => {
  const { dt } = useAdminTranslation()
  const { user } = useAuth<User>()
  
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Image
              src="/hapa-logo.webp"
              alt="HAPA Logo"
              width={96}
              height={17}
              style={{ maxWidth: "100px", height: "auto", width: "auto" }}
              priority
            />
            <div>
              <h4 style={{ margin: 0, color: "#138B3A" }}>
                {dt('beforeDashboard.title')}
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {dt('beforeDashboard.subtitle')}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href="/admin"
              /* Enhanced UI/UX via scoped CSS (no Tailwind dependency in admin) */
              className="admin-action admin-action--outline"
              aria-label={dt('beforeDashboard.manageCollectionsAria')}
              title={dt('beforeDashboard.manageCollections')}
            >
              <FolderCog className="admin-action__icon" aria-hidden="true" />
              {dt('beforeDashboard.manageCollections')}
            </Link>
            {/* Hide "Soumissions Médiatiques" button for editors - only admins and moderators can access */}
            {user?.role !== 'editor' && (
              <Link
                href="/admin/collections/dashboard-submissions"
                /* Enhanced UI/UX via scoped CSS (no Tailwind dependency in admin) */
                className="admin-action admin-action--primary"
                aria-label={dt('beforeDashboard.mediaSubmissionsAria')}
                title={dt('beforeDashboard.mediaSubmissions')}
              >
                <Inbox className="admin-action__icon" aria-hidden="true" />
                {dt('beforeDashboard.mediaSubmissions')}
              </Link>
            )}
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default BeforeDashboard;