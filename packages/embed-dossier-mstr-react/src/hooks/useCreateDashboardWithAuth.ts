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
 * @property placeholder - Placeholder element for the dashboard
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
