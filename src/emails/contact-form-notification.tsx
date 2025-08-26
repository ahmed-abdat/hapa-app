import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { getServerSideURL } from "@/utilities/getURL";
import { HAPA_CONTACT_INFO, getContactDisplay } from "@/emails/constants/contact-info";

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  locale: "fr" | "ar";
  submittedAt: string;
}

export const ContactFormNotificationEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  phone,
  subject,
  message,
  locale,
  submittedAt,
}) => {
  const isArabic = locale === "ar";
  const contactData = getContactDisplay(locale);

  return (
    <Html dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "fr"}>
      <Head />
      <Preview>
        {isArabic
          ? `رسالة جديدة من ${name} - ${subject}`
          : `Nouveau message de ${name} - ${subject}`}
      </Preview>
      <Body style={{ ...main, direction: isArabic ? "rtl" : "ltr" }}>
        <Container style={container}>
          {/* Header with HAPA branding */}
          <Section style={header}>
            <table
              role="presentation"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                <td style={{ textAlign: "center", padding: "0" }}>
                  <Img
                    src={`${getServerSideURL()}/hapa-logo.webp`}
                    width="160"
                    height="60"
                    alt={contactData.organization}
                    style={logoWhite}
                  />
                  {/* Fallback text in case logo doesn't load */}
                  <Text style={headerLogo}>HAPA</Text>
                  <Text style={headerTitle}>
                    {contactData.organizationFull}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Title */}
          <Heading
            style={{
              ...h1,
              textAlign: isArabic ? ("right" as const) : ("center" as const),
            }}
          >
            {isArabic
              ? "📧 رسالة اتصال جديدة"
              : "📧 Nouveau Message de Contact"}
          </Heading>

          {/* Contact Information Card */}
          <Section style={card}>
            <Text
              style={{
                ...cardTitle,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? "معلومات المرسل" : "Informations de l'expéditeur"}
            </Text>

            <table
              style={{ ...infoTable, direction: isArabic ? "rtl" : "ltr" }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      ...labelCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    {isArabic ? "الاسم:" : "Nom:"}
                  </td>
                  <td
                    style={{
                      ...valueCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    <strong>{name}</strong>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...labelCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    {isArabic ? "البريد الإلكتروني:" : "Email:"}
                  </td>
                  <td
                    style={{
                      ...valueCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    <Link
                      href={`mailto:${email}`}
                      style={{ ...link, direction: "ltr" }}
                    >
                      {email}
                    </Link>
                  </td>
                </tr>
                {phone && (
                  <tr>
                    <td
                      style={{
                        ...labelCell,
                        textAlign: isArabic ? "right" : "left",
                      }}
                    >
                      {isArabic ? "الهاتف:" : "Téléphone:"}
                    </td>
                    <td
                      style={{
                        ...valueCell,
                        textAlign: isArabic ? "right" : "left",
                      }}
                      dir="ltr"
                    >
                      <Link
                        href={`tel:${phone}`}
                        style={{ ...link, direction: "ltr" }}
                      >
                        {phone}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    style={{
                      ...labelCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    {isArabic ? "التاريخ:" : "Date:"}
                  </td>
                  <td
                    style={{
                      ...valueCell,
                      textAlign: isArabic ? "right" : "left",
                    }}
                  >
                    <span dir={isArabic ? "rtl" : "ltr"}>
                      {new Date(submittedAt).toLocaleString(
                        isArabic ? "ar-MR" : "fr-MR"
                      )}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Subject */}
          <Section style={card}>
            <Text
              style={{
                ...cardTitle,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? "الموضوع" : "Sujet"}
            </Text>
            <Text
              style={{
                ...subjectText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {subject}
            </Text>
          </Section>

          {/* Message */}
          <Section style={card}>
            <Text
              style={{
                ...cardTitle,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? "الرسالة" : "Message"}
            </Text>
            <Text
              style={{
                ...messageText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {message}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Action Buttons */}
          <Section style={buttonContainer}>
            <Link
              href={`${getServerSideURL()}/admin/collections/contact-submissions`}
              style={{ ...button, direction: "ltr" }}
            >
              {isArabic ? "عرض في لوحة التحكم" : "Voir dans le tableau de bord"}
            </Link>
          </Section>

          {/* Contact Information */}
          <Section style={contactInfo}>
            <Text
              style={{
                ...contactInfoText,
                textAlign: isArabic ? ("right" as const) : ("center" as const),
              }}
            >
              {contactData.labels.contact}:
            </Text>
            <Text
              style={{
                ...contactInfoText,
                textAlign: isArabic ? ("right" as const) : ("center" as const),
              }}
            >
              📧 <Link href={`mailto:${HAPA_CONTACT_INFO.email.primary}`} style={link}>{HAPA_CONTACT_INFO.email.primary}</Link> | 
              🌐 <Link href={getServerSideURL()} style={link}>{HAPA_CONTACT_INFO.website.displayName}</Link> | 
              📞 <Link href={HAPA_CONTACT_INFO.phone.tel_href} style={link}>{HAPA_CONTACT_INFO.phone.formatted}</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text
              style={{
                ...footerText,
                textAlign: isArabic ? ("right" as const) : ("center" as const),
              }}
            >
              {contactData.messages.autoMessage}
            </Text>
            <Text
              style={{
                ...footerText,
                textAlign: isArabic ? ("right" as const) : ("center" as const),
              }}
            >
              © {new Date().getFullYear()} {contactData.organization} - {contactData.messages.copyright}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#0f5728", // HAPA Official Green (--hapa-primary)
  padding: "32px 24px",
  borderRadius: "8px 8px 0 0",
  textAlign: "center" as const,
  // Remove gradient for better email client support
};

const logoWhite = {
  display: "block",
  margin: "0 auto 12px auto",
  maxWidth: "160px",
  height: "auto",
  borderRadius: "6px",
  // Remove CSS filters for better email client compatibility
  // Use a white version of the logo instead
};

const headerLogo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "8px 0 4px 0",
  textAlign: "center" as const,
  display: "block",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  letterSpacing: "0.5px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#0f5728", // HAPA Official Green
  fontSize: "26px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "24px 20px 20px 20px",
  textAlign: "center" as const,
};

const card = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 20px 16px",
  border: "1px solid #e5e7eb",
};

const cardTitle = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  marginBottom: "12px",
};

const infoTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const labelCell = {
  color: "#6b7280",
  fontSize: "14px",
  padding: "8px 0",
  width: "140px",
  verticalAlign: "top" as const,
};

const valueCell = {
  color: "#1f2937",
  fontSize: "14px",
  padding: "8px 0",
  verticalAlign: "top" as const,
};

const subjectText = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const messageText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const button = {
  backgroundColor: "#0f5728", // HAPA Official Green
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  boxShadow: "0 2px 4px rgba(15, 87, 40, 0.2)",
  transition: "all 0.2s ease",
};

const link = {
  color: "#0f5728", // HAPA Official Green
  textDecoration: "none",
  fontWeight: "500",
};

const footer = {
  padding: "0 20px",
  marginTop: "32px",
};

const contactInfo = {
  padding: "16px 20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  margin: "20px 20px 0",
  border: "1px solid #e5e7eb",
};

const contactInfoText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "8px 0",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "8px 0",
};

export default ContactFormNotificationEmail;
