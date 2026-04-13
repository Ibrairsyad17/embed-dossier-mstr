import { useCreateBotConsumptionPage } from "../hooks/useCreateBotConsumptionPage";
import { EmbedBotConsumptionPageConfig } from "../types";
import { clsx } from "clsx";

interface BotConsumptionPageProps {
  /** Base URL of the MicroStrategy Library server */
  serverUrlLibrary: string;
  /** MicroStrategy project ID */
  projectId: string;
  /** Bot object ID */
  objectId: string;
  /** Bot page configuration */
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * Embeds a MicroStrategy Bot Consumption Page.
 *
 * @example
 * ```tsx
 * <BotConsumptionPage
 *   serverUrlLibrary="https://your-server.com/MicroStrategyLibrary"
 *   projectId="B7CA92F0"
 *   objectId="27D332AC"
 *   config={{}}
 *   style={{ width: "100%", height: "600px" }}
 * />
 * ```
 */
const BotConsumptionPage = ({
  serverUrlLibrary,
  projectId,
  objectId,
  config,
  className,
  style,
}: BotConsumptionPageProps) => {
  const { botConsumptionPageRef } = useCreateBotConsumptionPage({
    serverUrlLibrary,
    projectId,
    objectId,
    config,
  });

  return (
    <div
      ref={botConsumptionPageRef}
      className={clsx(className)}
      style={style}
    />
  );
};

export { BotConsumptionPage };
export type { BotConsumptionPageProps };
