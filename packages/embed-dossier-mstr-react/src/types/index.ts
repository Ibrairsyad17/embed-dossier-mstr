import { EVENT_TYPE } from "../constants/eventType";
import { FilterCreation, FilterJson, FilterListType } from "./filter";
import {
  CurrentPage,
  CustomUi,
  DockedCommentAndFilter,
  DockedTheme,
  ErrorHandlerInterface,
  NavigationBar,
  OptionsFeature,
  PageInfo,
  ShareFeature,
} from "./utils";
import { EventTypes, EventHandler } from "./events";
import { DossierChapter, DossierPage, TableOfContents } from "./navigation";
import { Settings } from "./settings";

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
  placeholder: HTMLDivElement | null; // Required
  url: string; // Required
  containerHeight?: string; // Optional
  containerWidth?: string; // Optional
  customAuthenticationType?:
    | MicroStrategyDossierConfigCustomAuthenticationType
    | string; // Optional
  disableNotification?: boolean; // Optional
  disableErrorPopupWindow?: boolean; // Optional
  dockedComment?: DockedCommentAndFilter; // Optional
  dockedFilter?: DockedCommentAndFilter; // Optional
  dockedTheme?: DockedTheme; // Optional
  dockedToc?: {
    dockedPosition?: "left" | "right";
    theme?: "light" | "dark";
    canClose?: boolean;
    dockChangeable?: boolean;
    isDocked?: boolean;
  }; // Optional
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
  filters?: FilterCreation[]; // Optional
  getLoginToken?: () => Promise<string | void | null>; // Optional
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
  dossierRenderingMode?: "consumption" | "authoring";

  /**
   *
   * The authoring props managed tools or features that are available in the authoring mode.
   *
   * For more information, please refer to the MicroStrategy SDK documentation.
   * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/authoring-library
   *
   * The following properties are available:
   * - menubar
   * - toolbar
   * - panelVisibility
   */

  authoring?: {
    menubar?: {
      library?: {
        visible?: boolean;
      };
    };
    toolbar?: {
      tableOfContents?: {
        visible?: boolean;
      };
      undo?: {
        visible?: boolean;
      };
      redo?: {
        visible?: boolean;
      };
      refresh?: {
        visible?: boolean;
      };
      pauseDataRetrieval?: {
        visible?: boolean;
      };
      reprompt?: {
        visible?: boolean;
      };
      dividerLeft?: {
        visible?: boolean;
      };
      addData?: {
        visible?: boolean;
      };
      addChapter?: {
        visible?: boolean;
      };
      addPage?: {
        visible?: boolean;
      };
      insertVisualization?: {
        visible?: boolean;
      };
      insertFilter?: {
        visible?: boolean;
      };
      insertText?: {
        visible?: boolean;
      };
      insertImage?: {
        visible?: boolean;
      };
      insertHtml?: {
        visible?: boolean;
      };
      insertShape?: {
        visible?: boolean;
      };
      insertPanelStack?: {
        visible?: boolean;
      };
      insertInfoWindow?: {
        visible?: boolean;
      };
      save?: {
        visible?: boolean;
      };
      dividerRight?: {
        visible?: boolean;
      };
      more?: {
        visible?: boolean;
      };
      freeformLayout?: {
        visible?: boolean;
      };
      nlp?: {
        visible?: boolean;
      };
      responsiveViewEditor?: {
        visible?: boolean;
      };
      responsivePreview?: {
        visible?: boolean;
      };
    };
    panelVisibility?: {
      contents?: boolean;
      datasets?: boolean;
      editor?: boolean;
      filter?: boolean;
      format?: boolean;
      layers?: boolean;
    };
  };
  disableCustomErrorHandlerOnCreate?: boolean; // Optional
  sessionErrorHandler?: (error: ErrorHandlerInterface) => void;
  errorHandler?: (error: ErrorHandlerInterface) => void;
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

/**
 * Interface for MicroStrategy Dossier Dashboard APIs
 *
 * This interface is used to declare the MicroStrategy Dossier Dashboard that will be viewed on the web page.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface MicroStrategyDossier {
  close: () => void;
  refresh: () => void;
  resize: (width: string, height: string) => void;

  /**
   * Instance
   *
   * Get the instance ID of the dossier
   * @returns Promise<string>
   */

  getDossierInstanceId: () => Promise<string>;

  /**
   * Filter
   *
   * Get the filter list
   * @returns Promise<FilterListType[]>
   */

  getFilterList: () => Promise<FilterListType[]>;
  /**
   * Filter
   *
   * Filter methods
   *
   * @params FilterJson (most of the methods are using this type)
   * For more information, please refer to the MicroStrategy SDK documentation.
   * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/filters
   */

  filterSelectAllAttributes: (params: FilterJson) => void;
  filterDeselectAllAttributes: (params: FilterJson) => void;
  filterSelectSingleAttribute: (params: FilterJson) => void;
  filterSelectMultiAttributes: (params: FilterJson) => void;
  filterSearchSingleAttribute: (params: FilterJson) => void;
  filterSearchMultiAttributes: (params: FilterJson) => void;
  filterAttributeSingleSlider: (params: FilterJson) => void;
  filterAttributeMultiSlider: (params: FilterJson) => void;
  filterSetDateRange: (params: FilterJson) => void;
  filterSetMetricQualByValue: (params: FilterJson) => void;
  filterSetMetricQualByRank: (params: FilterJson) => void;
  filterSetMetricSliderByValue: (params: FilterJson) => void;
  filterSetMetricSliderByRank: (params: FilterJson) => void;
  filterClearAll: () => void;
  filterClear: (params: FilterJson) => void;
  filterSetInclude: (params: FilterJson) => void;
  filterSetExclude: (params: FilterJson) => void;
  filterApplyAll: () => void;

  /**
   * Switch to Mode
   *
   * Switch to the mode of the dossier
   * @param mode "consumption" | "authoring"
   * @returns Promise<void>
   */

  switchToMode?: (mode: "consumption" | "authoring") => Promise<void>;

  /**
   * Navigation
   *
   * Once you have embedded a dashboard, you can use helper methods in the Embedding SDK to let users navigate within the dashboard.
   *
   * For example, you can add code to get the table of contents for the dashboard, go to the previous or next page, navigate to a specific page, get the current page or chapter, get a specific page, or get a list of pages, chapters and visualizations.
   *
   * For more information, please refer to the MicroStrategy SDK documentation.
   * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/add-nav
   */

  getTableOfContents: () => TableOfContents;
  goToPrevPage: () => Promise<{ valid: boolean; message: string } | void>;
  goToNextPage: () => Promise<{ valid: boolean; message: string } | void>;
  navigateToPage: (
    page: DossierPage
  ) => Promise<{ valid: boolean; message: string } | void>;
  getCurrentChapter: () => DossierChapter;
  getCurrentPage: () => DossierPage;
  getPageByNodeKey: (nodeKey: string) => DossierPage;
  getChapterList: () => DossierChapter[];
  getCurrentPageVisualizationList: () => Promise<
    [{ key: string; name: string }]
  >;
  openFilterSummaryBar: () => void | null;
  closeFilterSummaryBar: () => void | null;
  getPageList: () => DossierPage[];

  /**
   * Event Handlers
   *
   * You could use these methods to customize the behavior of the dossier.
   *
   * For more information, please refer to the MicroStrategy SDK documentation.
   * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/add-event#registereventhandlerevtname-handler
   */

  registerEventHandler: (event: EventTypes, handler: EventHandler) => void;
  removeEventHandler: (event: EventTypes, handler: EventHandler) => void;

  /**
   * Wrapper Functions for Event Handlers
   *
   * The following wrapper functions make it easy to register event handlers for specific events.
   *
   * For more information, please refer to the MicroStrategy SDK documentation.
   * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/add-event#wrapper-functions
   */

  registerGraphicsSelectEventHandlerToViz: (
    vizKey: string,
    handler: EventHandler
  ) => void;
  registerFilterUpdateHandler: (handler: EventHandler) => void;
  registerPageSwitchHandler: (handler: EventHandler) => void;
  registerDossierInstanceIDChangeHandler: (handler: EventHandler) => void;
  removeCustomErrorHandler?: (error: ErrorHandlerInterface) => void;
  removeSessionHandler: () => void;
  /**
   *
   * The following methods are used to handle errors.
   * These methods are used to handle errors that occur during the creation of the dossier.
   *
   * @param error
   * About the params itself would be return ErrorHandlerInterface
   *
   * @returns
   * Return could be any void
   */

  addCustomErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
  addSessionErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
}

/**
 * Interface for Embedding Contexts APIs
 *
 * This interface is used to declare the Embedding Contexts APIs.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface EmbeddingContexts {
  embedLibraryPage: (
    params: EmbedLibraryPageConfig
  ) => Promise<EmbedLibraryPage>;
  embedDossierConsumptionPage: (
    params: EmbedDossierConsumptionPageConfig
  ) => Promise<EmbedDossierConsumptionPage>;
  embedBotConsumptionPage: (
    params: EmbedBotConsumptionPageConfig
  ) => Promise<EmbedBotConsumptionPage>;
  embedReportPage: (params: EmbedReportPageConfig) => Promise<EmbedReportPage>;
  registerEventHandler: (event: EventTypes, handler: EventHandler) => void;
  removeEventHandler: (event: EventTypes, handler: EventHandler) => void;
  removeCustomErrorHandler: () => void;
  removeSessionErrorHandler: () => void;
  goToPage: (pageInfo: PageInfo) => Promise<{ redirect: boolean }>;
  addCustomErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
  addSessionErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
}

/**
 * Interface for Embed Library Page Config
 *
 * This interface is used to declare the Embed Library Page Config.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface EmbedLibraryPageConfig {
  placeholder: HTMLElement | null;
  serverUrl: string;
  containerHeight?: string;
  containerWidth?: string;
  enableCustomAuthentication?: boolean;
  customAuthenticationType?:
    | MicroStrategyDossierConfigCustomAuthenticationType
    | string;
  getLoginToken?: () => Promise<string | void | null>;
  disableCustomErrorHandlerOnCreate?: boolean;
  errorHandler?: (error: ErrorHandlerInterface) => void;
  sessionErrorHandler?: (error: ErrorHandlerInterface) => void;
  customUi?: CustomUi;
  libraryItemSelectMode?: "single" | "multiple";
  currentPage?: CurrentPage;
}

/**
 * Interface for EmbedLibraryPage APIs
 *
 * The LibraryPage object is the manipulator of the MicroStrategy Library home page. It could be got by embeddingContext.libraryPage.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface EmbedLibraryPage {
  getAllMyGroups: () => Promise<{ id: string; name: string }[]>;
  getAllDefaultGroups: () => Promise<{ id: string; name: string }[]>;
  setNavigationBarEnabled: (enabled: boolean) => void;
  setSidebarVisibility: (shown: boolean) => void;
  addCustomErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
  addSessionErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
}

/**
 * Interface for Embed Dossier Consumption Page Config
 *
 * This interface is used to declare the Embed Dossier Consumption Page Config.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface EmbedDossierConsumptionPageConfig {
  placeholder: HTMLDivElement | null;
  serverUrl: string;
  projectId: string;
  objectId: string;
  customApplicationId?: string;
  enableCustomAuthentication?: boolean;
  pageKey?: string;
  containerHeight?: string;
  containerWidth?: string;
  customAuthenticationType?:
    | MicroStrategyDossierConfigCustomAuthenticationType
    | string;
  getLoginToken?: () => Promise<string | void | null>;
  disableCustomErrorHandlerOnCreate?: boolean;
  errorHandler?: (error: ErrorHandlerInterface) => void;
  sessionErrorHandler?: (error: ErrorHandlerInterface) => void;
  customUi?: CustomUi;
  settings?:
    | Pick<Settings, "dossierConsumption">
    | Pick<Settings, "botConsumption">;
}

// TODO: DO MORE RESEARCH ON THIS
interface EmbedDossierConsumptionPage {
  addCustomErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
  addSessionErrorHandler: (
    handler: (error: ErrorHandlerInterface) => void,
    showErrorPopup: boolean
  ) => void;
}

/**
 * Interface for Embed Bot Consumption Page Config
 *
 * This interface is used to declare the Embed Bot Consumption Page Config.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

interface EmbedBotConsumptionPageConfig
  extends EmbedDossierConsumptionPageConfig {
  disableHyper?: boolean;
  permissions?: {
    allowClipboardWrite?: boolean;
  };
}

/**
 * Interface for Embed Bot Consumption Page APIs
 *
 * This interface is used to declare the Embed Bot Consumption Page APIs.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

// TODO: DO MORE RESEARCH ON THIS
interface EmbedBotConsumptionPage {}

/**
 * Interface for Embed Report Page Config
 *
 * This interface is used to declare the Embed Report Page Config.
 *
 */

interface EmbedReportPageConfig extends EmbedDossierConsumptionPageConfig {}

/**
 * Interface for Embed Report Page APIs
 *
 * This interface is used to declare the Embed Report Page APIs.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/methods-and-properties
 *
 */

// TODO: DO MORE RESEARCH ON THIS
interface EmbedReportPage {}

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
};
