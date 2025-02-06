import { EVENT_TYPE } from "../constants/eventType";

export type EventTypes = EVENT_TYPE[keyof EVENT_TYPE];

export type EventHandler = () => void;

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
