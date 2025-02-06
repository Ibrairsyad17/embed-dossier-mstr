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

import { useEffect, useRef, useState } from "react";
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
  const serverUrl = getServerUrl(config.url);

  /**
   * Guest Authentication Handler
   *
   * Authenticates using guest mode (loginMode: 8)
   * For more information, see:
   * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/guest-authentication-mode-only
   *
   * @returns Promise<string | null> - Authentication token
   * @throws Error if authentication fails
   */
  const handleGuestAuth = async () => {
    const options = {
      method: "POST",
      credentials: "include" as RequestCredentials,
      mode: "cors" as RequestMode,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ loginMode: 8 }),
    };

    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, options);
      if (response.ok) {
        return response.headers.get("x-mstr-authtoken");
      }
      throw new Error("Guest authentication failed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Guest authentication failed: ${errorMessage}`);
    }
  };

  /**
   * Standard/LDAP Authentication Handler
   *
   * Authenticates using username and password (loginMode: 1)
   * For more information, see:
   * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/standard-authentication
   *
   * @returns Promise<string | null> - Authentication token
   * @throws Error if authentication fails or credentials are missing
   */
  const handleStandardAuth = async () => {
    if (!username || !password) {
      throw new Error(
        "Username and password are required for standard authentication"
      );
    }

    const options = {
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

    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, options);
      if (response.ok) {
        return response.headers.get("x-mstr-authtoken");
      }
      throw new Error("Standard authentication failed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Standard authentication failed: ${errorMessage}`);
    }
  };

  /**
   * SAML Authentication Handler
   *
   * Initiates SAML authentication flow in a new window
   * For more information, see:
   * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/new-authentication-apis
   *
   * @returns Promise<boolean> - True if authentication successful
   * @throws Error if popup blocked or authentication fails
   */
  const handleSamlAuth = async () => {
    try {
      await window.microstrategy.auth.samlLogin(serverUrl);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Failed to open a new tab")
      ) {
        throw new Error(
          "Please enable popups to be directed to the login site"
        );
      }
      throw error;
    }
  };

  /**
   * OIDC Authentication Handler
   *
   * Initiates OIDC authentication flow in a new window
   * For more information, see:
   * @see https://microstrategy.github.io/embedding-sdk-docs/support-for-different-authentication-environments/new-authentication-apis
   *
   * @returns Promise<boolean> - True if authentication successful
   * @throws Error if popup blocked or authentication fails
   */
  const handleOidcAuth = async () => {
    try {
      await window.microstrategy.auth.oidcLogin(serverUrl);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Failed to open a new tab")
      ) {
        throw new Error(
          "Please enable popups to be directed to the login site"
        );
      }
      throw error;
    }
  };

  /**
   * Authentication Token Retrieval
   *
   * Gets the current authentication token for dashboard creation
   * Used as getLoginToken in dashboard configuration
   *
   * @returns Promise<string | null> - Current authentication token
   */
  const getAuthToken = async () => {
    const options = {
      method: "GET",
      credentials: "include" as RequestCredentials,
      mode: "cors" as RequestMode,
      headers: { "content-type": "application/json" },
    };

    try {
      const response = await fetch(`${serverUrl}/api/auth/token`, options);
      if (response.ok) {
        return response.headers.get("x-mstr-authtoken");
      }
      return null;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  };

  /**
   * Dashboard Creation Handler
   *
   * Creates the dashboard after successful authentication
   * Configures custom authentication and token management
   *
   * @throws Error if dashboard creation fails
   */
  const createDashboard = async () => {
    if (!containerRef.current) return;

    try {
      const dashboardConfig: MicroStrategyDossierConfig = {
        ...config,
        placeholder: containerRef.current,
        enableCustomAuthentication: true,
        customAuthenticationType:
          window.microstrategy.dossier.CustomAuthenticationType.AUTH_TOKEN,
        getLoginToken: getAuthToken,
      };

      const dossier =
        await window.microstrategy.dossier.create(dashboardConfig);
      setDashboard(dossier);
      setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: `Failed to create dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
    }
  };

  /**
   * Authentication Flow Effect
   *
   * Manages the complete authentication and dashboard creation flow
   * - Initiates appropriate authentication based on loginMode
   * - Creates dashboard after successful authentication
   * - Handles errors and updates state accordingly
   */
  useEffect(() => {
    if (!isSdkLoaded) return;

    const authenticate = async () => {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {
        switch (loginMode) {
          case "guest":
            await handleGuestAuth();
            break;
          case "standard":
          case "ldap":
            await handleStandardAuth();
            break;
          case "saml":
            await handleSamlAuth();
            break;
          case "oidc":
            await handleOidcAuth();
            break;
          default:
            throw new Error(`Unsupported login mode: ${loginMode}`);
        }

        await createDashboard();
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isAuthenticated: false,
        }));
      } finally {
        setAuthState((prev) => ({ ...prev, isAuthenticating: false }));
      }
    };

    authenticate();
  }, [isSdkLoaded, loginMode]);

  return {
    dashboard,
    containerRef,
    ...authState,
  };
};

export { useCreateDashboardWithAuth };
