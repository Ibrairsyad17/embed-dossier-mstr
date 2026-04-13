import { useCreateDashboard } from "../hooks/useCreateDashboard";
import { getInfoFromUrl } from "../utils";
import { clsx } from "clsx";
import { MicroStrategyDossierConfig } from "../types";

interface DashboardEmbedProps {
  /** Full MicroStrategy dossier URL: `https://{host}/{libraryName}/app/{projectId}/{dossierId}` */
  dossierUrl: string;
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Dashboard configuration options */
  config?: Omit<MicroStrategyDossierConfig, "placeholder" | "url">;
}

/**
 * Embeds a MicroStrategy Dashboard into your React application.
 *
 * This is the simplest way to embed a dashboard — just provide a URL and optional config.
 * The component handles SDK loading, dashboard creation, and cleanup automatically.
 *
 * @example
 * ```tsx
 * <DashboardEmbed
 *   dossierUrl="https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F0/27D332AC"
 *   style={{ width: "100%", height: "800px" }}
 * />
 * ```
 */
const DashboardEmbed = ({
  dossierUrl,
  className,
  style,
  config,
}: DashboardEmbedProps) => {
  let serverUrlLibrary = "";

  try {
    const urlInfo = getInfoFromUrl(dossierUrl);
    serverUrlLibrary = urlInfo.serverUrlLibrary;
  } catch (error) {
    console.error("Failed to parse dossier URL:", error);
  }

  const { containerRef } = useCreateDashboard({
    serverUrlLibrary,
    config: {
      url: dossierUrl,
      ...config,
    },
  });

  return <div ref={containerRef} className={clsx(className)} style={style} />;
};

export { DashboardEmbed };
export type { DashboardEmbedProps };
