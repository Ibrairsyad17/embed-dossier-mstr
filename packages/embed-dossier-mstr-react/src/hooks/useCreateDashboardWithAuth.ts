/**
 * Custom hook for creating and managing authenticated MicroStrategy dashboards
 *
 * This hook handles the complete lifecycle of dashboard authentication and creation:
 * - Multiple authentication methods support
 * - Token management
 * - Dashboard initialization
 * - Error handling
 *
 * Supported authentication methods:
 * - Guest authentication (no credentials required)
 * - Standard authentication (username/password)
 * - LDAP authentication (username/password)
 * - SAML authentication (redirect to identity provider)
 * - OIDC authentication (OpenID Connect flow)
 *
 * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { MicroStrategyDossier, MicroStrategyDossierConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";
import { getServerUrl } from "../utils";

/**
 * Props interface for useCreateDashboardWithAuth hook
 *
 * @property serverUrlLibrary - Base URL for the MicroStrategy Library server
 * @property placeholder - DOM element where the dashboard will be rendered
 * @property config - Dashboard configuration excluding placeholder
 * @property loginMode - Authentication method to use
 * @property username - Optional username for standard/LDAP auth
 * @property password - Optional password for standard/LDAP auth
 */
interface UseCreateDashboardWithAuthProps {
  serverUrlLibrary: string;
  placeholder: HTMLDivElement | null;
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

/**
 * Custom hook for creating authenticated MicroStrategy dashboards
 *
 * This hook manages the complete lifecycle of an authenticated dashboard:
 * 1. Loads the MicroStrategy SDK
 * 2. Handles authentication based on the specified login mode
 * 3. Creates and initializes the dashboard
 * 4. Manages authentication state and errors
 *
 * @param props - Hook configuration of type UseCreateDashboardWithAuthProps
 * @returns Object containing dashboard instance and authentication state
 *
 * @example
 * ```tsx
 * const { dashboard, isAuthenticating, error } = useCreateDashboardWithAuth({
 *   serverUrlLibrary: "https://your-mstr-server",
 *   placeholder: divRef.current,
 *   config: { url: "dashboard-url", ... },
 *   loginMode: "standard",
 *   username: "user",
 *   password: "pass"
 * });
 * ```
 */
const useCreateDashboardWithAuth = ({
  serverUrlLibrary,
  placeholder,
  config,
  loginMode,
  username,
  password,
}: UseCreateDashboardWithAuthProps) => {
  const [dashboard, setDashboard] = useState<MicroStrategyDossier | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
  });

  const { isSdkLoaded } = useLoadMstrSDK({ serverUrlLibrary });

  useEffect(() => {
    if (!isSdkLoaded || !placeholder) return;

    let mounted = true;
    const initializeDashboard = async () => {
      if (!mounted) return;
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {
        // Handle different auth modes
        switch (loginMode) {
          case "standard":
          case "ldap":
            if (!username || !password) {
              throw new Error(
                "Username and password are required for standard/LDAP authentication"
              );
            }
            const standardOptions: RequestInit = {
              method: "POST",
              credentials: "include" as RequestCredentials,
              mode: "cors" as RequestMode,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                loginMode: 1,
                username,
                password,
              }),
            };
            await fetch(`${serverUrlLibrary}/api/auth/login`, standardOptions);
            break;

          case "guest":
            const guestOptions: RequestInit = {
              method: "POST",
              credentials: "include" as RequestCredentials,
              mode: "cors" as RequestMode,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ loginMode: 8 }),
            };
            await fetch(`${serverUrlLibrary}/api/auth/login`, guestOptions);
            break;

          case "saml":
            try {
              await window.microstrategy.auth.samlLogin(serverUrlLibrary);
            } catch (e) {
              if (
                e instanceof Error &&
                e.message.includes("Failed to open a new tab")
              ) {
                throw new Error(
                  "Please enable popups to be directed to the SAML login site"
                );
              }
              throw e;
            }
            break;

          case "oidc":
            try {
              await window.microstrategy.auth.oidcLogin(serverUrlLibrary);
            } catch (e) {
              if (
                e instanceof Error &&
                e.message.includes("Failed to open a new tab")
              ) {
                throw new Error(
                  "Please enable popups to be directed to the OIDC login site"
                );
              }
              throw e;
            }
            break;
        }

        // Create dashboard with auth configuration
        const dossier = await window.microstrategy.dossier.create({
          ...config,
          placeholder,
          enableCustomAuthentication: true,
          customAuthenticationType:
            window.microstrategy.dossier.CustomAuthenticationType.AUTH_TOKEN,
          getLoginToken: async () => {
            const options: RequestInit = {
              method: "GET",
              credentials: "include" as RequestCredentials,
              mode: "cors" as RequestMode,
              headers: { "content-type": "application/json" },
            };
            const response = await fetch(
              `${serverUrlLibrary}/api/auth/token`,
              options
            );
            return response.ok
              ? response.headers.get("x-mstr-authtoken")
              : null;
          },
        });

        if (mounted) {
          setDashboard(dossier);
          setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
        }
      } catch (error) {
        if (mounted) {
          console.error("Dashboard auth error:", error);
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
    dashboard,
    ...authState,
  };
};

export { useCreateDashboardWithAuth };
