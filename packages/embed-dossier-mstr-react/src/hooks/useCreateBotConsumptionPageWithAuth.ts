import { useEffect, useState } from "react";
import {
  EmbedBotConsumptionPage,
  EmbedBotConsumptionPageConfig,
} from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

interface UseCreateBotConsumptionPageWithAuthProps {
  serverUrlLibrary: string;
  placeholder: HTMLDivElement | null;
  projectId: string;
  objectId: string;
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
}

const useCreateBotConsumptionPageWithAuth = ({
  serverUrlLibrary,
  placeholder,
  projectId,
  objectId,
  config,
  loginMode,
  username,
  password,
}: UseCreateBotConsumptionPageWithAuthProps) => {
  const [botConsumptionPage, setBotConsumptionPage] =
    useState<EmbedBotConsumptionPage | null>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAuthenticating: false,
    error: null as string | null,
  });

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded || !placeholder) return;

    let mounted = true;
    const initializeBotConsumptionPage = async () => {
      if (!mounted) return;
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {
        // Handle authentication based on loginMode
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

        // Create bot consumption page with auth configuration
        const botPage =
          await window.microstrategy.embeddingContexts.embedBotConsumptionPage({
            ...config,
            placeholder,
            serverUrl: serverUrlLibrary,
            projectId,
            objectId,
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
          setBotConsumptionPage(botPage);
          setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
        }
      } catch (error) {
        if (mounted) {
          console.error("Bot consumption page auth error:", error);
          setAuthState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize bot consumption page",
            isAuthenticated: false,
          }));
        }
      } finally {
        if (mounted) {
          setAuthState((prev) => ({ ...prev, isAuthenticating: false }));
        }
      }
    };

    initializeBotConsumptionPage();
    return () => {
      mounted = false;
    };
  }, [
    isSdkLoaded,
    placeholder,
    loginMode,
    serverUrlLibrary,
    projectId,
    objectId,
    config,
    username,
    password,
  ]);

  return {
    botConsumptionPage,
    ...authState,
  };
};

export { useCreateBotConsumptionPageWithAuth };
