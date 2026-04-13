import { useEffect, useRef, useState } from "react";
import { MicroStrategyDossier, MicroStrategyDossierConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

export interface UseCreateDashboardProps {
  serverUrlLibrary: string;
  config: Omit<MicroStrategyDossierConfig, "placeholder">;
}

/**
 * Custom hook to create and manage a MicroStrategy Dashboard instance.
 *
 * Handles SDK loading, dashboard creation, and cleanup on unmount.
 *
 * @param serverUrlLibrary - Base URL of the MicroStrategy Library server
 * @param config - Dashboard configuration (URL, features, etc.)
 * @returns `dashboard` - The dashboard instance (null until created)
 * @returns `containerRef` - Ref to attach to the container div
 * @returns `isSdkLoaded` - Whether the SDK has loaded
 * @returns `isDashboardError` - Whether dashboard creation failed
 *
 * @example
 * ```tsx
 * const { dashboard, containerRef, isSdkLoaded, isDashboardError } =
 *   useCreateDashboard({
 *     serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
 *     config: { url: dossierUrl },
 *   });
 *
 * return <div ref={containerRef} />;
 * ```
 */
const useCreateDashboard = ({
  serverUrlLibrary,
  config,
}: UseCreateDashboardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<MicroStrategyDossier | null>(null);
  const dashboardRef = useRef<MicroStrategyDossier | null>(null);
  const [isDashboardError, setIsDashboardError] = useState(false);

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded) return;

    let mounted = true;

    async function createDashboard() {
      try {
        const dossier = await window.microstrategy.dossier.create({
          ...config,
          placeholder: containerRef.current,
        });

        if (mounted) {
          dashboardRef.current = dossier;
          setDashboard(dossier);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to create dashboard:", error);
          setIsDashboardError(true);
        }
      }
    }

    createDashboard();

    // Cleanup: close the dashboard on unmount to prevent memory leaks
    return () => {
      mounted = false;
      if (dashboardRef.current) {
        try {
          dashboardRef.current.close();
        } catch {
          // Dashboard may already be closed
        }
        dashboardRef.current = null;
      }
    };
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
