import { useEffect, useState } from "react";
import {
  MicroStrategyDossier,
  MicroStrategyDossierConfig,
} from "embed-dossier-mstr-react";
import { useLoadMstrSDK } from "embed-dossier-mstr-react";

interface UseCreateDashboardProps {
  serverUrlLibrary: string;
  projectId: string;
  dossierId: string;
  config: MicroStrategyDossierConfig;
  isSdkLoaded: boolean;
}

const useCreateDashboard = ({
  serverUrlLibrary,
  projectId,
  dossierId,
  config,
  isSdkLoaded,
}: UseCreateDashboardProps) => {
  const [dashboard, setDashboard] = useState<MicroStrategyDossier | null>(null);
  const [isDashboardError, setIsDashboardError] = useState(false);

  useEffect(() => {
    if (!isSdkLoaded) return;

    async function createDashboard() {
      try {
        const dossier = await window.microstrategy.dossier.create(config);
        setDashboard(dossier);
      } catch (error) {
        setIsDashboardError(true);
      }
    }

    createDashboard();
  }, [isSdkLoaded]);

  return {
    dashboard,
    isSdkLoaded,
    isDashboardError,
  };
};

export { useCreateDashboard };
