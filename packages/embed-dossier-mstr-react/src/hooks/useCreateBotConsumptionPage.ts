import { useEffect, useRef, useState } from "react";
import { useLoadMstrSDK } from "../exports";
import {
  EmbedBotConsumptionPage,
  EmbedBotConsumptionPageConfig,
} from "../types";

interface UseCreateBotConsumptionPageProps {
  serverUrlLibrary: string;
  projectId: string;
  objectId: string;
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
}

const useCreateBotConsumptionPage = ({
  serverUrlLibrary,
  projectId,
  objectId,
  config,
}: UseCreateBotConsumptionPageProps) => {
  const botConsumptionPageRef = useRef<HTMLDivElement>(null);

  const [botConsumptionPage, setBotConsumptionPage] =
    useState<EmbedBotConsumptionPage | null>(null);

  const [isBotConsumptionPageError, setIsBotConsumptionPageError] =
    useState(false);

  const { isSdkLoaded, isSdkError } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded) return;

    async function createBotConsumptionPage() {
      try {
        const botConsumptionPage =
          await window.microstrategy.embeddingContexts.embedBotConsumptionPage({
            ...config,
            placeholder: botConsumptionPageRef.current,
            serverUrl: serverUrlLibrary,
            projectId,
            objectId,
          });
        setBotConsumptionPage(botConsumptionPage);
      } catch (error) {
        console.error(error);
        setIsBotConsumptionPageError(true);
      }
    }

    createBotConsumptionPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSdkLoaded]);

  return {
    botConsumptionPage,
    botConsumptionPageRef,
    isBotConsumptionPageError,
    isSdkError,
    isSdkLoaded,
  };
};

export { useCreateBotConsumptionPage };
