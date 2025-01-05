import { EVENT_TYPE } from "../constants/eventType";
import { Filter, FilterListType, FilterSelection } from "./filter";
import {
  CustomUi,
  DockedCommentAndFilter,
  DockedTheme,
  NavigationBar,
  OptionsFeature,
  ShareFeature,
} from "./utils";

/**
 * MicroStrategy SDK
 *
 * This global declare for MicroStrategy SDK is used to declare the global
 * window object for MicroStrategy SDK.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs
 *
 */

declare global {
  interface Window {
    microstrategy: MicroStrategySDK;
  }
}

/**
 * Interface for MicroStrategy SDK
 *
 * These are some interfaces that we need for embedding dossier.
 * Interfaces that we create are based on the MicroStrategy SDK documentation and also the implementation on the MicroStrategy Embedding SDK Playground.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/playground/
 *
 */

interface MicroStrategySDK {
  dossier: {
    create: (
      config: MicroStrategyDossierConfig
    ) => Promise<MicroStrategyDossier>;
    destroy: () => void;
    CustomAuthenticationType: {
      AUTH_TOKEN: string;
      IDENTITY_TOKEN: string;
    };
    EventType: EVENT_TYPE;
  };
  auth: {
    oidcLogin: (serverUrl: string) => Promise<string>;
    samlLogin: (serverUrl: string) => Promise<string>;
  };
  embedding: {
    featureFlags: Record<string, unknown> | unknown;
  };
  embeddingContexts: {
    embedLibraryPage: (
      config: EmbedLibraryPageConfig
    ) => Promise<EmbedLibraryPage>;
    embedDossierConsumptionPage: (
      config: EmbedDossierConsumptionPageConfig
    ) => Promise<EmbedDossierConsumptionPage>;
    embedBotConsumptionPage: (
      config: EmbedBotConsumptionPageConfig
    ) => Promise<EmbedBotConsumptionPage>;
    embedReportPage: (
      config: EmbedReportPageConfig
    ) => Promise<EmbedReportPage>;
  };
}

/**
 * Interfaces for Embedding types of Embedded Dashboard and other Embedding Contexts
 *
 * When this package created, we only need to create the interface for MicroStrategy Dossier.
 * But when we want to create the interface for other Embedding Contexts, we need to create the interface for them.
 *
 * Each Embedding Context has its own properties and methods.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs
 *
 */

/**
 * Interface for MicroStrategy Dossier Config Properties
 *
 * This interface is used to declare the MicroStrategy Dossier Config Properties.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface MicroStrategyDossierConfig {
  placeholder: HTMLElement | null; // Required
  url: string; // Required
  containerHeight?: string; // Optional
  containerWidth?: string; // Optional
  customAuthenticationType?: MicroStrategyDossierConfigCustomAuthenticationType; // Optional
  disableNotification?: boolean; // Optional
  disableErrorPopupWindow?: boolean; // Optional
  dockedComment?: DockedCommentAndFilter; // Optional
  dockedFilter?: DockedCommentAndFilter; // Optional
  dockedTheme?: DockedTheme;
  dossierFeature?: {
    readonly?: boolean;
  };
  enableCollaboration?: boolean; // Optional
  enableCustomAuthentication?: boolean; // Optional
  enableResponsive?: boolean; // Optional
  filterFeature?: {
    enabled?: boolean;
    edit?: boolean;
    summary?: boolean;
  };
  filters?: Filter[]; // Optional
  getLoginToken?: () => Promise<string | void>; // Optional
  instance?: {
    mid?: string;
    id?: string;
    status?: string | number;
    partialManipulation?: boolean;
  };
  navigationBar?: NavigationBar; // Optional
  customUi?: CustomUi; // Optional
  optionsFeature?: OptionsFeature; // Optional
  shareFeature?: ShareFeature; // Optional
  smartBanner?: boolean; // Optional
  tocFeature?: {
    enabled?: boolean;
  };
  uiMessage?: {
    enabled?: boolean;
    addToLibrary?: boolean;
  };
  visibleTutorials?: {
    library: boolean;
    welcome: boolean;
    dossier: boolean;
    notification: boolean;
  };
}

/**
 * Interface for MicroStrategy Dossier Config Custom Authentication Type
 *
 * This interface is used to declare the MicroStrategy Dossier Config Custom Authentication Type.
 *
 * In MicroStrategy Embedding SDK, we can use two types of authentication: AUTH_TOKEN and IDENTITY_TOKEN.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface MicroStrategyDossierConfigCustomAuthenticationType {
  AUTH_TOKEN: string;
  IDENTITY_TOKEN: string;
}

interface MicroStrategyDossier {
  close: () => void;
  refresh: () => void;
  resize: (width: string, height: string) => void;
  getDossierInstanceId: () => Promise<string>;
  getFilterList: () => Promise<FilterListType[]>;
  filterSelectMultiAttributes: (params: {
    filterInfo: { key: string };
    selections: FilterSelection[];
    holdSubmit: boolean;
  }) => void;
  filterSelectSingleAttribute: (params: {
    filterInfo: { key: string };
    selection: FilterSelection;
    holdSubmit: boolean;
  }) => void;
  filterClearAll: () => void;
}

interface EmbedLibraryPageConfig {}

interface EmbedLibraryPage {}

interface EmbedDossierConsumptionPageConfig {}

interface EmbedDossierConsumptionPage {}

interface EmbedBotConsumptionPageConfig {}

interface EmbedBotConsumptionPage {}

interface EmbedReportPageConfig {}

interface EmbedReportPage {}

export {};
