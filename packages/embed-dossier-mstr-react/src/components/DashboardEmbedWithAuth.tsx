import { useCreateDashboardWithAuth } from "../hooks/useCreateDashboardWithAuth";
import { getInfoFromUrl } from "../utils";
import cn from "classnames";
import { MicroStrategyDossierConfig } from "../types";
import { ReactNode, useEffect, useRef } from "react";

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
  errorComponent = (error: string) => (
    <div className="text-center text-red-500 p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Authentication Error</h3>
      <p>{error}</p>
    </div>
  ),
}: DashboardEmbedWithAuthProps) => {
  const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);
  const divRef = useRef<HTMLDivElement>(null);

  const { isAuthenticating, error, isAuthenticated } =
    useCreateDashboardWithAuth({
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
      className={cn("w-full h-[600px]", className)}
      style={style}
    />
  );
};

export { DashboardEmbedWithAuth };
