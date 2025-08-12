// src/translations/admin-translations.ts
import { enTranslations } from '@payloadcms/translations/languages/en'
import type { NestedKeysStripped } from '@payloadcms/translations'

export const adminTranslations = {
  fr: {
    // Plugin-generated collections
    general: {
      redirects: "Redirections",
      search: "Résultats de recherche", 
      dashboard: "Tableau de bord HAPA",
      adminPanel: "Interface d'administration HAPA",
      welcome: "Bienvenue dans l'interface d'administration HAPA",
    },
    
    // ConsolidatedDashboard translations
    dashboard: {
      title: "Centre de contrôle des soumissions médias",
      subtitle: "Gestion complète des signalements et plaintes",
      refresh: "Actualiser",
      selected: "sélectionné(s)",
      actions: "Actions",
      bulkUpdateStatus: "Modifier le statut",
      bulkUpdatePriority: "Modifier la priorité",
      delete: "Supprimer",
    },
    
    // Actions
    actions: {
      refresh: "Actualiser",
      settings: "Paramètres",
      save: "Enregistrer",
      cancel: "Annuler",
      view: "Voir",
      edit: "Modifier",
      bulkActions: "Actions groupées",
      selectAll: "Sélectionner tout",
      selectRow: "Sélectionner la ligne",
      details: "Détails",
      openMenu: "Ouvrir le menu",
      copyId: "Copier l'ID",
      delete: "Supprimer",
      bulkResolve: "Résoudre en masse",
      export: "Exporter",
      import: "Importer",
      archive: "Archiver",
      title: "Actions",
      startReview: "Commencer la révision",
      changePriority: "Changer la priorité",
      copy: "Copier",
      print: "Imprimer",
      share: "Partager",
      close: "Fermer",
      saveSettings: "Enregistrer les paramètres",
    },
    
    // Status labels
    status: {
      pending: "En attente",
      reviewing: "En révision",
      resolved: "Résolu",
      dismissed: "Rejeté",
    },
    
    // Priority labels
    priority: {
      urgent: "Urgent",
      high: "Élevé",
      medium: "Moyen",
      low: "Faible",
    },
    
    // Form types
    forms: {
      report: "Signalement",
      complaint: "Plainte",
    },
    
    // Statistics
    stats: {
      total: "Total des soumissions",
      reports: "Signalements",
      complaints: "Plaintes",
      pending: "En attente",
      resolved: "Résolus",
      resolutionRate: "Taux de résolution",
      urgent: "Cas urgents",
      thisWeek: "Cette semaine",
      responseTime: "Temps de réponse",
    },
    
    // Filters
    filters: {
      all: "Tout",
      type: "Type",
      status: "Statut",
      priority: "Priorité",
      search: "Rechercher...",
      last30Days: "30 derniers jours",
    },
    
    // Tabs
    tabs: {
      overview: "Vue d'ensemble",
      submissions: "Soumissions",
      analytics: "Analytique",
      reports: "Rapports",
      team: "Équipe",
    },
    
    // Table headers
    table: {
      title: "Titre",
      type: "Type",
      status: "Statut",
      priority: "Priorité",
      submittedOn: "Soumis le",
      language: "Langue",
      actions: "Actions",
      searchAllColumns: "Rechercher dans toutes les colonnes...",
      allStatuses: "Tous les statuts",
      allTypes: "Tous les types",
      allPriorities: "Toutes priorités",
      loadingData: "Chargement...",
      noResultsFound: "Aucun résultat trouvé.",
      noResults: "Aucun résultat",
      columns: "Colonnes",
      columnVisibility: "Visibilité des colonnes",
      rowsPerPage: "Lignes par page",
      page: "Page",
      goToFirstPage: "Aller à la première page",
      goToPreviousPage: "Aller à la page précédente",
      goToNextPage: "Aller à la page suivante",
      goToLastPage: "Aller à la dernière page",
      complainant: "Plaignant",
      date: "Date",
    },
    
    // Details section
    details: {
      title: "Détails de la soumission",
      contentInfo: "Informations du contenu",
      complainantInfo: "Informations du plaignant",
      programName: "Programme",
      mediaType: "Type de média",
      language: "Langue",
      fullName: "Nom complet",
      email: "Email",
      notSpecified: "Non spécifié",
      french: "Français",
      arabic: "Arabe",
    },
    
    // Recent submissions
    recent: {
      title: "Soumissions récentes",
      viewAll: "Voir tout",
      subtitle: "Soumissions les plus récentes",
    },
    
    // Empty state
    empty: {
      title: "Aucune soumission",
      description: "Il n'y a pas encore de soumissions média.",
    },
    
    // Additional labels
    common: {
      loading: "Chargement des données...",
      viewAllSubmissions: "Voir toutes les soumissions",
      requiresReview: "Nécessitent une révision",
      today: "aujourd'hui",
      anonymous: "Anonyme",
      quickActions: "Actions rapides",
      export: "Exporter",
      import: "Importer",
      statusDistribution: "Distribution des statuts",
      priorityLevels: "Niveaux de priorité",
      recentSubmissions: "Soumissions récentes",
      viewAll: "Voir tout",
      submissionManagement: "Gestion des soumissions",
      openInAdmin: "Ouvrir dans l'admin",
      averageResponseTime: "Temps de réponse moyen",
      lastThirtyDays: "Sur les 30 derniers jours",
      requiresImmediateAction: "Nécessitent une action immédiate",
      detailedAnalytics: "Graphiques et analyses détaillées à venir...",
      customReports: "Génération de rapports personnalisés à venir...",
      teamManagement: "Gestion de l'équipe et des assignations à venir...",
      untitled: "Sans titre",
      of: "sur",
      bulkActions: "Actions groupées",
      thisWeek: "Cette semaine",
      resolved: "Résolu",
      requiresAction: "Nécessite une action",
      notProvided: "Non fourni",
    },
    
    // Search
    search: {
      placeholder: "Rechercher...",
    },
    
    // Quick Actions
    quickActions: {
      title: "Actions rapides",
    },
    
    // Distribution
    distribution: {
      title: "Répartition",
    },
    
    // View options
    viewAll: "Voir tout",
    
    // Submissions
    submissions: {
      allTitle: "Toutes les soumissions",
      description: "Gérer et examiner toutes les soumissions",
      fullTablePlaceholder: "Table complète des soumissions",
    },
    
    // Analytics
    analytics: {
      title: "Analytique",
      description: "Visualiser les tendances et les métriques",
      placeholder: "Graphiques et analyses détaillées à venir...",
    },
    
    // Reports
    reports: {
      title: "Rapports",
      description: "Générer et exporter des rapports",
      placeholder: "Génération de rapports personnalisés à venir...",
    },
    
    // Modal
    modal: {
      submittedOn: "Soumis le",
      complainantInfo: "Informations du plaignant",
      contentInfo: "Informations du contenu",
      actions: "Actions",
    },
    
    // Fields
    fields: {
      fullName: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      mediaType: "Type de média",
      programName: "Nom du programme",
      broadcastDate: "Date de diffusion",
      description: "Description",
      status: "Statut",
      priority: "Priorité",
      notes: "Notes",
    },
    
    // Placeholders
    placeholders: {
      addNotes: "Ajouter des notes...",
    },
    
    // Settings
    settings: {
      title: "Paramètres",
      description: "Configurer les préférences du tableau de bord",
      display: "Affichage",
      autoRefresh: "Actualisation automatique",
      compactView: "Vue compacte",
      notifications: "Notifications",
      preferences: "Préférences",
      defaultView: "Vue par défaut",
      itemsPerPage: "Éléments par page",
    },
    
    // Views
    views: {
      grid: "Grille",
      list: "Liste",
      kanban: "Kanban",
    },
    
    // Add top-level keys that are accessed without namespace
    bulkActions: "Actions groupées",
    thisWeek: "Cette semaine",
    resolved: "Résolu",
    requiresAction: "Nécessite une action",
    last30Days: "30 derniers jours",
    anonymous: "Anonyme",
    notProvided: "Non fourni",
    selected: "sélectionné(s)",
    itemsSelected: "éléments sélectionnés",
    
    // Error messages
    errors: {
      fetchFailed: "Échec du chargement des données",
      updateFailed: "Échec de la mise à jour",
      bulkActionFailed: "Échec de l'action groupée",
    },
    
    // Success messages
    success: {
      updated: "Mis à jour avec succès",
      bulkAction: "Action appliquée à {count} éléments",
      saved: "Enregistré avec succès",
    },
    
    // Warning messages
    warnings: {
      noSelection: "Aucun élément sélectionné",
    },
    
    // Bulk actions menu items (renamed to avoid conflict with top-level bulkActions)
    bulkActionsMenu: {
      resolve: "Résoudre la sélection",
      dismiss: "Rejeter la sélection",
      export: "Exporter la sélection",
    },
  },
  ar: {
    // Plugin-generated collections
    general: {
      redirects: "عمليات إعادة التوجيه",
      search: "نتائج البحث",
      dashboard: "لوحة تحكم هابا",
      adminPanel: "واجهة إدارة هابا",
      welcome: "مرحباً بك في واجهة إدارة هابا",
    },
    
    // ConsolidatedDashboard translations
    dashboard: {
      title: "مركز التحكم في إرسالات الوسائط",
      subtitle: "إدارة شاملة للتبليغات والشكاوى",
      refresh: "تحديث",
      selected: "محدد",
      actions: "الإجراءات",
      bulkUpdateStatus: "تغيير الحالة",
      bulkUpdatePriority: "تغيير الأولوية",
      delete: "حذف",
    },
    
    // Actions
    actions: {
      refresh: "تحديث",
      settings: "الإعدادات",
      save: "حفظ",
      cancel: "إلغاء",
      view: "عرض",
      edit: "تعديل",
      bulkActions: "إجراءات جماعية",
      selectAll: "تحديد الكل",
      selectRow: "تحديد الصف",
      details: "التفاصيل",
      openMenu: "فتح القائمة",
      copyId: "نسخ المعرف",
      delete: "حذف",
      bulkResolve: "حل جماعي",
      export: "تصدير",
      import: "استيراد",
      archive: "أرشفة",
      title: "الإجراءات",
      startReview: "بدء المراجعة",
      changePriority: "تغيير الأولوية",
      copy: "نسخ",
      print: "طباعة",
      share: "مشاركة",
      close: "إغلاق",
      saveSettings: "حفظ الإعدادات",
    },
    
    // Status labels
    status: {
      pending: "في الانتظار",
      reviewing: "قيد المراجعة",
      resolved: "محلول",
      dismissed: "مرفوض",
    },
    
    // Priority labels
    priority: {
      urgent: "عاجل",
      high: "عالي",
      medium: "متوسط",
      low: "منخفض",
    },
    
    // Form types
    forms: {
      report: "تبليغ",
      complaint: "شكوى",
    },
    
    // Statistics
    stats: {
      total: "إجمالي الإرسالات",
      reports: "البلاغات",
      complaints: "الشكاوى",
      pending: "في الانتظار",
      resolved: "محلول",
      resolutionRate: "معدل الحل",
      urgent: "حالات عاجلة",
      thisWeek: "هذا الأسبوع",
      responseTime: "وقت الاستجابة",
    },
    
    // Filters
    filters: {
      all: "الكل",
      type: "النوع",
      status: "الحالة",
      priority: "الأولوية",
      search: "بحث...",
      last30Days: "آخر 30 يومًا",
    },
    
    // Tabs
    tabs: {
      overview: "نظرة عامة",
      submissions: "الإرسالات",
      analytics: "التحليلات",
      reports: "التقارير",
      team: "الفريق",
    },
    
    // Table headers
    table: {
      title: "العنوان",
      type: "النوع",
      status: "الحالة",
      priority: "الأولوية",
      submittedOn: "تاريخ التقديم",
      language: "اللغة",
      actions: "الإجراءات",
      searchAllColumns: "البحث في جميع الأعمدة...",
      allStatuses: "جميع الحالات",
      allTypes: "جميع الأنواع",
      allPriorities: "جميع الأولويات",
      loadingData: "جاري التحميل...",
      noResultsFound: "لم يتم العثور على نتائج.",
      noResults: "لا توجد نتائج",
      columns: "الأعمدة",
      columnVisibility: "إظهار الأعمدة",
      rowsPerPage: "الصفوف في الصفحة",
      page: "الصفحة",
      goToFirstPage: "الانتقال إلى الصفحة الأولى",
      goToPreviousPage: "الانتقال إلى الصفحة السابقة",
      goToNextPage: "الانتقال إلى الصفحة التالية",
      goToLastPage: "الانتقال إلى الصفحة الأخيرة",
      complainant: "المشتكي",
      date: "التاريخ",
    },
    
    // Details section
    details: {
      title: "تفاصيل المحتوى المقدم",
      contentInfo: "معلومات المحتوى",
      complainantInfo: "معلومات المشتكي",
      programName: "البرنامج",
      mediaType: "نوع الوسائط",
      language: "اللغة",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      notSpecified: "غير محدد",
      french: "الفرنسية",
      arabic: "العربية",
    },
    
    // Recent submissions
    recent: {
      title: "المحتوى المقدم مؤخراً",
      viewAll: "عرض الكل",
      subtitle: "آخر المحتويات المقدمة",
    },
    
    // Empty state
    empty: {
      title: "لا يوجد محتوى مقدم",
      description: "لا توجد أي محتويات مقدمة حتى الآن.",
    },
    
    // Additional labels
    common: {
      loading: "جاري تحميل البيانات...",
      viewAllSubmissions: "عرض جميع المحتويات المقدمة",
      requiresReview: "تتطلب مراجعة",
      today: "اليوم",
      anonymous: "مجهول",
      quickActions: "إجراءات سريعة",
      export: "تصدير",
      import: "استيراد",
      statusDistribution: "توزيع الحالات",
      priorityLevels: "مستويات الأولوية",
      recentSubmissions: "المحتويات المقدمة مؤخراً",
      viewAll: "عرض الكل",
      submissionManagement: "إدارة المحتويات المقدمة",
      openInAdmin: "فتح في الإدارة",
      averageResponseTime: "متوسط وقت الاستجابة",
      lastThirtyDays: "خلال الثلاثين يوماً الماضية",
      requiresImmediateAction: "تتطلب إجراء فوري",
      detailedAnalytics: "التحليلات التفصيلية والرسوم البيانية قادمة...",
      customReports: "إنشاء التقارير المخصصة قادم...",
      teamManagement: "إدارة الفريق والتكليفات قادمة...",
      untitled: "بدون عنوان",
      of: "من",
      bulkActions: "إجراءات جماعية",
      thisWeek: "هذا الأسبوع",
      resolved: "محلول",
      requiresAction: "يتطلب إجراء",
      notProvided: "غير مقدم",
    },
    
    // Search
    search: {
      placeholder: "بحث...",
    },
    
    // Quick Actions
    quickActions: {
      title: "إجراءات سريعة",
    },
    
    // Distribution
    distribution: {
      title: "التوزيع",
    },
    
    // View options
    viewAll: "عرض الكل",
    
    // Submissions
    submissions: {
      allTitle: "جميع المحتويات المقدمة",
      description: "إدارة ومراجعة جميع المحتويات",
      fullTablePlaceholder: "جدول كامل للمحتويات المقدمة",
    },
    
    // Analytics
    analytics: {
      title: "التحليلات",
      description: "عرض الاتجاهات والمقاييس",
      placeholder: "الرسوم البيانية والتحليلات التفصيلية قادمة...",
    },
    
    // Reports
    reports: {
      title: "التقارير",
      description: "إنشاء وتصدير التقارير",
      placeholder: "إنشاء التقارير المخصصة قادم...",
    },
    
    // Modal
    modal: {
      submittedOn: "تم التقديم في",
      complainantInfo: "معلومات المشتكي",
      contentInfo: "معلومات المحتوى",
      actions: "الإجراءات",
    },
    
    // Fields
    fields: {
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      mediaType: "نوع الوسائط",
      programName: "اسم البرنامج",
      broadcastDate: "تاريخ البث",
      description: "الوصف",
      status: "الحالة",
      priority: "الأولوية",
      notes: "ملاحظات",
    },
    
    // Placeholders
    placeholders: {
      addNotes: "إضافة ملاحظات...",
    },
    
    // Settings
    settings: {
      title: "الإعدادات",
      description: "تكوين تفضيلات لوحة القيادة",
      display: "العرض",
      autoRefresh: "التحديث التلقائي",
      compactView: "عرض مضغوط",
      notifications: "الإشعارات",
      preferences: "التفضيلات",
      defaultView: "العرض الافتراضي",
      itemsPerPage: "عناصر لكل صفحة",
    },
    
    // Views
    views: {
      grid: "شبكة",
      list: "قائمة",
      kanban: "كانبان",
    },
    
    // Add top-level keys that are accessed without namespace
    bulkActions: "إجراءات جماعية",
    thisWeek: "هذا الأسبوع",
    resolved: "محلول",
    requiresAction: "يتطلب إجراء",
    last30Days: "آخر 30 يومًا",
    anonymous: "مجهول",
    notProvided: "غير مقدم",
    selected: "محدد",
    itemsSelected: "عناصر محددة",
    
    // Error messages
    errors: {
      fetchFailed: "فشل تحميل البيانات",
      updateFailed: "فشل التحديث",
      bulkActionFailed: "فشل الإجراء الجماعي",
    },
    
    // Success messages
    success: {
      updated: "تم التحديث بنجاح",
      bulkAction: "تم تطبيق الإجراء على {count} عناصر",
      saved: "تم الحفظ بنجاح",
    },
    
    // Warning messages
    warnings: {
      noSelection: "لم يتم تحديد أي عناصر",
    },
    
    // Bulk actions menu items (renamed to avoid conflict with top-level bulkActions)
    bulkActionsMenu: {
      resolve: "حل المحدد",
      dismiss: "رفض المحدد",
      export: "تصدير المحدد",
    },
  }
}

export type AdminTranslationsObject = typeof adminTranslations.fr & typeof enTranslations
export type AdminTranslationsKeys = NestedKeysStripped<AdminTranslationsObject>