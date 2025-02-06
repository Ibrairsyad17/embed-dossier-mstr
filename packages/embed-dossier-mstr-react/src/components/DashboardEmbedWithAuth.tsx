import { useCreateDashboardWithAuth } from "../hooks/useCreateDashboardWithAuth";
import { getInfoFromUrl } from "../utils";
import cn from "classnames";
import { MicroStrategyDossierConfig } from "../types";
import { ReactNode, useEffect } from "react";

interface DashboardEmbedWithAuthProps {
  dossierUrl: string; // https://{env-url}/{libraryName}/app/{projectId}/{dossierId}
  className?: string;
  style?: React.CSSProperties;
  config?: Omit<MicroStrategyDossierConfig, "placeholder" | "url">;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode | ((error: string) => ReactNode);
}

/**
 * DashboardEmbedWithAuth Component
 *
 * A component that handles both authentication and embedding of MicroStrategy dashboards.
 * Supports multiple authentication methods and provides loading/error states.
 *
 * @example
 * ```tsx
 * <DashboardEmbedWithAuth
 *   dossierUrl="https://your-mstr-server/MicroStrategyLibrary/app/..."
 *   loginMode="standard"
 *   username="user"
 *   password="pass"
 *   className="dashboard-container"
 *   loadingComponent={<Spinner />}
 *   errorComponent={(error) => <ErrorAlert message={error} />}
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
  errorComponent = (error: string) => <div>Error: {error}</div>,
}: DashboardEmbedWithAuthProps) => {
  const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);

  const { containerRef, isAuthenticating, error, dashboard, isAuthenticated } =
    useCreateDashboardWithAuth({
      serverUrlLibrary,
      config: {
        url: dossierUrl,
        enableCustomAuthentication: true,
        customAuthenticationType: "AUTH_TOKEN",
        ...config,
      },
      loginMode,
      username,
      password,
    });

  // Debug logging
  useEffect(() => {
    if (error) {
      console.error("Dashboard auth error:", error);
    }
    if (isAuthenticated) {
      console.log("Dashboard authenticated successfully");
    }
    if (dashboard) {
      console.log("Dashboard instance created");
    }
  }, [error, isAuthenticated, dashboard]);

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

  return <div ref={containerRef} className={cn(className)} style={style} />;
};

export { DashboardEmbedWithAuth };
