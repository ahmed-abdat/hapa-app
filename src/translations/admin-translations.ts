// src/translations/admin-translations.ts
import { enTranslations } from "@payloadcms/translations/languages/en";
import type { NestedKeysStripped } from "@payloadcms/translations";

export const adminTranslations = {
  fr: {
    // Plugin-generated collections
    general: {
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

    // Status labels - FLATTENED for Payload CMS
    "status.pending": "En attente",
    "status.reviewing": "En révision",
    "status.resolved": "Résolu",
    "status.dismissed": "Rejeté",

    // Priority labels - FLATTENED for Payload CMS
    "priority.urgent": "Urgent",
    "priority.high": "Élevé",
    "priority.medium": "Moyen",
    "priority.low": "Faible",

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

    // Admin time/date translations
    admin: {
      lastUpdated: "Dernière mise à jour",
      never: "Jamais",
      justNow: "À l'instant",
      minutesAgo: "Il y a {minutes} minute{minutes, plural, =1 {} other {s}}",
      hoursAgo: "Il y a {hours} heure{hours, plural, =1 {} other {s}}",
    },

    // Search
    search: {
      placeholder: "Rechercher...",
    },

    // ModernDashboard specific translations
    modernDashboard: {
      // Headers
      controlCenterTitle: "Centre de contrôle HAPA",
      mediaSubmissionsManagement: "Gestion des soumissions médiatiques",

      // Time ranges
      last7Days: "Derniers 7 jours",
      last30Days: "Derniers 30 jours",
      allData: "Toutes les données",
      timeRange7d: "7j",
      timeRange30d: "30j",
      timeRangeAll: "Tout",
      dataAnalysisPeriod: "Période d'analyse des données",

      // Actions
      export: "Exporter",
      exportToExcel: "Exporter les données au format Excel",
      retry: "Réessayer",
      viewSubmissionsDirectly: "Voir les soumissions directement",
      viewDetails: "Voir détails",

      // Statistics
      totalSubmissions: "Total des soumissions",
      last30DaysLabel: "Dernières 30 jours",
      urgentActionRequired: "Action urgente requise",
      criticalComplaints: "Plaintes critiques",
      submissionsToProcess: "Soumissions à traiter",
      responseTime: "Temps de réponse",
      average: "Moyenne",
      overdueFiles: "Dossiers en retard",
      moreThan7Days: "Plus de 7 jours",
      vsLastMonth: "vs mois dernier",
      vsPreviousMonth: "vs mois précédent",
      vsLastWeek: "vs semaine dernière",
      immediateAttentionRequired: "Attention immédiate requise",
      excellent: "Excellent",
      attention: "Attention",
      resolutionRate: "Taux résolution",
      complaints: "plaintes",
      reports: "rapports",
      dateRange: "Du 1er Déc - 31 Déc, 2024",
      completionPercentage: "35% completion",

      // Risk Analysis
      mediaRiskAnalysis: "Analyse des risques médiatiques",
      channelsWithMostComplaints:
        "Chaînes/programmes avec le plus de plaintes en attente",

      // Violations
      criticalViolationsAnalysis: "Analyse des violations critiques",
      mostFrequentViolations:
        "Types de violations les plus fréquents nécessitant une action réglementaire",
      hateSpeech: "Discours de haine",
      misinformation: "Désinformation",
      privacy: "Vie privée",
      shockingContent: "Contenu choquant",
      pluralism: "Pluralisme",
      falseAdvertising: "Publicité mensongère",
      others: "Autres",
      cases: "cas",
      severity: "Sévérité",
      high: "Élevée",
      moderate: "Modérée",
      withEvidence: "Avec preuves",
      withoutEvidence: "Sans preuves",
      evidenceQuality: "Qualité preuves",

      // Form Analysis
      formTypesAnalysis: "Analyse des types de formulaires",
      distributionAndPriorities:
        "Répartition et priorités par type de soumission",
      complaintsLabel: "Plaintes",
      reportsLabel: "Signalements",
      pending: "En attente",
      urgent: "Urgentes",
      withContact: "Avec contact",
      anonymous: "Anonymes",

      // Charts
      weeklyTrend: "Tendance hebdomadaire",
      submissionsAndResolutions7Days:
        "Soumissions et résolutions sur les 7 derniers jours",
      submissions: "Soumissions",
      statusDistribution: "Répartition des statuts",
      currentDistribution: "Distribution actuelle des soumissions",
      monthlyAnalysis: "Analyse mensuelle",
      realEvolution6Months:
        "Évolution réelle des soumissions sur les 6 derniers mois",
      total: "Total",
      recentSubmissions: "Soumissions récentes",
      allSubmissionsWithPagination:
        "Toutes les soumissions avec pagination, tri et filtrage avancé",

      // Status updates
      markedAs: "Soumission marquée comme",
      inReview: "en révision",
      dismissed: "rejeté",

      // Messages
      dataUpdated: "Données mises à jour",
      unknownError: "Erreur inconnue",
      requestTimeout: "La requête a expiré. Veuillez réessayer.",
      loadingDataError: "Erreur lors du chargement des données",
      updatingInProgress: "Mise à jour en cours...",
      updateError: "Erreur lors de la mise à jour",

      // Errors
      connectionError: "Erreur de connexion",
      noData: "Aucune donnée",
      unableToLoadDashboard:
        "Impossible de charger les données du tableau de bord",
      noDataAvailable: "Aucune donnée disponible pour le moment",

      // DataTable translations
      dataTable: {
        // Table headers
        typeHeader: "Type",
        submitterHeader: "Soumetteur",
        mediaHeader: "Média/Programme",
        dateHeader: "Date",
        statusHeader: "Statut",
        priorityHeader: "Priorité",
        actionsHeader: "Actions",

        // Form type display
        complaint: "Plainte",
        report: "Signalement",
        complaints: "Plaintes",
        reports: "Signalements",

        // User display
        anonymous: "Anonyme",

        // Locale display
        french: "🇫🇷 Français",
        arabic: "🇦🇷 العربية",

        // Media type
        notSpecified: "Non spécifié",

        // Time status
        recent: "Récent",
        old: "Ancien",
        hoursAgo: "{hours}h",
        daysAgo: "{days}j",

        // Priority values (consistent with component)
        urgentPriority: "Urgent",
        highPriority: "Haute",
        mediumPriority: "Moyenne",
        lowPriority: "Basse",

        // Status values (consistent with component)
        pendingStatus: "En attente",
        resolvedStatus: "Résolu",
        dismissedStatus: "Rejeté",
        reviewingStatus: "En révision",

        // Action menu items
        viewDetails: "Voir détails",
        markInReview: "Marquer en révision",
        markResolved: "Marquer comme résolu",
        reject: "Rejeter",

        // Search and filters
        searchPlaceholder: "Rechercher (nom, email, programme, média)...",
        statusFilter: "Statut",
        priorityFilter: "Priorité",
        typeFilter: "Type",
        resetFilters: "Réinitialiser les filtres",

        // Filter options
        allStatuses: "Tous les statuts",
        allTypes: "Tous types",
        allPriorities: "Toutes priorités",

        // Pagination
        rowsPerPage: "Lignes par page:",
        pageOf: "Page", // Will be used with current/total values separately
        resultSingle: "résultat",
        resultPlural: "résultats",

        // Empty state
        noDataFound: "Aucune soumission trouvée",
        noDataMessage: "Essayez de modifier vos filtres ou votre recherche",

        // External link
        viewInPayload: "Voir dans Payload CMS",
      },
    },

    // ModernDashboard flattened keys - Essential for dashboard functionality
    "modernDashboard.controlCenterTitle": "Centre de contrôle HAPA",
    "modernDashboard.mediaSubmissionsManagement":
      "Gestion des soumissions médiatiques",
    "modernDashboard.last7Days": "Derniers 7 jours",
    "modernDashboard.last30Days": "Derniers 30 jours",
    "modernDashboard.allData": "Toutes les données",
    "modernDashboard.timeRange7d": "7j",
    "modernDashboard.timeRange30d": "30j",
    "modernDashboard.timeRangeAll": "Tout",
    "modernDashboard.dataAnalysisPeriod": "Période d'analyse des données",
    "modernDashboard.export": "Exporter",
    "modernDashboard.exportToExcel": "Exporter les données au format Excel",
    "modernDashboard.totalSubmissions": "Total des soumissions",
    "modernDashboard.last30DaysLabel": "Dernières 30 jours",
    "modernDashboard.urgentActionRequired": "Action urgente requise",
    "modernDashboard.criticalComplaints": "Plaintes critiques",
    "modernDashboard.pending": "En attente",
    "modernDashboard.submissionsToProcess": "Soumissions à traiter",
    "modernDashboard.responseTime": "Temps de réponse",
    "modernDashboard.average": "Moyenne",
    "modernDashboard.overdueFiles": "Dossiers en retard",
    "modernDashboard.moreThan7Days": "Plus de 7 jours",
    "modernDashboard.vsLastMonth": "vs mois dernier",
    "modernDashboard.vsPreviousMonth": "vs mois précédent",
    "modernDashboard.vsLastWeek": "vs semaine dernière",
    "modernDashboard.immediateAttentionRequired": "Attention immédiate requise",
    "modernDashboard.excellent": "Excellent",
    "modernDashboard.attention": "Attention",
    "modernDashboard.resolutionRate": "Taux résolution",
    "modernDashboard.complaints": "plaintes",
    "modernDashboard.reports": "rapports",
    "modernDashboard.dateRange": "Du 1er Déc - 31 Déc, 2024",
    "modernDashboard.completionPercentage": "35% completion",
    "modernDashboard.resolved": "Résolu",
    "modernDashboard.urgent": "Urgent",
    "modernDashboard.complaintsLabel": "Plaintes",
    "modernDashboard.reportsLabel": "Signalements",
    "modernDashboard.withContact": "Avec contact",
    "modernDashboard.anonymous": "Anonyme",
    "modernDashboard.formTypesAnalysis": "Analyse des types de formulaires",
    "modernDashboard.distributionAndPriorities":
      "Répartition et priorités par type de soumission",
    "modernDashboard.weeklyTrend": "Tendance hebdomadaire",
    "modernDashboard.submissionsAndResolutions7Days":
      "Soumissions et résolutions sur les 7 derniers jours",
    "modernDashboard.submissions": "Soumissions",
    "modernDashboard.statusDistribution": "Répartition des statuts",
    "modernDashboard.currentDistribution":
      "Distribution actuelle des soumissions",
    "modernDashboard.monthlyAnalysis": "Analyse mensuelle",
    "modernDashboard.realEvolution6Months":
      "Évolution réelle des soumissions sur les 6 derniers mois",
    "modernDashboard.total": "Total",
    "modernDashboard.recentSubmissions": "Soumissions récentes",
    "modernDashboard.allSubmissionsWithPagination":
      "Toutes les soumissions avec pagination, tri et filtrage avancé",

    // ModernDashboard dataTable translations
    "modernDashboard.dataTable.typeHeader": "Type",
    "modernDashboard.dataTable.submitterHeader": "Soumetteur",
    "modernDashboard.dataTable.mediaHeader": "Média/Programme",
    "modernDashboard.dataTable.dateHeader": "Date",
    "modernDashboard.dataTable.statusHeader": "Statut",
    "modernDashboard.dataTable.priorityHeader": "Priorité",
    "modernDashboard.dataTable.actionsHeader": "Actions",
    "modernDashboard.dataTable.complaint": "Plainte",
    "modernDashboard.dataTable.report": "Signalement",
    "modernDashboard.dataTable.complaints": "Plaintes",
    "modernDashboard.dataTable.reports": "Signalements",
    "modernDashboard.dataTable.anonymous": "Anonyme",
    "modernDashboard.dataTable.french": "🇫🇷 Français",
    "modernDashboard.dataTable.arabic": "🇦🇷 العربية",
    "modernDashboard.dataTable.pendingStatus": "En attente",
    "modernDashboard.dataTable.reviewingStatus": "En révision",
    "modernDashboard.dataTable.resolvedStatus": "Résolu",
    "modernDashboard.dataTable.dismissedStatus": "Rejeté",
    "modernDashboard.dataTable.urgentPriority": "Urgent",
    "modernDashboard.dataTable.highPriority": "Haute",
    "modernDashboard.dataTable.mediumPriority": "Moyenne",
    "modernDashboard.dataTable.lowPriority": "Basse",
    "modernDashboard.dataTable.viewDetails": "Voir détails",
    "modernDashboard.dataTable.markInReview": "Marquer en révision",
    "modernDashboard.dataTable.markResolved": "Marquer comme résolu",
    "modernDashboard.dataTable.reject": "Rejeter",
    "modernDashboard.dataTable.searchPlaceholder": "Rechercher...",
    "modernDashboard.dataTable.statusFilter": "Filtrer par statut",
    "modernDashboard.dataTable.allStatuses": "Tous les statuts",
    "modernDashboard.dataTable.priorityFilter": "Filtrer par priorité",
    "modernDashboard.dataTable.allPriorities": "Toutes les priorités",
    "modernDashboard.dataTable.typeFilter": "Filtrer par type",
    "modernDashboard.dataTable.allTypes": "Tous les types",
    "modernDashboard.dataTable.resetFilters": "Réinitialiser les filtres",
    "modernDashboard.dataTable.rowsPerPage": "Lignes par page",
    "modernDashboard.dataTable.pageOf": "Page {page} de {pages}",
    "modernDashboard.dataTable.resultPlural": "résultats",
    "modernDashboard.dataTable.viewInPayload": "Voir dans Payload CMS",

    // ModernDashboard flattened keys for days and months
    "modernDashboard.days.sun": "Dim",
    "modernDashboard.days.mon": "Lun",
    "modernDashboard.days.tue": "Mar",
    "modernDashboard.days.wed": "Mer",
    "modernDashboard.days.thu": "Jeu",
    "modernDashboard.days.fri": "Ven",
    "modernDashboard.days.sat": "Sam",

    "modernDashboard.months.jan": "Jan",
    "modernDashboard.months.feb": "Fév",
    "modernDashboard.months.mar": "Mar",
    "modernDashboard.months.apr": "Avr",
    "modernDashboard.months.may": "Mai",
    "modernDashboard.months.jun": "Jun",
    "modernDashboard.months.jul": "Jul",
    "modernDashboard.months.aug": "Aoû",
    "modernDashboard.months.sep": "Sep",
    "modernDashboard.months.oct": "Oct",
    "modernDashboard.months.nov": "Nov",
    "modernDashboard.months.dec": "Déc",

    // Error handling and connection messages
    "modernDashboard.loadingDataError": "Erreur lors du chargement des données",
    "modernDashboard.connectionError": "Erreur de connexion",
    "modernDashboard.unableToLoadDashboard":
      "Impossible de charger le tableau de bord",
    "modernDashboard.retry": "Réessayer",
    "modernDashboard.viewSubmissionsDirectly":
      "Voir les soumissions directement",
    "modernDashboard.requestTimeout":
      "La requête a expiré. Veuillez réessayer.",
    "modernDashboard.unknownError": "Une erreur inconnue s'est produite",
    "modernDashboard.dataUpdated": "Données mises à jour avec succès",

    // Data table translations
    "modernDashboard.dataTable.noDataFound": "Aucune donnée trouvée",
    "modernDashboard.dataTable.noDataMessage":
      "Aucune soumission ne correspond aux critères sélectionnés",
    "modernDashboard.dataTable.resultSingle": "résultat",
    "modernDashboard.dataTable.resultMultiple": "résultats",
    "modernDashboard.dataTable.notSpecified": "Non spécifié",
    "modernDashboard.dataTable.old": "Ancien",
    "modernDashboard.dataTable.recent": "Récent",

    // Missing modernDashboard keys
    "modernDashboard.bulkActions": "Actions en lot",
    "modernDashboard.cases": "cas",
    "modernDashboard.channelsWithMostComplaints":
      "Chaînes avec le plus de plaintes",
    "modernDashboard.criticalViolationsAnalysis":
      "Analyse des violations critiques",
    "modernDashboard.dismissed": "Rejeté",
    "modernDashboard.evidenceQuality": "Qualité des preuves",
    "modernDashboard.falseAdvertising": "Publicité mensongère",
    "modernDashboard.hateSpeech": "Discours de haine",
    "modernDashboard.high": "Élevé",
    "modernDashboard.inReview": "En cours d'examen",
    "modernDashboard.markedAs": "Marqué comme",
    "modernDashboard.mediaRiskAnalysis": "Analyse des risques médiatiques",
    "modernDashboard.misinformation": "Désinformation",
    "modernDashboard.moderate": "Modéré",
    "modernDashboard.mostFrequentViolations": "Violations les plus fréquentes",
    "modernDashboard.noData": "Aucune donnée",
    "modernDashboard.noDataAvailable": "Aucune donnée disponible",
    "modernDashboard.others": "Autres",
    "modernDashboard.pluralism": "Pluralisme",
    "modernDashboard.privacy": "Confidentialité",
    "modernDashboard.severity": "Gravité",
    "modernDashboard.shockingContent": "Contenu choquant",
    "modernDashboard.updateError": "Erreur de mise à jour",
    "modernDashboard.updatingInProgress": "Mise à jour en cours",
    "modernDashboard.viewDetails": "Voir les détails",
    "modernDashboard.withEvidence": "Avec preuves",
    "modernDashboard.withoutEvidence": "Sans preuves",

    // Common admin translations
    "actions.copyId": "Copier l'ID",
    "actions.delete": "Supprimer",
    "actions.details": "Détails",
    "actions.openMenu": "Ouvrir le menu",
    "actions.selectAll": "Sélectionner tout",
    "actions.selectRow": "Sélectionner la ligne",
    "actions.refresh": "Actualiser",
    "admin.lastUpdated": "Dernière mise à jour",
    "admin.never": "Jamais",
    "admin.justNow": "À l'instant",
    "admin.minutesAgo":
      "Il y a {minutes} minute{minutes, plural, =1 {} other {s}}",
    "admin.hoursAgo": "Il y a {hours} heure{hours, plural, =1 {} other {s}}",
    "common.loading": "Chargement...",
    "common.openInAdmin": "Ouvrir dans l'admin",
    "common.untitled": "Sans titre",
    "common.viewAllSubmissions": "Voir toutes les soumissions",
    "dashboard.subtitle": "Tableau de bord de gestion",
    "dashboard.title": "Tableau de bord HAPA",
    "errors.fetchFailed": "Échec de récupération des données",
    "forms.complaint": "Plainte",
    "forms.report": "Rapport",
    "recent.subtitle": "Aucune soumission récente trouvée",
    "recent.title": "Soumissions récentes",
    "recent.viewAll": "Voir tout",
    "stats.thisWeek": "Cette semaine",
    "stats.total": "Total",
    "table.actions": "Actions",
    "table.language": "Langue",
    "table.priority": "Priorité",
    "table.status": "Statut",
    "table.submittedOn": "Soumis le",
    "table.title": "Titre",
    "table.type": "Type",

    // Quick Actions
    quickActions: {
      title: "Actions rapides",
    },

    // Distribution
    distribution: {
      title: "Distribution",
    },

    // View options
    viewAll: "Voir tout",

    // Submissions
    submissions: {
      allTitle: "Toutes les soumissions",
      description: "Gérer et examiner toutes les soumissions",
      fullTablePlaceholder: "Tableau complet des soumissions",
    },

    // Analytics
    analytics: {
      title: "Analyses",
      description: "Visualiser les tendances et métriques",
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

    // MediaCleanupJobs collection translations - FLATTENED
    "mediaCleanupJobs.singular": "Tâche de Nettoyage Média",
    "mediaCleanupJobs.plural": "Tâches de Nettoyage Média",
    "mediaCleanupJobs.group": "Système",
    "mediaCleanupJobs.description":
      "Suivre et gérer les opérations de nettoyage des fichiers média orphelins",
    "mediaCleanupJobs.titleSuffix": " – Tâches de Nettoyage Média",
    "mediaCleanupJobs.metaDescription":
      "Gérer le nettoyage automatisé des fichiers média orphelins",

    // Dashboard UI
    "mediaCleanupJobs.dashboardTitle": "Tableau de Bord de Nettoyage Média",
    "mediaCleanupJobs.dashboardSubtitle":
      "Gérer les fichiers média orphelins et les opérations de nettoyage",
    "mediaCleanupJobs.settings": "Paramètres",
    "mediaCleanupJobs.scanning": "Scan en cours...",
    "mediaCleanupJobs.scanForOrphaned": "Rechercher les Fichiers Orphelins",
    "mediaCleanupJobs.scanSettings": "Paramètres de Scan",
    "mediaCleanupJobs.directoriesToScan": "Répertoires à Scanner",
    "mediaCleanupJobs.directoriesToScanDesc":
      "Liste des répertoires R2 séparés par des virgules",
    "mediaCleanupJobs.maxFilesToProcess": "Nombre Max de Fichiers à Traiter",
    "mediaCleanupJobs.retentionPeriod": "Période de Rétention (jours)",
    "mediaCleanupJobs.retentionPeriodDesc":
      "Scanner uniquement les fichiers plus anciens que ce nombre de jours",
    "mediaCleanupJobs.dryRunMode":
      "Mode Test (aperçu uniquement, pas de suppression réelle)",
    "mediaCleanupJobs.totalScanned": "Total Scanné",
    "mediaCleanupJobs.filesChecked": "Fichiers vérifiés dans tous les scans",
    "mediaCleanupJobs.orphanedFound": "Orphelins Trouvés",
    "mediaCleanupJobs.orphanedIdentified": "Fichiers orphelins identifiés",
    "mediaCleanupJobs.filesDeleted": "Fichiers Supprimés",
    "mediaCleanupJobs.successfullyDeleted": "Supprimés avec succès",
    "mediaCleanupJobs.storageReclaimed": "Stockage Récupéré",
    "mediaCleanupJobs.totalSpaceReclaimed": "Espace total récupéré",
    "mediaCleanupJobs.jobHistory": "Historique des Tâches",
    "mediaCleanupJobs.noJobsFound": "Aucune tâche de nettoyage trouvée",
    "mediaCleanupJobs.runFirstScan":
      "Lancez un scan pour détecter les fichiers orphelins",
    "mediaCleanupJobs.scanResults": "Résultats du Scan",
    "mediaCleanupJobs.foundOrphaned": "fichiers orphelins trouvés",
    "mediaCleanupJobs.selectAll": "Sélectionner tout",
    "mediaCleanupJobs.cleanupSelected": "Nettoyer les fichiers sélectionnés",
    "mediaCleanupJobs.noFilesFound": "Aucun fichier orphelin trouvé",
    "mediaCleanupJobs.allFilesLinked":
      "Tous les fichiers dans R2 sont correctement liés",
    "mediaCleanupJobs.lastModified": "Dernière modification",
    "mediaCleanupJobs.size": "Taille",
    "mediaCleanupJobs.startCleanup": "Lancer le Nettoyage",
    "mediaCleanupJobs.cleaningInProgress": "Nettoyage en cours...",
    "mediaCleanupJobs.actions": "Actions",
    "mediaCleanupJobs.viewDetails": "Voir les détails",
    "mediaCleanupJobs.executedAt": "Exécuté le",
    "mediaCleanupJobs.completedAt": "Terminé le",
    "mediaCleanupJobs.duration": "Durée",
    "mediaCleanupJobs.filesScanned": "Fichiers scannés",
    "mediaCleanupJobs.filesProcessed": "Fichiers traités",
    "mediaCleanupJobs.deletionErrors": "Erreurs de suppression",
    "mediaCleanupJobs.jobDetails": "Détails de la Tâche",
    "mediaCleanupJobs.executionLog": "Journal d'Exécution",
    "mediaCleanupJobs.errorLog": "Journal d'Erreurs",
    "mediaCleanupJobs.close": "Fermer",

    // Job types
    "mediaCleanupJobs.jobTypesVerification": "Scan de Vérification",
    "mediaCleanupJobs.jobTypesCleanup": "Nettoyage des Fichiers Orphelins",
    "mediaCleanupJobs.jobTypesAudit": "Audit Complet",

    // Status options
    "mediaCleanupJobs.statusPending": "En Attente",
    "mediaCleanupJobs.statusRunning": "En Cours",
    "mediaCleanupJobs.statusCompleted": "Terminé",
    "mediaCleanupJobs.statusFailed": "Échoué",
    "mediaCleanupJobs.statusPartial": "Partiellement Terminé",

    // Field labels
    "mediaCleanupJobs.fieldsJobTypeLabel": "Type de Tâche",
    "mediaCleanupJobs.fieldsStatusLabel": "Statut",
    "mediaCleanupJobs.fieldsOrphanedFilesFilename": "Nom du Fichier",
    "mediaCleanupJobs.fieldsOrphanedFilesPath": "Chemin",

    // Error messages
    "mediaCleanupJobs.errorsScanFailed": "Échec du scan de fichiers orphelins",
    "mediaCleanupJobs.errorsCleanupFailed": "Échec du nettoyage des fichiers",
    "mediaCleanupJobs.errorsNoFilesSelected":
      "Aucun fichier sélectionné pour le nettoyage",
    "mediaCleanupJobs.errorsLoadJobsFailed":
      "Impossible de charger l'historique des tâches",

    // Success/Info messages
    "mediaCleanupJobs.messagesFoundOrphanedFiles":
      "Trouvé {count} fichiers orphelins",
    "mediaCleanupJobs.messagesDryRunCompleted":
      "Test terminé. Supprimerait {count} fichiers",
    "mediaCleanupJobs.messagesFilesDeleted":
      "Supprimé {count} fichiers avec succès",

    // Units and labels
    "mediaCleanupJobs.unitsBytes": "o",
    "mediaCleanupJobs.unitsKilobytes": "Ko",
    "mediaCleanupJobs.unitsMegabytes": "Mo",
    "mediaCleanupJobs.unitsGigabytes": "Go",

    // Additional labels
    "mediaCleanupJobs.labelsTotal": "total",
    "mediaCleanupJobs.labelsPlaceholderDirectories": "forms/, media/",

    // BeforeDashboard component translations - FLATTENED
    "beforeDashboard.title": "Tableau de bord HAPA",
    "beforeDashboard.subtitle":
      "Interface d'administration - Haute Autorité de la Presse et de l'Audiovisuel",
    "beforeDashboard.mediaSubmissions": "Soumissions Médiatiques",
    "beforeDashboard.manageCollections": "Gérer les Collections",
    "beforeDashboard.mediaSubmissionsAria":
      "Ouvrir les soumissions médiatiques",
    "beforeDashboard.manageCollectionsAria": "Gérer les collections",

    // Media Gallery component translations
    "mediaGallery.mediaFiles": "Fichiers médias",
    "mediaGallery.clickToPreviewPDF":
      "Cliquez sur Prévisualiser pour ouvrir le PDF",
    "mediaGallery.previewFile": "Prévisualiser",

    // File Display component translations
    "fileDisplay.fileWithoutURL": "Fichier sans URL",
    "fileDisplay.downloadedFile": "Fichier téléchargé",
    "fileDisplay.fileNumber": "Fichier {number}",
    "fileDisplay.openFileInNewTab": "Ouvrir {filename} dans un nouvel onglet",
    "fileDisplay.downloadFileTitle": "Télécharger le fichier",
  },
  ar: {
    // Plugin-generated collections
    general: {
      search: "نتائج البحث",
      dashboard: "لوحة تحكم هابا",
      adminPanel: "واجهة إدارة هابا",
      welcome: "مرحباً بك في واجهة إدارة هابا",
    },

    // ConsolidatedDashboard translations
    dashboard: {
      title: "مركز إدارة المحتوى الإعلامي",
      subtitle: "الإدارة الشاملة للتقارير والشكاوى الإعلامية",
      refresh: "تحديث",
      selected: "محدد",
      actions: "الإجراءات",
      bulkUpdateStatus: "تحديث الحالة",
      bulkUpdatePriority: "تحديث الأولوية",
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

    // Form types
    forms: {
      report: "تقرير إعلامي",
      complaint: "شكوى إعلامية",
    },

    // Statistics
    stats: {
      total: "إجمالي المحتويات المقدمة",
      reports: "التبليغات",
      complaints: "الشكاوى المقدمة",
      pending: "في انتظار المراجعة",
      resolved: "تم الإنجاز",
      resolutionRate: "معدل الحل",
      urgent: "حالات عاجلة",
      thisWeek: "هذا الأسبوع",
      responseTime: "زمن الاستجابة",
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
      submissions: "المحتويات المقدمة",
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
      title: "تفاصيل المحتوى الإعلامي المقدم",
      contentInfo: "معلومات المحتوى الإعلامي",
      complainantInfo: "معلومات مقدم البلاغ",
      programName: "اسم البرنامج",
      mediaType: "نوع الوسائل الإعلامية",
      language: "اللغة",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      notSpecified: "غير محدد",
      french: "الفرنسية",
      arabic: "العربية",
    },

    // Recent submissions
    recent: {
      title: "المحتوى الإعلامي المقدم مؤخراً",
      viewAll: "عرض جميع المحتويات",
      subtitle: "آخر المحتويات الإعلامية المقدمة",
    },

    // Empty state
    empty: {
      title: "لا يوجد محتوى إعلامي مقدم",
      description: "لا توجد أي محتويات إعلامية مقدمة حتى الآن.",
    },

    // Additional labels
    common: {
      loading: "جاري تحميل البيانات...",
      viewAllSubmissions: "عرض جميع المحتويات الإعلامية",
      requiresReview: "تتطلب مراجعة",
      today: "اليوم",
      anonymous: "مجهول",
      quickActions: "إجراءات سريعة",
      export: "تصدير",
      import: "استيراد",
      statusDistribution: "توزيع الحالات",
      priorityLevels: "مستويات الأولوية",
      recentSubmissions: "المحتويات الإعلامية المقدمة مؤخراً",
      viewAll: "عرض الكل",
      submissionManagement: "إدارة المحتويات الإعلامية",
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

    // Admin time/date translations
    admin: {
      lastUpdated: "آخر تحديث",
      never: "أبداً",
      justNow: "للتو",
      minutesAgo: "منذ {minutes} دقيقة",
      hoursAgo: "منذ {hours} ساعة",
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

    // ModernDashboard specific translations
    modernDashboard: {
      // Headers
      controlCenterTitle: "مركز إدارة الهيئة العليا للصحافة والسمعي البصري",
      mediaSubmissionsManagement: "إدارة الشكاوى والتبليغات الإعلامية",

      // Time ranges
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يومًا",
      allData: "جميع البيانات",
      timeRange7d: "7أ",
      timeRange30d: "30أ",
      timeRangeAll: "الكل",
      dataAnalysisPeriod: "فترة تحليل البيانات",

      // Actions
      export: "تصدير",
      exportToExcel: "تصدير البيانات بتنسيق Excel",
      retry: "إعادة المحاولة",
      viewSubmissionsDirectly: "عرض المحتويات مباشرة",
      viewDetails: "عرض التفاصيل",

      // Statistics
      totalSubmissions: "إجمالي الطلبات المقدمة",
      last30DaysLabel: "آخر 30 يوماً",
      urgentActionRequired: "إجراء عاجل مطلوب",
      criticalComplaints: "شكاوى حرجة",
      submissionsToProcess: "طلبات تحتاج معالجة",
      responseTime: "متوسط وقت الاستجابة",
      average: "المتوسط",
      overdueFiles: "ملفات متأخرة",
      moreThan7Days: "أكثر من 7 أيام",
      vsLastMonth: "مقابل الشهر الماضي",
      vsPreviousMonth: "مقابل الشهر السابق",
      vsLastWeek: "مقابل الأسبوع الماضي",
      immediateAttentionRequired: "يتطلب اهتمامًا فوريًا",
      excellent: "ممتاز",
      attention: "انتباه",
      resolutionRate: "معدل الحل",
      complaints: "شكاوى",
      reports: "تبليغات",
      dateRange: "جميع البيانات",
      completionPercentage: "35% اكتمال",

      // Risk Analysis
      mediaRiskAnalysis: "تحليل مخاطر الوسائط",
      channelsWithMostComplaints: "القنوات/البرامج الأكثر شكاوى في الانتظار",

      // Violations
      criticalViolationsAnalysis: "تحليل الانتهاكات الحرجة",
      mostFrequentViolations:
        "أنواع الانتهاكات الأكثر تكرارًا التي تتطلب إجراءً تنظيميًا",
      hateSpeech: "خطاب الكراهية",
      misinformation: "معلومات مضللة",
      privacy: "الخصوصية",
      shockingContent: "محتوى صادم",
      pluralism: "التعددية",
      falseAdvertising: "إعلان كاذب",
      others: "أخرى",
      cases: "حالات",
      severity: "الشدة",
      high: "عالية",
      moderate: "متوسطة",
      withEvidence: "مع أدلة",
      withoutEvidence: "بدون أدلة",
      evidenceQuality: "جودة الأدلة",

      // Form Analysis
      formTypesAnalysis: "تحليل أنواع النماذج",
      distributionAndPriorities: "التوزيع والأولويات حسب نوع الطلب",
      complaintsLabel: "شكاوى",
      reportsLabel: "تبليغات",
      pending: "في الانتظار",
      urgent: "عاجل",
      withContact: "مع جهة اتصال",
      anonymous: "مجهول",

      // Charts
      weeklyTrend: "الاتجاه الأسبوعي",
      submissionsAndResolutions7Days: "الطلبات والحلول خلال آخر 7 أيام",
      submissions: "الطلبات المقدمة",
      statusDistribution: "توزيع الحالات",
      currentDistribution: "التوزيع الحالي للطلبات",
      monthlyAnalysis: "التحليل الشهري",
      realEvolution6Months: "تطور الطلبات المقدمة خلال آخر 6 أشهر",
      total: "العدد الإجمالي",
      recentSubmissions: "الطلبات الحديثة",
      allSubmissionsWithPagination: "جميع الطلبات مع إمكانية التصفية والترتيب",

      // Status updates
      markedAs: "تم تصنيف الطلب كـ",
      inReview: "قيد المراجعة",
      dismissed: "مرفوض",

      // Messages
      dataUpdated: "تم تحديث البيانات",
      unknownError: "خطأ غير معروف",
      requestTimeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
      loadingDataError: "خطأ في تحميل البيانات",
      updatingInProgress: "جاري التحديث...",
      updateError: "خطأ في التحديث",

      // Errors
      connectionError: "خطأ في الاتصال",
      noData: "لا توجد بيانات",
      unableToLoadDashboard: "غير قادر على تحميل بيانات لوحة القيادة",
      noDataAvailable: "لا توجد بيانات متاحة في الوقت الحالي",

      // Month names
      months: {
        jan: "يناير",
        feb: "فبراير",
        mar: "مارس",
        apr: "أبريل",
        may: "مايو",
        jun: "يونيو",
        jul: "يوليو",
        aug: "أغسطس",
        sep: "سبتمبر",
        oct: "أكتوبر",
        nov: "نوفمبر",
        dec: "ديسمبر",
      },

      // Day names
      days: {
        sun: "الأحد",
        mon: "الإثنين",
        tue: "الثلاثاء",
        wed: "الأربعاء",
        thu: "الخميس",
        fri: "الجمعة",
        sat: "السبت",
      },

      // DataTable translations
      dataTable: {
        // Table headers
        typeHeader: "النوع",
        submitterHeader: "المُرسِل",
        mediaHeader: "الوسائط/البرنامج",
        dateHeader: "التاريخ",
        statusHeader: "الحالة",
        priorityHeader: "الأولوية",
        actionsHeader: "الإجراءات",

        // Form type display
        complaint: "شكوى",
        report: "بلاغ",
        complaints: "شكاوى",
        reports: "بلاغات",

        // User display
        anonymous: "مجهول",

        // Locale display
        french: "🇫🇷 Français",
        arabic: "🇲🇷 العربية",

        // Media type
        notSpecified: "غير محدد",

        // Time status
        recent: "حديث",
        old: "قديم",
        hoursAgo: "{hours}س",
        daysAgo: "{days}ي",

        // Priority values (consistent with component)
        urgentPriority: "عاجل",
        highPriority: "عالي",
        mediumPriority: "متوسط",
        lowPriority: "منخفض",

        // Status values (consistent with component)
        pendingStatus: "في انتظار المراجعة",
        resolvedStatus: "محلول",
        dismissedStatus: "مرفوضة",
        reviewingStatus: "قيد الدراسة",

        // Action menu items
        viewDetails: "عرض التفاصيل",
        markInReview: "وضع علامة قيد المراجعة",
        markResolved: "وضع علامة كمحلول",
        reject: "رفض",

        // Search and filters
        searchPlaceholder: "البحث (الاسم، الايميل، البرنامج، الوسائط)...",
        statusFilter: "الحالة",
        priorityFilter: "الأولوية",
        typeFilter: "النوع",
        resetFilters: "إعادة تعيين المرشحات",

        // Filter options
        allStatuses: "جميع الحالات",
        allTypes: "جميع الأنواع",
        allPriorities: "جميع الأولويات",

        // Pagination
        rowsPerPage: "صفوف لكل صفحة:",
        pageOf: "صفحة", // Will be used with current/total values separately
        resultSingle: "نتيجة",
        resultPlural: "نتائج",

        // Empty state
        noDataFound: "لم يتم العثور على طلبات",
        noDataMessage: "حاول تعديل المرشحات أو البحث",

        // External link
        viewInPayload: "عرض في Payload CMS",
      },
    },

    // Bulk actions menu items (renamed to avoid conflict with top-level bulkActions)
    bulkActionsMenu: {
      resolve: "حل المحدد",
      dismiss: "رفض المحدد",
      export: "تصدير المحدد",
    },

    // Common admin translations (Arabic)
    "actions.refresh": "تحديث",
    "admin.lastUpdated": "آخر تحديث",
    "admin.never": "أبداً",
    "admin.justNow": "للتو",
    "admin.minutesAgo": "منذ {minutes} دقيقة",
    "admin.hoursAgo": "منذ {hours} ساعة",

    // Status labels - FLATTENED for Payload CMS (Arabic)
    "status.pending": "قيد الانتظار",
    "status.reviewing": "قيد المراجعة",
    "status.resolved": "تم الحل",
    "status.dismissed": "مرفوض",

    // Priority labels - FLATTENED for Payload CMS (Arabic)
    "priority.urgent": "عاجل",
    "priority.high": "عالي",
    "priority.medium": "متوسط",
    "priority.low": "منخفض",

    // BeforeDashboard component translations - FLATTENED (Arabic)
    "beforeDashboard.title": "لوحة تحكم HAPA",
    "beforeDashboard.subtitle": "واجهة الإدارة - الهيئة العليا للصحافة والسمعي البصري",
    "beforeDashboard.mediaSubmissions": "الطلبات الإعلامية",
    "beforeDashboard.manageCollections": "إدارة المجموعات",
    "beforeDashboard.mediaSubmissionsAria": "فتح الطلبات الإعلامية",
    "beforeDashboard.manageCollectionsAria": "إدارة المجموعات",

    // ModernDashboard flattened keys - Essential for dashboard functionality (Arabic)
    "modernDashboard.controlCenterTitle": "مركز التحكم هابا",
    "modernDashboard.mediaSubmissionsManagement": "إدارة المحتويات الإعلامية",
    "modernDashboard.last7Days": "آخر 7 أيام",
    "modernDashboard.last30Days": "آخر 30 يوماً",
    "modernDashboard.allData": "جميع البيانات",
    "modernDashboard.timeRange7d": "7 أيام",
    "modernDashboard.timeRange30d": "30 يوماً",
    "modernDashboard.timeRangeAll": "الكل",
    "modernDashboard.dataAnalysisPeriod": "فترة تحليل البيانات",
    "modernDashboard.export": "تصدير",
    "modernDashboard.exportToExcel": "تصدير البيانات بصيغة Excel",
    "modernDashboard.totalSubmissions": "إجمالي المحتويات المقدمة",
    "modernDashboard.last30DaysLabel": "آخر 30 يوماً",
    "modernDashboard.urgentActionRequired": "إجراء عاجل مطلوب",
    "modernDashboard.criticalComplaints": "شكاوى حرجة",
    "modernDashboard.pending": "قيد الانتظار",
    "modernDashboard.submissionsToProcess": "محتويات للمعالجة",
    "modernDashboard.responseTime": "وقت الاستجابة",
    "modernDashboard.average": "المتوسط",
    "modernDashboard.overdueFiles": "ملفات متأخرة",
    "modernDashboard.moreThan7Days": "أكثر من 7 أيام",
    "modernDashboard.vsLastMonth": "مقابل الشهر الماضي",
    "modernDashboard.vsPreviousMonth": "مقابل الشهر السابق",
    "modernDashboard.vsLastWeek": "مقابل الأسبوع الماضي",
    "modernDashboard.immediateAttentionRequired": "يتطلب اهتماماً فورياً",
    "modernDashboard.excellent": "ممتاز",
    "modernDashboard.attention": "انتباه",
    "modernDashboard.resolutionRate": "معدل الحل",
    "modernDashboard.complaints": "شكاوى",
    "modernDashboard.reports": "تبليغات",
    "modernDashboard.dateRange": "من 1 ديسمبر - 31 ديسمبر، 2024",
    "modernDashboard.completionPercentage": "35% اكتمال",
    "modernDashboard.resolved": "تم الحل",
    "modernDashboard.urgent": "عاجل",
    "modernDashboard.complaintsLabel": "الشكاوى",
    "modernDashboard.reportsLabel": "التبليغات",
    "modernDashboard.withContact": "مع معلومات الاتصال",
    "modernDashboard.anonymous": "مجهول",
    "modernDashboard.formTypesAnalysis": "تحليل أنواع النماذج",
    "modernDashboard.distributionAndPriorities":
      "التوزيع والأولويات حسب نوع المحتوى",
    "modernDashboard.weeklyTrend": "الاتجاه الأسبوعي",
    "modernDashboard.submissionsAndResolutions7Days":
      "المحتويات والحلول خلال 7 أيام",
    "modernDashboard.submissions": "المحتويات المقدمة",
    "modernDashboard.statusDistribution": "توزيع الحالات",
    "modernDashboard.currentDistribution": "التوزيع الحالي للمحتويات",
    "modernDashboard.monthlyAnalysis": "التحليل الشهري",
    "modernDashboard.realEvolution6Months":
      "التطور الفعلي للمحتويات خلال 6 أشهر",
    "modernDashboard.total": "الإجمالي",
    "modernDashboard.recentSubmissions": "المحتويات المقدمة مؤخراً",
    "modernDashboard.allSubmissionsWithPagination":
      "جميع المحتويات مع الترقيم والفرز والتصفية المتقدمة",

    // ModernDashboard dataTable translations (Arabic)
    "modernDashboard.dataTable.noDataFound": "لا توجد طلبات",
    "modernDashboard.dataTable.noDataMessage":
      "لا توجد شكاوى أو تبليغات تتوافق مع معايير البحث المحددة",
    "modernDashboard.dataTable.typeHeader": "النوع",
    "modernDashboard.dataTable.submitterHeader": "المُقدِّم",
    "modernDashboard.dataTable.mediaHeader": "الوسيلة/البرنامج",
    "modernDashboard.dataTable.dateHeader": "التاريخ",
    "modernDashboard.dataTable.statusHeader": "الحالة",
    "modernDashboard.dataTable.priorityHeader": "الأولوية",
    "modernDashboard.dataTable.actionsHeader": "الإجراءات",
    "modernDashboard.dataTable.complaint": "شكوى",
    "modernDashboard.dataTable.report": "تبليغ",
    "modernDashboard.dataTable.complaints": "الشكاوى",
    "modernDashboard.dataTable.reports": "التبليغات",
    "modernDashboard.dataTable.anonymous": "مجهول",
    "modernDashboard.dataTable.french": "🇫🇷 الفرنسية",
    "modernDashboard.dataTable.arabic": "🇲🇷 العربية",
    "modernDashboard.dataTable.pendingStatus": "قيد الانتظار",
    "modernDashboard.dataTable.reviewingStatus": "قيد المراجعة",
    "modernDashboard.dataTable.resolvedStatus": "تم الحل",
    "modernDashboard.dataTable.dismissedStatus": "مرفوض",
    "modernDashboard.dataTable.urgentPriority": "عاجل",
    "modernDashboard.dataTable.highPriority": "عالي",
    "modernDashboard.dataTable.mediumPriority": "متوسط",
    "modernDashboard.dataTable.lowPriority": "منخفض",
    "modernDashboard.dataTable.viewDetails": "عرض التفاصيل",
    "modernDashboard.dataTable.markInReview": "وضع علامة قيد المراجعة",
    "modernDashboard.dataTable.markResolved": "وضع علامة تم الحل",
    "modernDashboard.dataTable.reject": "رفض",
    "modernDashboard.dataTable.searchPlaceholder": "بحث...",
    "modernDashboard.dataTable.statusFilter": "تصفية حسب الحالة",
    "modernDashboard.dataTable.allStatuses": "جميع الحالات",
    "modernDashboard.dataTable.priorityFilter": "تصفية حسب الأولوية",
    "modernDashboard.dataTable.allPriorities": "جميع الأولويات",
    "modernDashboard.dataTable.typeFilter": "تصفية حسب النوع",
    "modernDashboard.dataTable.allTypes": "جميع الأنواع",
    "modernDashboard.dataTable.resetFilters": "إعادة تعيين التصفية",
    "modernDashboard.dataTable.rowsPerPage": "صفوف في الصفحة",
    "modernDashboard.dataTable.pageOf": "صفحة {page} من {pages}",
    "modernDashboard.dataTable.resultSingle": "نتيجة",
    "modernDashboard.dataTable.resultPlural": "نتائج",
    "modernDashboard.dataTable.viewInPayload": "عرض في Payload CMS",

    // ModernDashboard flattened keys for days and months (Arabic)
    "modernDashboard.days.sun": "الأحد",
    "modernDashboard.days.mon": "الإثنين",
    "modernDashboard.days.tue": "الثلاثاء",
    "modernDashboard.days.wed": "الأربعاء",
    "modernDashboard.days.thu": "الخميس",
    "modernDashboard.days.fri": "الجمعة",
    "modernDashboard.days.sat": "السبت",

    "modernDashboard.months.jan": "يناير",
    "modernDashboard.months.feb": "فبراير",
    "modernDashboard.months.mar": "مارس",
    "modernDashboard.months.apr": "أبريل",
    "modernDashboard.months.may": "مايو",
    "modernDashboard.months.jun": "يونيو",
    "modernDashboard.months.jul": "يوليو",
    "modernDashboard.months.aug": "أغسطس",
    "modernDashboard.months.sep": "سبتمبر",
    "modernDashboard.months.oct": "أكتوبر",
    "modernDashboard.months.nov": "نوفمبر",
    "modernDashboard.months.dec": "ديسمبر",

    // Error handling and connection messages (Arabic)
    "modernDashboard.loadingDataError": "خطأ في تحميل البيانات",
    "modernDashboard.connectionError": "خطأ في الاتصال",

    // Media Gallery component translations (Arabic)
    "mediaGallery.mediaFiles": "الملفات الإعلامية",
    "mediaGallery.clickToPreviewPDF": "انقر على معاينة لفتح ملف PDF",
    "mediaGallery.previewFile": "معاينة",

    // File Display component translations (Arabic)
    "fileDisplay.fileWithoutURL": "ملف بدون رابط",
    "fileDisplay.downloadedFile": "ملف تم تحميله",
    "fileDisplay.fileNumber": "ملف {number}",
    "fileDisplay.openFileInNewTab": "فتح {filename} في علامة تبويب جديدة",
    "fileDisplay.downloadFileTitle": "تحميل الملف",
  },
};

export type AdminTranslationsObject = typeof adminTranslations.fr &
  typeof enTranslations;
export type AdminTranslationsKeys =
  | NestedKeysStripped<AdminTranslationsObject>
  | NestedKeysStripped<typeof adminTranslations.fr>;
