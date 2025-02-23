/**
 * This file is use for exporting all the types and components from the package.
 */

/**
 * Types from MicroStrategy Embedding SDK
 *
 * These are the Types from MicroStrategy Embedding SDK that is exported from the package.
 *
 * @see https://microstrategy.github.io/embedding-sdk-docs/
 */

export {
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
  Settings,
} from "./types";

export type {
  DossierConsumptionSettings,
  BotConsumptionSettings,
} from "./types/settings";

export type { EventTypes, EventHandler, EventHandlers } from "./types/events";

export { EVENT_TYPE } from "./constants/eventType";

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

/**
 * Components
 *
 * This is all the components that are exported from the package.
 */

export { DashboardEmbed } from "./components/DashboardEmbed";
export { LibraryPageEmbed } from "./components/LibraryPageEmbed";
export { BotConsumptionPage } from "./components/BotConsumptionPage";
export { DashboardEmbedWithAuth } from "./components/DashboardEmbedWithAuth";

/**
 * Hooks
 *
 * This is all the hooks that are exported from the package.
 */

export { useLoadMstrSDK } from "./hooks/useLoadMstrSDK";
export { useCreateDashboard } from "./hooks/useCreateDashboard";
export { useCreateLibraryPage } from "./hooks/useCreateLibraryPage";
export { useCreateBotConsumptionPage } from "./hooks/useCreateBotConsumptionPage";
export { useCreateDashboardWithAuth } from "./hooks/useCreateDashboardWithAuth";

/**
 * Utils
 *
 * This is all the utils that are exported from the package.
 */

export { getServerUrl, getAuthToken, getInfoFromUrl } from "./utils";
