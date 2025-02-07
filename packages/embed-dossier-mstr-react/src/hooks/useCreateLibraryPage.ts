import { useEffect, useState, useRef } from "react";
import { EmbedLibraryPage, EmbedLibraryPageConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

/**
 * Props interface for useCreateLibraryPage
 *
 * @property serverUrlLibrary - Base URL for the MicroStrategy Library
 * @property config - Library page configuration excluding placeholder and serverUrl
 */
interface UseCreateLibraryPageProps {
  serverUrlLibrary: string;
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
}

/**
 * Custom hook for creating a MicroStrategy Library Page
 *
 * This hook handles the creation and management of an embedded Library page.
 * For more information, see:
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/embedding-contexts
 */
const useCreateLibraryPage = ({
  serverUrlLibrary,
  config,
}: UseCreateLibraryPageProps) => {
  const libraryPageRef = useRef<HTMLDivElement>(null);
  const [libraryPage, setLibraryPage] = useState<EmbedLibraryPage | null>(null);
  const [libraryPageState, setLibraryPageState] = useState({
    isLoading: false,
    error: null as string | null,
  });

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded || !libraryPageRef.current) return;

    const createLibraryPage = async () => {
      setLibraryPageState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const embeddingContext =
          await window.microstrategy.embeddingContexts.embedLibraryPage({
            placeholder: libraryPageRef.current,
            serverUrl: serverUrlLibrary,
            errorHandler: (error) => {
              console.error("Library page error:", error);
              setLibraryPageState((prev) => ({
                ...prev,
                error: error.message || "Failed to load library page",
              }));
            },
            sessionErrorHandler: (error) => {
              console.error("Session error:", error);
              setLibraryPageState((prev) => ({
                ...prev,
                error: "Session expired. Please refresh the page.",
              }));
            },
            ...config,
          });

        setLibraryPage(embeddingContext);
      } catch (error) {
        setLibraryPageState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create library page",
        }));
      } finally {
        setLibraryPageState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    createLibraryPage();
  }, [isSdkLoaded, serverUrlLibrary, config]);

  return {
    libraryPage,
    libraryPageRef,
    isSdkLoaded,
    isLoading: libraryPageState.isLoading,
    error: libraryPageState.error,
  };
};

export { useCreateLibraryPage };
