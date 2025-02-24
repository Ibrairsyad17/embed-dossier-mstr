import { useCreateBotConsumptionPageWithAuth } from "../hooks/useCreateBotConsumptionPageWithAuth";
import { EmbedBotConsumptionPageConfig } from "../types";
import cn from "classnames";

interface BotConsumptionPageWithAuthProps {
  serverUrlLibrary: string;
  projectId: string;
  objectId: string;
  config: Omit<
    EmbedBotConsumptionPageConfig,
    "placeholder" | "serverUrl" | "projectId" | "objectId"
  >;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username?: string;
  password?: string;
  className?: string;
  style?: React.CSSProperties;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

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
  const { botConsumptionPage, isAuthenticated, isAuthenticating, error } =
    useCreateBotConsumptionPageWithAuth({
      serverUrlLibrary,
      placeholder: null,
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

  if (!isAuthenticated || !botConsumptionPage) {
    return null;
  }

  return <div className={cn("w-full h-[600px]", className)} style={style} />;
};

export { BotConsumptionPageWithAuth };
