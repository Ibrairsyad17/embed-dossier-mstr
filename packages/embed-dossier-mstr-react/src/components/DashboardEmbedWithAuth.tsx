import { useCreateDashboardWithAuth } from "../hooks/useCreateDashboardWithAuth";
import { getInfoFromUrl } from "../utils";
import { clsx } from "clsx";
import { MicroStrategyDossierConfig } from "../types";
import { ReactNode, useRef } from "react";

interface DashboardEmbedWithAuthProps {
  /** Full MicroStrategy dossier URL */
  dossierUrl: string;
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Dashboard configuration options */
  config?: Omit<MicroStrategyDossierConfig, "placeholder" | "url">;
  /** Authentication method */
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  /** Username for standard/LDAP authentication */
  username?: string;
  /** Password for standard/LDAP authentication */
  password?: string;
  /** Custom loading component shown during authentication */
  loadingComponent?: ReactNode;
  /** Custom error component — receives the error message string */
  errorComponent?: ReactNode | ((error: string) => ReactNode);
}

/**
 * Embeds a MicroStrategy Dashboard with built-in authentication.
 *
 * Supports Guest, Standard, LDAP, SAML, and OIDC authentication methods.
 * Provides customizable loading and error states.
 *
 * @example
 * ```tsx
 * <DashboardEmbedWithAuth
 *   dossierUrl="https://your-server.com/MicroStrategyLibrary/app/{projectId}/{dossierId}"
 *   loginMode="standard"
 *   username="user"
 *   password="pass"
 *   style={{ width: "100%", height: "800px" }}
 *   loadingComponent={<Spinner />}
 *   errorComponent={(error) => <Alert message={error} />}
 * />
 * ```
 */
const DashboardEmbedWithAuth = ({
  dossierUrl,
  className,
  style,
  config,
  loginMode,
  username,
  password,
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error: string) => (
    <div
      style={{
        textAlign: "center",
        color: "#ef4444",
        padding: "16px",
        maxWidth: "448px",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
        Authentication Error
      </h3>
      <p>{error}</p>
    </div>
  ),
}: DashboardEmbedWithAuthProps) => {
  const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);
  const divRef = useRef<HTMLDivElement>(null);

  const { isAuthenticating, error } = useCreateDashboardWithAuth({
    serverUrlLibrary,
    placeholder: divRef.current,
    config: {
      url: dossierUrl,
      enableResponsive: true,
      enableCustomAuthentication: true,
      containerHeight: "600px",
      containerWidth: "100%",
      ...config,
    },
    loginMode,
    username,
    password,
  });

  if (isAuthenticating) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return (
      <>
        {typeof errorComponent === "function"
          ? errorComponent(error)
          : errorComponent}
      </>
    );
  }

  return (
    <div
      ref={divRef}
      className={clsx(className)}
      style={{ width: "100%", height: "600px", ...style }}
    />
  );
};

export { DashboardEmbedWithAuth };
export type { DashboardEmbedWithAuthProps };
