import { useCreateDashboard } from "../hooks/useCreateDashboard";
import { getInfoFromUrl } from "../utils";
import cn from "classnames";
import { MicroStrategyDossierConfig } from "../types";

interface DashboardEmbedProps {
  dossierUrl: string; // https://{env-url}/{libraryName}/app/{projectId}/{dossierId}
  className?: string;
  style?: React.CSSProperties;
  config?: Omit<MicroStrategyDossierConfig, "placeholder" | "url">;
}

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

  return <div ref={containerRef} className={cn(className)} style={style} />;
};

export { DashboardEmbed };
