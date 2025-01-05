export interface DockedCommentAndFilter {
  dockedPosition?: "left" | "right";
  canClose?: boolean;
  dockChangeable?: boolean;
  isDocked?: boolean;
}

export interface DockedTheme extends DockedCommentAndFilter {
  theme?: "light" | "dark";
}

export interface NavigationBar {
  enabled?: boolean;
  gotoLibrary?: boolean;
  title?: boolean;
  toc?: boolean;
  reset?: boolean;
  reprompt?: boolean;
  share?: boolean;
  comment?: boolean;
  notification?: boolean;
  filter?: boolean;
  options?: boolean;
  bookmark?: boolean;
  undoRedo?: boolean;
  edit?: boolean;
}

export interface CustomUi {
  library?: {
    navigationBar?: {
      enabled?: boolean;
      sortAndFilter?: boolean;
      title?: boolean;
      searchBar?: boolean;
      createNew?: {
        enabled?: boolean;
      };
      notification?: boolean;
      multiSelect?: {
        enabled?: boolean;
      };
      account?: {
        enabled?: boolean;
      };
      user?: {
        enabled?: boolean;
      };
    };
  };
  reportConsumption?: {
    enabled?: boolean;
    goToLibrary?: boolean;
    pageBy?: boolean;
    reset?: boolean;
    reExecute?: boolean;
    filter?: boolean;
    rePrompt?: boolean;
    account?: {
      enabled?: boolean;
    };
    share?: {
      enabled?: boolean;
    };
  };
}

export interface OptionsFeature {
  enabled?: boolean;
  help?: boolean;
  logout?: boolean;
  manage?: boolean;
  showLibraries?: boolean;
  showTutorials?: boolean;
  preferences?: boolean;
}

export interface ShareFeature {
  enabled?: boolean;
  invite?: boolean;
  link?: boolean;
  email?: boolean;
  export?: boolean;
  download?: boolean;
  shareDossier?: boolean;
  subscribe?: boolean;
}
