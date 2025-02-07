import { useCreateDashboardWithAuth } from "../hooks/useCreateDashboardWithAuth";
import { getInfoFromUrl } from "../utils";
import cn from "classnames";
import { MicroStrategyDossierConfig } from "../types";
import { ReactNode, useRef } from "react";

/**
 * Props interface for the DashboardEmbedWithAuth component
 *
 * @property dossierUrl - The full URL of the MicroStrategy dossier to embed
 *                        Format: https://{env-url}/{libraryName}/app/{projectId}/{dossierId}
 * @property className - Optional CSS class names to apply to the container
 * @property style - Optional inline styles to apply to the container
 * @property config - Dashboard configuration options excluding placeholder and URL
 * @property loginMode - Authentication method to use (guest/standard/saml/oidc/ldap)
 * @property username - Username for standard/LDAP authentication
 * @property password - Password for standard/LDAP authentication
 * @property loadingComponent - Custom component to show during authentication/loading
 * @property errorComponent - Custom component or function to render error states
 */
interface DashboardEmbedWithAuthProps {
  dossierUrl: string;
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
 * A React component that handles authentication and embedding of MicroStrategy dashboards.
 * This component supports multiple authentication methods and provides customizable
 * loading and error states.
 *
 * Features:
 * - Multiple authentication methods (Guest, Standard, SAML, OIDC, LDAP)
 * - Customizable loading and error states
 * - Responsive design support
 * - Custom styling options
 *
 * Usage example:
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
 *
 * @param props - Component props of type DashboardEmbedWithAuthProps
 * @returns React component that renders the authenticated dashboard
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
  // Extract server URL from the full dossier URL
  const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);

  // Create a ref for the dashboard container
  const divRef = useRef<HTMLDivElement>(null);

  // Initialize dashboard with authentication
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

  // Show loading state while authenticating
  if (isAuthenticating) {
    return <>{loadingComponent}</>;
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <>
        {typeof errorComponent === "function"
          ? errorComponent(error)
          : errorComponent}
      </>
    );
  }

  // Render the dashboard container
  return (
    <div
      ref={divRef}
      className={cn("w-full h-[600px]", className)}
      style={style}
    />
  );
};

export { DashboardEmbedWithAuth };
