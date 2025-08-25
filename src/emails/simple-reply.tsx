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

interface SimpleReplyEmailProps {
  userName: string;
  userEmail: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  locale: "fr" | "ar";
}

export const SimpleReplyEmail: React.FC<SimpleReplyEmailProps> = ({
  userName,
  userEmail,
  originalSubject,
  originalMessage,
  replyMessage,
  locale,
}) => {
  const isArabic = locale === "ar";

  return (
    <Html dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "fr"}>
      <Head />
      <Preview>
        {isArabic ? `رد من HAPA على رسالتك` : `Réponse HAPA à votre message`}
      </Preview>
      <Body style={{ ...main, direction: isArabic ? "rtl" : "ltr" }}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <table
              role="presentation"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                <td style={{ textAlign: "center", padding: "0" }}>
                  <Img
                    src="https://www.hapa.mr/hapa-logo.webp"
                    width="160"
                    height="60"
                    alt={
                      isArabic
                        ? "الهيئة العليا للصحافة والسمعيات البصرية"
                        : "HAPA - Haute Autorité de la Presse et de l'Audiovisuel"
                    }
                    style={logoWhite}
                  />
                  {/* Fallback text in case logo doesn't load */}
                  <Text style={headerLogo}>HAPA</Text>
                  <Text style={headerTitle}>
                    {isArabic
                      ? "الهيئة العليا للصحافة والإذاعة والتلفزيون"
                      : "Haute Autorité de la Presse et de l'Audiovisuel"}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text
              style={{
                ...greeting,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? `مرحباً ${userName}،` : `Bonjour ${userName},`}
            </Text>

            <Text
              style={{
                ...paragraph,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic
                ? "شكراً لتواصلك معنا. إليك ردنا على استفسارك:"
                : "Merci de nous avoir contactés. Voici notre réponse à votre demande:"}
            </Text>
          </Section>

          {/* Reply Content */}
          <Section style={replySection}>
            <Text
              style={{
                ...replyContent,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {replyMessage}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Original Message Reference */}
          <Section style={originalSection}>
            <Text
              style={{
                ...sectionTitle,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? "رسالتك الأصلية:" : "Votre message original:"}
            </Text>

            <Text
              style={{
                ...originalSubjectText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              <strong>{isArabic ? "الموضوع: " : "Sujet: "}</strong>
              {originalSubject}
            </Text>

            <Text
              style={{
                ...originalMessageText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {originalMessage}
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text
              style={{
                ...contactText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic
                ? "للمزيد من الاستفسارات، يمكنكم التواصل معنا:"
                : "Pour toute question supplémentaire, vous pouvez nous contacter:"}
            </Text>

            <Text
              style={{
                ...contactDetails,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              🌐{" "}
              <Link
                href={process.env.NEXT_PUBLIC_SERVER_URL}
                style={{ ...link, direction: "ltr" }}
              >
                {process.env.NEXT_PUBLIC_SERVER_URL?.replace('https://', '') || 'hapa.mr'}
              </Link>
              <br />
              ✉️{" "}
              <Link
                href="mailto:contact@hapa.mr"
                style={{ ...link, direction: "ltr" }}
              >
                contact@hapa.mr
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text
              style={{
                ...footerText,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic ? "مع أطيب التحيات،" : "Cordialement,"}
            </Text>
            <Text
              style={{
                ...footerOrg,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              <strong>
                {isArabic
                  ? "HAPA - الهيئة العليا للصحافة والإذاعة والتلفزيون"
                  : "HAPA - Haute Autorité de la Presse et de l'Audiovisuel"}
              </strong>
            </Text>
            <Text
              style={{
                ...footerDisclaimer,
                textAlign: isArabic ? ("right" as const) : ("left" as const),
              }}
            >
              {isArabic
                ? "هذا رد رسمي من HAPA على رسالتك"
                : "Ceci est une réponse officielle de HAPA à votre message"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Clean, professional styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#0f5728", // HAPA Official Green
  padding: "32px 24px",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
  // Remove gradient for better email client support
};

const logoWhite = {
  display: "block",
  margin: "0 auto 12px auto",
  maxWidth: "160px",
  height: "auto",
  borderRadius: "6px",
  // Remove CSS filters for better email client compatibility
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

const section = {
  padding: "0 24px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "24px 0 12px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 24px",
};

const replySection = {
  backgroundColor: "#f8fafc",
  margin: "0 24px 24px",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const replyContent = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#1f2937",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const originalSection = {
  padding: "0 24px",
};

const sectionTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const originalSubjectText = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 8px",
};

const originalMessageText = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 24px",
  padding: "12px",
  backgroundColor: "#f9fafb",
  borderRadius: "4px",
  whiteSpace: "pre-wrap" as const,
};

const contactSection = {
  padding: "0 24px",
};

const contactText = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 12px",
};

const contactDetails = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 24px",
  lineHeight: "20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const link = {
  color: "#0f5728", // HAPA Official Green
  textDecoration: "none",
  fontWeight: "500",
};

const footer = {
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "0 0 8px 8px",
};

const footerText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 8px",
};

const footerOrg = {
  fontSize: "14px",
  color: "#1f2937",
  margin: "0 0 16px",
};

const footerDisclaimer = {
  fontSize: "12px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
  margin: "0",
};

export default SimpleReplyEmail;
