/**
 * Custom hook for creating a MicroStrategy dashboard with authentication
 *
 * This hook handles different authentication methods and dashboard creation:
 * - Guest authentication
 * - Standard/LDAP authentication
 * - SAML authentication
 * - OIDC authentication
 *
 * For more information about authentication methods, see:
 * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { MicroStrategyDossier, MicroStrategyDossierConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";
import { getServerUrl } from "../utils";

/**
 * Props interface for useCreateDashboardWithAuth
 *
 * @property serverUrlLibrary - Base URL for the MicroStrategy Library
 * @property config - Dashboard configuration excluding placeholder
 * @property loginMode - Authentication method to use
 * @property username - Optional username for standard/LDAP auth
 * @property password - Optional password for standard/LDAP auth
 */
interface UseCreateDashboardWithAuthProps {
  serverUrlLibrary: string;
  config: Omit<MicroStrategyDossierConfig, "placeholder">;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
}

/**
 * Authentication state interface
 *
 * @property isAuthenticated - Whether authentication was successful
 * @property isAuthenticating - Whether authentication is in progress
 * @property error - Error message if authentication failed
 */
interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
}

const useCreateDashboardWithAuth = ({
  serverUrlLibrary,
  config,
  loginMode,
  username,
  password,
}: UseCreateDashboardWithAuthProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<MicroStrategyDossier | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
  });

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });
  const serverUrl = useMemo(() => getServerUrl(config.url), [config.url]);

  // Memoize authentication functions
  const authHandlers = useMemo(
    () => ({
      async getAuthToken(): Promise<string | null> {
        const options: RequestInit = {
          method: "GET",
          credentials: "include",
          mode: "cors",
          headers: { "content-type": "application/json" },
        };

        try {
          const response = await fetch(`${serverUrl}/api/auth/token`, options);
          return response.ok ? response.headers.get("x-mstr-authtoken") : null;
        } catch (error) {
          console.error("Failed to get auth token:", error);
          return null;
        }
      },

      async createAuthToken(): Promise<string | null> {
        if (!["standard", "ldap", "guest"].includes(loginMode)) return null;

        const body =
          loginMode === "guest"
            ? { loginMode: 8 }
            : { loginMode: 1, username, password };

        const options: RequestInit = {
          method: "POST",
          credentials: "include",
          mode: "cors",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        };

        const response = await fetch(`${serverUrl}/api/auth/login`, options);
        if (!response.ok) throw new Error("Authentication failed");
        return response.headers.get("x-mstr-authtoken");
      },

      async login(): Promise<string | null> {
        const existingToken = await this.getAuthToken();
        return existingToken || this.createAuthToken();
      },
    }),
    [serverUrl, loginMode, username, password]
  );

  // Memoize dashboard configuration
  const dashboardConfig = useMemo(
    () => ({
      ...config,
      enableCustomAuthentication: true,
      customAuthenticationType:
        window.microstrategy?.dossier?.CustomAuthenticationType?.AUTH_TOKEN,
      getLoginToken: () => authHandlers.login(),
      containerHeight: config.containerHeight || "600px",
      containerWidth: config.containerWidth || "100%",
    }),
    [config, authHandlers]
  );

  useEffect(() => {
    if (!isSdkLoaded || !containerRef.current) return;

    let mounted = true;
    const initializeDashboard = async () => {
      if (!mounted) return;
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {
        if (loginMode === "saml") {
          await window.microstrategy.auth.samlLogin(serverUrl);
        } else if (loginMode === "oidc") {
          await window.microstrategy.auth.oidcLogin(serverUrl);
        }

        const dossier = await window.microstrategy.dossier.create({
          ...dashboardConfig,
          placeholder: containerRef.current,
        });

        if (mounted) {
          setDashboard(dossier);
          setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
        }
      } catch (error) {
        if (mounted) {
          setAuthState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize dashboard",
            isAuthenticated: false,
          }));
        }
      } finally {
        if (mounted) {
          setAuthState((prev) => ({ ...prev, isAuthenticating: false }));
        }
      }
    };

    initializeDashboard();
    return () => {
      mounted = false;
    };
  }, [isSdkLoaded, loginMode, serverUrl, dashboardConfig]);

  return {
    dashboard,
    containerRef,
    ...authState,
  };
};

export { useCreateDashboardWithAuth };
