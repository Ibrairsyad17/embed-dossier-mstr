import { useEffect, useRef, useState } from "react";
import { MicroStrategyDossier, MicroStrategyDossierConfig } from "../types";
import { useLoadMstrSDK } from "./useLoadMstrSDK";

interface UseCreateDashboardWithAuthProps {
  serverUrlLibrary: string;
  config: Omit<MicroStrategyDossierConfig, "placeholder">;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
  username: string;
  password: string;
}

const useCreateDashboardWithAuth = ({
  serverUrlLibrary,
  config,
  loginMode,
  username,
  password,
}: UseCreateDashboardWithAuthProps) => {
  useEffect(() => {}, []);
};

export { useCreateDashboardWithAuth };
