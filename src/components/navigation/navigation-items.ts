import {
  Building2,
  FileText,
  Gavel,
  Users,
  Scale,
  BookOpen,
  Phone,
  Home,
  User,
  ClipboardList,
  Bell,
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

// Type guard to check if an item has an href
export function hasHref(
  item: NavigationItem
): item is NavigationItem & { href: string } {
  return item.href !== undefined;
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
    title: { fr: "Actualités", ar: "الأخبار" },
    href: "/actualites",
    description: {
      fr: "Dernières nouvelles et actualités",
      ar: "آخر الأخبار والمستجدات",
    },
    icon: FileText,
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
