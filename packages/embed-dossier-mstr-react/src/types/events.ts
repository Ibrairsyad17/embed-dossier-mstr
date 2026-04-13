import { EventTypeValue } from "../constants/eventType";

/** Union of all MicroStrategy event type string values */
export type EventTypes = EventTypeValue;

/**
 * Event handler function signature.
 *
 * MicroStrategy SDK passes event-specific data to handlers.
 * Use `unknown` and narrow the type in your handler for type safety.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (event?: any) => void;

/** Map of all available event handlers for MicroStrategy dashboards */
export interface EventHandlers {
  onComponentSelectionChanged?: EventHandler;
  onDossierAuthoringClosed?: EventHandler;
  onDossierAuthoringSaved?: EventHandler;
  onDossierInstanceChanged?: EventHandler;
  onDossierInstanceIDChange?: EventHandler;
  onError?: EventHandler;
  onFilterUpdated?: EventHandler;
  onGraphicsSelected?: EventHandler;
  onLayoutChanged?: EventHandler;
  onLibraryItemSelected?: EventHandler;
  onLibraryItemSelectionCleared?: EventHandler;
  onLibraryMenuSelected?: EventHandler;
  onPageLoaded?: EventHandler;
  onPageRenderFinished?: EventHandler;
  onPageSwitched?: EventHandler;
  onPanelSwitched?: EventHandler;
  onPromptAnswered?: EventHandler;
  onPromptLoaded?: EventHandler;
  onSessionError?: EventHandler;
  onVisualizationResized?: EventHandler;
  onVisualizationElementsChanged?: EventHandler;
  onVizSelectionChanged?: EventHandler;
}
