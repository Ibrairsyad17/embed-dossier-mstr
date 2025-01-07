import { useEffect, useState } from "react";

/**
 * Hook Information
 * useLoadMstrSDK({serverUrlLibrary: ''})
 *
 * This hook is used to load the MicroStrategy SDK based on the server URL Library provided.
 *
 * Usage:
 * const { isSdkLoaded, isSdkError } = useLoadMstrSDK({serverUrlLibrary: ''})
 *
 * @param serverUrlLibrary - The URL of the MicroStrategy library
 * @returns isSdkLoaded - Whether the SDK is loaded
 * @returns isSdkError - Whether there was an error loading the SDK
 *
 * Use this hook to check if the SDK is loaded and if there was an error loading the SDK.
 */

const useLoadMstrSDK = ({ serverUrlLibrary }: { serverUrlLibrary: string }) => {
  /**
   * State Information
   * isSdkLoaded - Whether the SDK is loaded
   * isSdkError - Whether there was an error loading the SDK
   */

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isSdkError, setIsSdkError] = useState(false);

  /**
   * Effect Information
   * useEffect - Load the SDK
   */

  useEffect(() => {
    const loadSdk = () => {
      if (!window.microstrategy) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src =
          serverUrlLibrary + "/MicroStrategyLibrary/javascript/embeddinglib.js";
        script.onload = () => {
          setIsSdkLoaded(true);
        };
        script.onerror = () => {
          setIsSdkError(true);
        };
        document.head.appendChild(script);
      }
    };
    loadSdk();
  }, [serverUrlLibrary]);

  /**
   * Return Values
   * isSdkLoaded - Whether the SDK is loaded
   * isSdkError - Whether there was an error loading the SDK
   */
  return { isSdkLoaded, isSdkError };
};

export { useLoadMstrSDK };
