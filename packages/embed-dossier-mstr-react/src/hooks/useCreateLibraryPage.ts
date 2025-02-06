import { useEffect, useState } from "react";
import { useRef } from "react";
import { EmbedLibraryPage, EmbedLibraryPageConfig } from "../types";
import { useLoadMstrSDK } from "../exports";

interface UseCreateLibraryPage {
  serverUrlLibrary: string;
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
}

const useCreateLibraryPage = ({
  serverUrlLibrary,
  config,
}: UseCreateLibraryPage) => {
  const libraryPageRef = useRef<HTMLDivElement>(null);
  const [libraryPage, setLibraryPage] = useState<EmbedLibraryPage | null>(null);
  const [isLibraryPageError, setIsLibraryPageError] = useState(false);

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded) return;

    async function createLibraryPage() {
      try {
        const embeddingContext =
          await window.microstrategy.embeddingContexts.embedLibraryPage({
            placeholder: libraryPageRef.current,
            serverUrl: serverUrlLibrary,
            ...config,
          });

        setLibraryPage(embeddingContext);
      } catch (error) {
        setIsLibraryPageError(true);
      }
    }

    createLibraryPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSdkLoaded]);

  return {
    libraryPage,
    libraryPageRef,
    isSdkLoaded,
    isLibraryPageError,
  };
};

export { useCreateLibraryPage };
