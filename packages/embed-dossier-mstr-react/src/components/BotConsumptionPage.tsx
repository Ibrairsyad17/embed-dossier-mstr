import { useCreateBotConsumptionPage } from "../hooks/useCreateBotConsumptionPage";
import { EmbedBotConsumptionPageConfig } from "../types";
import cn from "classnames";

interface BotConsumptionPageProps {
  serverUrlLibrary: string;
  projectId: string;
  objectId: string;
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
  className?: string;
  style?: React.CSSProperties;
}

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
      className={cn(className)}
      style={style}
    ></div>
  );
};

export { BotConsumptionPage };
