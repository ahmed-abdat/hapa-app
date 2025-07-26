import {
  Building2,
  FileText,
  Gavel,
  Users,
  MessageCircle,
  BookOpen,
  Phone,
  Home,
  User,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

export interface NavigationItem {
  title: {
    fr: string;
    ar: string;
  };
  href?: string;
  description?: {
    fr: string;
    ar: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: { fr: "Accueil", ar: "الرئيسية" },
    href: "/",
    icon: Home,
  },
  {
    title: { fr: "À propos", ar: "تعريف" },
    description: {
      fr: "Découvrez HAPA et sa mission",
      ar: "تعرف على الهيئة العليا للصحافة والإعلام ومهمتها",
    },
    icon: Building2,
    items: [
      {
        title: { fr: "Mot du Président", ar: "كلمة الرئيس" },
        href: "/about/president",
        description: {
          fr: "Message du Président de HAPA",
          ar: "رسالة رئيس الهيئة العليا للصحافة والإعلام",
        },
        icon: User,
      },
      {
        title: {
          fr: "Mission HAPA",
          ar: "مهمة الهيئة العليا للصحافة والإعلام",
        },
        href: "/about/mission",
        description: {
          fr: "Notre mission et objectifs",
          ar: "مهمتنا وأهدافنا",
        },
        icon: Building2,
      },
      {
        title: { fr: "Organisation", ar: "التنظيم والأعضاء" },
        href: "/about/organization",
        description: {
          fr: "Structure organisationnelle",
          ar: "الهيكل التنظيمي",
        },
        icon: Users,
      },
      {
        title: { fr: "Règlement intérieur", ar: "النظام الداخلي" },
        href: "/about/bylaws",
        description: {
          fr: "Règles et procédures internes",
          ar: "القواعد والإجراءات الداخلية",
        },
        icon: Gavel,
      },
    ],
  },
  {
    title: { fr: "Publications", ar: "إصدارات" },
    description: {
      fr: "Accédez à nos publications officielles",
      ar: "اطلع على منشوراتنا الرسمية",
    },
    icon: FileText,
    items: [
      {
        title: { fr: "Décisions et communiqués", ar: "قرارات و بيانات" },
        href: "/publications/decisions",
        description: {
          fr: "Décisions officielles et communiqués",
          ar: "القرارات الرسمية والبيانات",
        },
        icon: Gavel,
      },
      {
        title: { fr: "Rapports", ar: "تقارير" },
        href: "/publications/rapports",
        description: {
          fr: "Rapports d'activité et études",
          ar: "تقارير النشاط والدراسات",
        },
        icon: BookOpen,
      },
      {
        title: { fr: "Lois et règlements", ar: "قوانين و تشريعات" },
        href: "/publications/lois-et-reglements",
        description: {
          fr: "Cadre juridique et réglementaire",
          ar: "الإطار القانوني والتنظيمي",
        },
        icon: Gavel,
      },
    ],
  },
  {
    title: { fr: "Services", ar: "خدمات" },
    description: {
      fr: "Services publics et formulaires",
      ar: "الخدمات العامة والنماذج",
    },
    icon: ClipboardList,
    items: [
      {
        title: { fr: "Signalement de contenu médiatique", ar: "تبليغ عن محتوى إعلامي" },
        href: "/forms/media-content-report",
        description: {
          fr: "Signaler un contenu médiatique inapproprié",
          ar: "الإبلاغ عن محتوى إعلامي غير مناسب",
        },
        icon: AlertTriangle,
      },
      {
        title: { fr: "Plainte concernant un contenu médiatique", ar: "شكوى بخصوص محتوى إعلامي" },
        href: "/forms/media-content-complaint",
        description: {
          fr: "Déposer une plainte officielle concernant un contenu médiatique",
          ar: "تقديم شكوى رسمية بخصوص محتوى إعلامي",
        },
        icon: MessageCircle,
      },
    ],
  },
  {
    title: { fr: "Actualités", ar: "الأخبار" },
    href: "/actualites",
    description: {
      fr: "Dernières nouvelles et actualités",
      ar: "آخر الأخبار والمستجدات",
    },
    icon: MessageCircle,
  },
  {
    title: { fr: "Contact", ar: "اتصل بنا" },
    href: "/contact",
    description: { fr: "Contactez-nous", ar: "اتصل بنا" },
    icon: Phone,
  },
];

export function getNavigationItemText(
  item: NavigationItem,
  locale: "fr" | "ar",
  field: "title" | "description" = "title"
) {
  if (field === "description" && item.description) {
    return item.description[locale];
  }
  return item.title[locale];
}
