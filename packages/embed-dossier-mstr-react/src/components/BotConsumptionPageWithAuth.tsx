import { useCreateBotConsumptionPageWithAuth } from "../hooks/useCreateBotConsumptionPageWithAuth";
import { EmbedBotConsumptionPageConfig } from "../types";
import { clsx } from "clsx";
import { useRef } from "react";

interface BotConsumptionPageWithAuthProps {
  /** Base URL of the MicroStrategy Library server */
  serverUrlLibrary: string;
  /** MicroStrategy project ID */
  projectId: string;
  /** Bot object ID */
  objectId: string;
  /** Bot page configuration */
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
  /** Authentication method */
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  /** Username for standard/LDAP authentication */
  username?: string;
  /** Password for standard/LDAP authentication */
  password?: string;
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component — receives error message */
  errorComponent?: (error: string) => React.ReactNode;
}

/**
 * Embeds a MicroStrategy Bot Consumption Page with built-in authentication.
 *
 * @example
 * ```tsx
 * <BotConsumptionPageWithAuth
 *   serverUrlLibrary="https://your-server.com/MicroStrategyLibrary"
 *   projectId="B7CA92F0"
 *   objectId="27D332AC"
 *   config={{}}
 *   loginMode="guest"
 *   style={{ width: "100%", height: "600px" }}
 * />
 * ```
 */
const BotConsumptionPageWithAuth = ({
  serverUrlLibrary,
  projectId,
  objectId,
  config,
  loginMode,
  username,
  password,
  className,
  style,
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error) => <div>{error}</div>,
}: BotConsumptionPageWithAuthProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, isAuthenticating, error } =
    useCreateBotConsumptionPageWithAuth({
      serverUrlLibrary,
      placeholder: containerRef.current,
      projectId,
      objectId,
      config,
      loginMode,
      username,
      password,
    });

  if (isAuthenticating) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent(error)}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={clsx(className)}
      style={{ width: "100%", height: "600px", ...style }}
    />
  );
};

export { BotConsumptionPageWithAuth };
export type { BotConsumptionPageWithAuthProps };
