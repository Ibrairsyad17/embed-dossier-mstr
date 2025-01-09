import { useEffect, useRef, useState } from "react";
import { MicroStrategyDossier, MicroStrategyDossierConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

interface UseCreateDashboardProps {
  serverUrlLibrary: string;
  config: MicroStrategyDossierConfig;
}

const useCreateDashboard = ({
  serverUrlLibrary,
  config,
}: UseCreateDashboardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<MicroStrategyDossier | null>(null);
  const [isDashboardError, setIsDashboardError] = useState(false);

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded) return;

    async function createDashboard() {
      try {
        const dossier = await window.microstrategy.dossier.create({
          ...config,
          placeholder: containerRef.current,
        });
        setDashboard(dossier);
      } catch (error) {
        console.error(error);
        setIsDashboardError(true);
      }
    }

    createDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSdkLoaded]);

  return {
    dashboard,
    containerRef,
    isSdkLoaded,
    isDashboardError,
  };
};

export { useCreateDashboard };
