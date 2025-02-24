import { useEffect, useState, useRef } from "react";
import { EmbedLibraryPage, EmbedLibraryPageConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

interface UseCreateLibraryPageWithAuthProps {
  serverUrlLibrary: string;
  placeholder: HTMLDivElement | null;
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
}

const useCreateLibraryPageWithAuth = ({
  serverUrlLibrary,
  placeholder,
  config,
  loginMode,
  username,
  password,
}: UseCreateLibraryPageWithAuthProps) => {
  const [libraryPage, setLibraryPage] = useState<EmbedLibraryPage | null>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    error: null as string | null,
  });

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });
  const prevConfigRef = useRef(config);

  useEffect(() => {
    if (!isSdkLoaded || !placeholder) return;

    let mounted = true;
    const initializeLibraryPage = async () => {
      if (!mounted) return;
      setAuthState((prev) => ({
        ...prev,
        error: null,
      }));

      try {
        switch (loginMode) {
          case "standard":
          case "ldap": {
            if (!username || !password) {
              throw new Error(
                "Username and password are required for standard/LDAP authentication"
              );
            }
            await fetch(`${serverUrlLibrary}/api/auth/login`, {
              method: "POST",
              credentials: "include",
              mode: "cors",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ loginMode: 1, username, password }),
            });
            break;
          }

          case "guest": {
            await fetch(`${serverUrlLibrary}/api/auth/login`, {
              method: "POST",
              credentials: "include",
              mode: "cors",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ loginMode: 8 }),
            });
            break;
          }

          case "saml":
            await window.microstrategy.auth.samlLogin(serverUrlLibrary);
            break;

          case "oidc":
            await window.microstrategy.auth.oidcLogin(serverUrlLibrary);
            break;
        }

        const page =
          await window.microstrategy.embeddingContexts.embedLibraryPage({
            ...config,
            placeholder,
            serverUrl: serverUrlLibrary,
            enableCustomAuthentication: true,
            customAuthenticationType:
              window.microstrategy.dossier.CustomAuthenticationType.AUTH_TOKEN,
            getLoginToken: async () => {
              const response = await fetch(
                `${serverUrlLibrary}/api/auth/token`,
                {
                  method: "GET",
                  credentials: "include",
                  mode: "cors",
                  headers: { "content-type": "application/json" },
                }
              );
              return response.ok
                ? response.headers.get("x-mstr-authtoken")
                : null;
            },
          });

        if (mounted) {
          setLibraryPage(page);
          setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
        }
      } catch (error) {
        if (mounted) {
          console.error("Library page auth error:", error);
          setAuthState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize library page",
            isAuthenticated: false,
          }));
        }
      } finally {
        if (mounted) {
          setAuthState((prev) => ({ ...prev }));
        }
      }
    };

    initializeLibraryPage();
    return () => {
      mounted = false;
    };
  }, [
    isSdkLoaded,
    placeholder,
    loginMode,
    serverUrlLibrary,
    config,
    username,
    password,
  ]);

  return {
    libraryPage,
    ...authState,
  };
};

export { useCreateLibraryPageWithAuth };
