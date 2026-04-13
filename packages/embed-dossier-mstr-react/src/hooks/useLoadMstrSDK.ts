import { useEffect, useState } from "react";

/**
 * Custom hook to load the MicroStrategy Embedding SDK.
 *
 * Dynamically injects the MicroStrategy `embeddinglib.js` script into the page.
 * Handles the case where the SDK is already loaded, and cleans up on unmount.
 *
 * @param serverUrlLibrary - Base URL of the MicroStrategy Library server
 * @returns `isSdkLoaded` - Whether the SDK script has loaded successfully
 * @returns `isSdkError` - Error state with `isError` flag and `message`
 *
 * @example
 * ```ts
 * const { isSdkLoaded, isSdkError } = useLoadMstrSDK({
 *   serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary"
 * });
 * ```
 */
const useLoadMstrSDK = ({ serverUrlLibrary }: { serverUrlLibrary: string }) => {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isSdkError, setIsSdkError] = useState({
    isError: false,
    message: "",
  });

  useEffect(() => {
    // If SDK is already available on the page, skip loading
    if (window.microstrategy) {
      setIsSdkLoaded(true);
      return;
    }

    if (!serverUrlLibrary) {
      setIsSdkError({
        isError: true,
        message: "serverUrlLibrary is required to load the MicroStrategy SDK",
      });
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `${serverUrlLibrary}/javascript/embeddinglib.js`;

    script.onload = () => {
      setIsSdkLoaded(true);
    };

    script.onerror = () => {
      setIsSdkError({
        isError: true,
        message: `Failed to load MicroStrategy SDK from ${serverUrlLibrary}`,
      });
    };

    document.head.appendChild(script);

    // Cleanup: remove the script tag on unmount
    return () => {
      script.remove();
    };
  }, [serverUrlLibrary]);

  return { isSdkLoaded, isSdkError };
};

export { useLoadMstrSDK };
