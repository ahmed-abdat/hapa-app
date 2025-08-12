import { Banner } from "@payloadcms/ui/elements/Banner";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Inbox, FolderCog } from "lucide-react"; // Modern descriptive icons

import "./index.scss";

const baseClass = "before-dashboard";

const BeforeDashboard: React.FC = () => {
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
              src="/logo_hapa1.png"
              alt="HAPA Logo"
              width={96}
              height={17}
              style={{ maxWidth: "100px", height: "auto" }}
            />
            <div>
              <h4 style={{ margin: 0, color: "#138B3A" }}>
                Tableau de bord HAPA
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Interface d&apos;administration - Haute Autorité de la Presse et
                de l&apos;Audiovisuel
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href="/admin/collections/media-content-submissions"
              /* Enhanced UI/UX via scoped CSS (no Tailwind dependency in admin) */
              className="admin-action admin-action--outline"
              aria-label="Gérer les collections"
              title="Gérer les Collections"
            >
              <FolderCog className="admin-action__icon" aria-hidden="true" />
              Gérer les Collections
            </Link>
            <Link
              href="/admin/collections/dashboard-submissions"
              /* Enhanced UI/UX via scoped CSS (no Tailwind dependency in admin) */
              className="admin-action admin-action--primary"
              aria-label="Ouvrir les soumissions médiatiques"
              title="Soumissions Médiatiques"
            >
              <Inbox className="admin-action__icon" aria-hidden="true" />
              Soumissions Médiatiques
            </Link>
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default BeforeDashboard;
