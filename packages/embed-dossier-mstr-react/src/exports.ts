/**
 * embed-dossier-mstr-react
 *
 * A production-ready React library for embedding MicroStrategy Dossiers,
 * Reports, and Bot Consumption pages.
 *
 * @packageDocumentation
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  MicroStrategySDK,
  MicroStrategyDossierConfig,
  MicroStrategyDossierConfigCustomAuthenticationType,
  MicroStrategyDossier,
  EmbeddingContexts,
  EmbedLibraryPageConfig,
  EmbedLibraryPage,
  EmbedDossierConsumptionPageConfig,
  EmbedBotConsumptionPageConfig,
  EmbedReportPageConfig,
  EmbedReportPage,
  EmbedDossierConsumptionPage,
  EmbedBotConsumptionPage,
} from "./types";

export { Settings } from "./types";

export type {
  DossierConsumptionSettings,
  BotConsumptionSettings,
} from "./types/settings";

export type { EventTypes, EventHandler, EventHandlers } from "./types/events";

export type {
  FilterTypeInfoCalendar,
  FilterTypeInfoMetricQualByValue,
} from "./types/filter";

export type {
  TableOfContents,
  DossierPage,
  DossierChapter,
} from "./types/navigation";

export type {
  DockedCommentAndFilter,
  DockedTheme,
  NavigationBar,
  CustomUi,
  OptionsFeature,
  ShareFeature,
  CurrentPage,
  PageInfo,
} from "./types/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

export { EVENT_TYPE } from "./constants/eventType";
export type { EventTypeValue } from "./constants/eventType";

// ─── Components ──────────────────────────────────────────────────────────────

export { DashboardEmbed } from "./components/DashboardEmbed";
export type { DashboardEmbedProps } from "./components/DashboardEmbed";

export { DashboardEmbedWithAuth } from "./components/DashboardEmbedWithAuth";
export type { DashboardEmbedWithAuthProps } from "./components/DashboardEmbedWithAuth";

export { LibraryPageEmbed } from "./components/LibraryPageEmbed";
export type { LibraryPageEmbedProps } from "./components/LibraryPageEmbed";

export { LibraryPageEmbedWithAuth } from "./components/LibraryPageEmbedWithAuth";
export type { LibraryPageEmbedWithAuthProps } from "./components/LibraryPageEmbedWithAuth";

export { BotConsumptionPage } from "./components/BotConsumptionPage";
export type { BotConsumptionPageProps } from "./components/BotConsumptionPage";

export { BotConsumptionPageWithAuth } from "./components/BotConsumptionPageWithAuth";
export type { BotConsumptionPageWithAuthProps } from "./components/BotConsumptionPageWithAuth";

// ─── Hooks ───────────────────────────────────────────────────────────────────

export { useLoadMstrSDK } from "./hooks/useLoadMstrSDK";
export { useCreateDashboard } from "./hooks/useCreateDashboard";
export type { UseCreateDashboardProps } from "./hooks/useCreateDashboard";
export { useCreateDashboardWithAuth } from "./hooks/useCreateDashboardWithAuth";
export { useCreateLibraryPage } from "./hooks/useCreateLibraryPage";
export { useCreateLibraryPageWithAuth } from "./hooks/useCreateLibraryPageWithAuth";
export { useCreateBotConsumptionPage } from "./hooks/useCreateBotConsumptionPage";
export { useCreateBotConsumptionPageWithAuth } from "./hooks/useCreateBotConsumptionPageWithAuth";

// ─── Utilities ───────────────────────────────────────────────────────────────

export { getServerUrl, getAuthToken, getInfoFromUrl } from "./utils";
