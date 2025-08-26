/**
 * HAPA Contact Information Constants
 * 
 * Centralized contact information used across all email templates.
 * Update these values to change contact info in all email templates at once.
 */

export const HAPA_CONTACT_INFO = {
  // Email addresses - Use support@hapa.mr for everything
  email: {
    primary: 'support@hapa.mr', // Single email for all communications (matches EMAIL_FROM)
    support: 'support@hapa.mr', // Alias for consistency
    contact: 'support@hapa.mr', // Use same email for contact forms
  },

  // Phone numbers
  phone: {
    main: '+222 45 25 26 27',
    formatted: '+222 45 25 26 27',
    tel_href: 'tel:+222452526271', // For tel: links (no spaces/dashes)
  },

  // Website/URLs
  website: {
    domain: 'www.hapa.mr',
    displayName: 'hapa.mr',
  },

  // Organization names by locale
  organization: {
    fr: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel',
    ar: 'الهيئة العليا للصحافة والسمعيات البصرية - HAPA',
    full_fr: 'Haute Autorité de la Presse et de l\'Audiovisuel',
    full_ar: 'الهيئة العليا للصحافة والإذاعة والتلفزيون',
  },

  // Localized labels and messages
  labels: {
    fr: {
      email: 'Email',
      phone: 'Tél',
      website: 'Web', 
      contact: 'Contact',
      // Additional labels for consistency
      support: 'Support',
      telephone: 'Téléphone',
      website_full: 'Site web',
    },
    ar: {
      email: 'البريد الإلكتروني',
      phone: 'هاتف',
      website: 'موقع',
      contact: 'معلومات الاتصال',
      // Additional labels for consistency
      support: 'الدعم',
      telephone: 'هاتف',
      website_full: 'الموقع الإلكتروني',
    },
  },

  // Common internationalized messages
  messages: {
    fr: {
      autoMessage: 'Cet email a été envoyé automatiquement depuis le système HAPA',
      copyright: 'Tous droits réservés',
      newContactMessage: 'Nouveau message de contact',
      replyToYourRequest: 'Réponse à votre demande',
      contactInformation: 'Informations de contact',
      emailSignature: 'Équipe HAPA',
      greeting: 'Bonjour',
      regards: 'Cordialement',
    },
    ar: {
      autoMessage: 'هذا البريد الإلكتروني تم إرساله تلقائياً من نظام HAPA',
      copyright: 'جميع الحقوق محفوظة',
      newContactMessage: 'رسالة اتصال جديدة',
      replyToYourRequest: 'رد على طلبك',
      contactInformation: 'معلومات الاتصال',
      emailSignature: 'فريق HAPA',
      greeting: 'مرحبا',
      regards: 'مع أطيب التحيات',
    },
  },
} as const;

/**
 * Helper function to get contact info formatted for display
 */
export const getContactDisplay = (locale: 'fr' | 'ar' = 'fr') => {
  const labels = HAPA_CONTACT_INFO.labels[locale];
  const messages = HAPA_CONTACT_INFO.messages[locale];
  
  return {
    ...HAPA_CONTACT_INFO,
    labels,
    messages,
    organization: HAPA_CONTACT_INFO.organization[locale],
    organizationFull: HAPA_CONTACT_INFO.organization[`full_${locale}`],
  };
};