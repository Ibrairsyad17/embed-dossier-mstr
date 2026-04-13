/**
 * MicroStrategy Embedding SDK Event Types
 *
 * Runtime constants for all supported event types in the MicroStrategy Embedding SDK.
 * Use these when registering event handlers on dashboard instances.
 *
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/add-event
 *
 * @example
 * ```ts
 * import { EVENT_TYPE } from "embed-dossier-mstr-react";
 *
 * dashboard.registerEventHandler(
 *   EVENT_TYPE.ON_PAGE_SWITCHED,
 *   (event) => console.log("Page switched", event)
 * );
 * ```
 */
export const EVENT_TYPE = {
  ON_COMPONENT_SELECTION_CHANGED: "onComponentSelectionChanged",
  ON_DOSSIER_AUTHORING_CLOSED: "onDossierAuthoringClosed",
  ON_DOSSIER_AUTHORING_SAVED: "onDossierAuthoringSaved",
  ON_DOSSIER_INSTANCE_CHANGED: "onDossierInstanceChanged",
  ON_DOSSIER_INSTANCE_ID_CHANGE: "onDossierInstanceIDChange",
  ON_ERROR: "onError",
  ON_FILTER_UPDATED: "onFilterUpdated",
  ON_GRAPHICS_SELECTED: "onGraphicsSelected",
  ON_LAYOUT_CHANGED: "onLayoutChanged",
  ON_LIBRARY_ITEM_SELECTED: "onLibraryItemSelected",
  ON_LIBRARY_ITEM_SELECTION_CLEARED: "onLibraryItemSelectionCleared",
  ON_LIBRARY_MENU_SELECTED: "onLibraryMenuSelected",
  ON_PAGE_LOADED: "onPageLoaded",
  ON_PAGE_RENDER_FINISHED: "onPageRenderFinished",
  ON_PAGE_SWITCHED: "onPageSwitched",
  ON_PANEL_SWITCHED: "onPanelSwitched",
  ON_PROMPT_ANSWERED: "onPromptAnswered",
  ON_PROMPT_LOADED: "onPromptLoaded",
  ON_SESSION_ERROR: "onSessionError",
  ON_VISUALIZATION_RESIZED: "onVisualizationResized",
  ON_VIZ_ELEMENT_CHANGED: "onVisualizationElementsChanged",
  ON_VIZ_SELECTION_CHANGED: "onVizSelectionChanged",
} as const;

/** Union type of all event type values */
export type EventTypeValue = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
