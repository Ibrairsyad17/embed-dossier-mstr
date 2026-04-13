import { useCreateLibraryPageWithAuth } from "../hooks/useCreateLibraryPageWithAuth";
import { EmbedLibraryPageConfig } from "../types";
import { clsx } from "clsx";
import { useRef } from "react";

interface LibraryPageEmbedWithAuthProps {
  /** Base URL of the MicroStrategy Library server */
  serverUrlLibrary: string;
  /** Library page configuration */
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
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
 * Embeds a MicroStrategy Library Page with built-in authentication.
 *
 * @example
 * ```tsx
 * <LibraryPageEmbedWithAuth
 *   serverUrlLibrary="https://your-server.com/MicroStrategyLibrary"
 *   loginMode="guest"
 *   style={{ width: "100%", height: "800px" }}
 * />
 * ```
 */
const LibraryPageEmbedWithAuth = ({
  serverUrlLibrary,
  config,
  loginMode,
  username,
  password,
  className,
  style,
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error) => <div>{error}</div>,
}: LibraryPageEmbedWithAuthProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { libraryPage, isAuthenticated, error } = useCreateLibraryPageWithAuth({
    serverUrlLibrary,
    placeholder: containerRef.current,
    config,
    loginMode,
    username,
    password,
  });

  if (error) {
    return <>{errorComponent(error)}</>;
  }

  if (!isAuthenticated || !libraryPage) {
    return <>{loadingComponent}</>;
  }

  return (
    <div
      ref={containerRef}
      className={clsx(className)}
      style={{ width: "100%", height: "600px", ...style }}
    />
  );
};

export { LibraryPageEmbedWithAuth };
export type { LibraryPageEmbedWithAuthProps };
