import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    title: "Introduction",
    href: "/introduction",
    heading: "Getting started",
    items: [
      {
        title: "Installation",
        href: "/installation",
      },
      {
        title: "Configure Library Server",
        href: "/configure-library-server",
      },
      {
        title: "Quick Start",
        href: "/quick-start",
      },
      {
        title: "Changelog",
        href: "/changelog",
      },
    ],
  },
  {
    title: "Embedding Use Cases",
    href: "/embedding-use-cases",
    heading: "Use Cases",
    items: [
      {
        title: "Dashboard Use Case",
        href: "/dashboard-use-case",
      },
      {
        title: "Library Page Use Case",
        href: "/library-page-use-case",
      },
      {
        title: "Bot Page Use Case",
        href: "/bot-page-use-case",
      },
    ],
  },
  {
    title: "Authentication Modes",
    href: "/authentication",
    heading: "Authentication",
    items: [
      { title: "Guest Authentication", href: "/guest-authentication" },
      { title: "Standard Authentication", href: "/standard-authentication" },
      { title: "SAML Authentication", href: "/saml-authentication" },
      { title: "OIDC Authentication", href: "/oidc-authentication" },
    ],
  },
  {
    title: "Functionalities",
    href: "/functionalities",
    heading: "Functionalities",
    items: [
      { title: "Navigation", href: "/navigation" },
      { title: "Filters", href: "/filters" },
      { title: "Event Handling", href: "/event-handling" },
      { title: "Error Handling", href: "/error-handling" },
    ],
  },
  {
    title: "About API Reference",
    href: "/api-reference",
    heading: "API Reference",
    items: [
      { title: "<DashboardEmbed />", href: "/dashboard-embed" },
      {
        title: "<DashboardEmbedWithAuth />",
        href: "/dashboard-embed-with-auth",
      },
      { title: "<LibraryPageEmbed />", href: "/library-page-embed" },
      {
        title: "<LibraryPageEmbedWithAuth />",
        href: "/library-page-embed-with-auth",
      },
      { title: "<BotConsumptionPage />", href: "/bot-consumption-page" },
      {
        title: "<BotConsumptionPageWithAuth />",
        href: "/bot-consumption-page-with-auth",
      },
      {
        title: "useLoadMstrSDK()",
        href: "/use-load-mstr-sdk",
      },
      {
        title: "useCreateDashboard()",
        href: "/use-create-dashboard",
      },
      {
        title: "useCreateDashboardWithAuth()",
        href: "/use-create-dashboard-with-auth",
      },
      {
        title: "useCreateLibraryPage()",
        href: "/use-create-library-page",
      },
      {
        title: "useCreateLibraryPageWithAuth()",
        href: "/use-create-library-page-with-auth",
      },
      {
        title: "useCreateBotConsumptionPage()",
        href: "/use-create-bot-consumption-page",
      },
      {
        title: "useCreateBotConsumptionPageWithAuth()",
        href: "/use-create-bot-consumption-page-with-auth",
      },
      {
        title: "Types and Interfaces",
        href: "/types-and-interfaces",
        items: [
          { title: "MicroStrategy SDK", href: "/microstrategy-sdk" },
          {
            title: "MicroStrategyDossierConfig",
            href: "/microstrategy-dossier-config",
          },
          {
            title: "MicroStrategyDossierConfigCustomAuthenticationType",
            href: "/microstrategy-dossier-config-custom-authentication-type",
          },
          { title: "MicroStrategyDossier", href: "/microstrategy-dossier" },
          { title: "EmbeddingContexts", href: "/embedding-contexts" },
          {
            title: "EmbedLibraryPageConfig",
            href: "/embed-library-page-config",
          },
          { title: "EmbedLibraryPage", href: "/embed-library-page" },
          {
            title: "EmbedDossierConsumptionPageConfig",
            href: "/embed-dossier-consumption-page-config",
          },
          {
            title: "EmbedBotConsumptionPageConfig",
            href: "/embed-bot-consumption-page-config",
          },
          {
            title: "EmbedBotConsumptionPage",
            href: "/embed-bot-consumption-page",
          },
          { title: "EmbedReportPageConfig", href: "/embed-report-page-config" },
          { title: "EmbedReportPage", href: "/embed-report-page" },
          {
            title: "EmbedDossierConsumptionPage",
            href: "/embed-dossier-consumption-page",
          },
          { title: "Settings", href: "/settings" },
          { title: "EventTypes", href: "/event-types" },
          { title: "EventHandler", href: "/event-handler" },
          { title: "EventHandlers", href: "/event-handlers" },
          {
            title: "FilterTypeInfoCalendar",
            href: "/filter-type-info-calendar",
          },
          {
            title: "FilterTypeInfoMetricQualByValue",
            href: "/filter-type-info-metric-qual-by-value",
          },
          { title: "TableOfContents", href: "/table-of-contents" },
          { title: "DossierPage", href: "/dossier-page" },

          { title: "DossierChapter", href: "/dossier-chapter" },
          {
            title: "DockedCommentAndFilter",
            href: "/docked-comment-and-filter",
          },
          { title: "DockedTheme", href: "/docked-theme" },
          { title: "NavigationBar", href: "/navigation-bar" },
          { title: "CustomUi", href: "/custom-ui" },
          { title: "OptionsFeature", href: "/options-feature" },
          { title: "ShareFeature", href: "/share-feature" },
          { title: "CurrentPage", href: "/current-page" },
          { title: "PageInfo", href: "/page-info" },
        ],
      },
    ],
  },
  {
    title: "Examples Implementation",
    href: "/examples",
    heading: "Examples",
  },
]
