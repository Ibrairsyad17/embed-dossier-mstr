import { vi } from "vitest";

export const mockMicrostrategy = {
  dossier: {
    create: vi.fn(),
    CustomAuthenticationType: {
      AUTH_TOKEN: "auth-token",
      IDENTITY_TOKEN: "identity-token",
    },
  },
};
