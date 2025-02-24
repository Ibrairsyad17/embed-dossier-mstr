import { useCreateLibraryPageWithAuth } from "../hooks/useCreateLibraryPageWithAuth";
import { EmbedLibraryPageConfig } from "../types";
import cn from "classnames";

interface LibraryPageEmbedWithAuthProps {
  serverUrlLibrary: string;
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
  className?: string;
  style?: React.CSSProperties;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

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
  const { libraryPage, isAuthenticated, error } = useCreateLibraryPageWithAuth({
    serverUrlLibrary,
    placeholder: null,
    config,
    loginMode,
    username,
    password,
  });

  if (error) {
    return <>{errorComponent(error)}</>;
  }

  if (!isAuthenticated || !libraryPage) {
    return null;
  }

  return <div className={cn("w-full h-[600px]", className)} style={style} />;
};

export { LibraryPageEmbedWithAuth };
