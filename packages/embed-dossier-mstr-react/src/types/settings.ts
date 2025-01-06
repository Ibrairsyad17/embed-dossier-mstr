export interface DossierConsumptionSettings {
  componentSelectionMode:
    | "noSelection"
    | "singleSelection"
    | "multipleSelection";
  disableManipulationsAutoSaving?: boolean;
  enablePageSelection?: boolean;
  disableGroupSelection?: boolean;
}

export interface BotConsumptionSettings {
  disableManipulationsAutoSaving?: boolean;
}

export interface Settings {
  dossierConsumption?: DossierConsumptionSettings;
  botConsumption?: BotConsumptionSettings;
}
