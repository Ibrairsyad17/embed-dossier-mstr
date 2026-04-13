import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BotConsumptionPageWithAuth } from "../../components/BotConsumptionPageWithAuth";
import { useCreateBotConsumptionPageWithAuth } from "../../hooks/useCreateBotConsumptionPageWithAuth";

vi.mock("../../hooks/useCreateBotConsumptionPageWithAuth", () => ({
  useCreateBotConsumptionPageWithAuth: vi.fn(),
}));

describe("BotConsumptionPageWithAuth", () => {
  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    projectId: "B7CA92F04B9FAE8D941C3E9B7E0CD754",
    objectId: "27D332AC6D43352E0928B9A1FCAF4AB0",
    loginMode: "guest" as const,
    config: {
      containerHeight: "600px",
      containerWidth: "100%",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Methods", () => {
    beforeEach(() => {
      // Provide default mock return value for all auth tests
      vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
        botConsumptionPage: null,
        isAuthenticating: false,
        isAuthenticated: false,
        error: null,
      });
    });

    it("should handle guest authentication", () => {
      render(
        <BotConsumptionPageWithAuth {...defaultProps} loginMode="guest" />
      );

      expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "guest",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should handle standard authentication", () => {
      render(
        <BotConsumptionPageWithAuth
          {...defaultProps}
          loginMode="standard"
          username="testuser"
          password="testpass"
        />
      );

      expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "standard",
          username: "testuser",
          password: "testpass",
        })
      );
    });

    it("should handle LDAP authentication", () => {
      render(
        <BotConsumptionPageWithAuth
          {...defaultProps}
          loginMode="ldap"
          username="ldapuser"
          password="ldappass"
        />
      );

      expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "ldap",
          username: "ldapuser",
          password: "ldappass",
        })
      );
    });

    it("should handle SAML authentication", () => {
      render(<BotConsumptionPageWithAuth {...defaultProps} loginMode="saml" />);

      expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "saml",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should handle OIDC authentication", () => {
      render(<BotConsumptionPageWithAuth {...defaultProps} loginMode="oidc" />);

      expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "oidc",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should show error for standard auth without credentials", () => {
      vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
        botConsumptionPage: null,
        isAuthenticating: false,
        isAuthenticated: false,
        error:
          "Username and password are required for standard/LDAP authentication",
      });

      render(
        <BotConsumptionPageWithAuth {...defaultProps} loginMode="standard" />
      );

      expect(
        screen.getByText(/username and password are required/i)
      ).toBeInTheDocument();
    });

    it("should handle authentication state transitions", async () => {
      const { rerender } = render(
        <BotConsumptionPageWithAuth {...defaultProps} />
      );

      // Initial loading state
      vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
        botConsumptionPage: null,
        isAuthenticating: true,
        isAuthenticated: false,
        error: null,
      });
      rerender(<BotConsumptionPageWithAuth {...defaultProps} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Error state
      vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
        botConsumptionPage: null,
        isAuthenticating: false,
        isAuthenticated: false,
        error: "Auth failed",
      });
      rerender(<BotConsumptionPageWithAuth {...defaultProps} />);
      expect(screen.getByText("Auth failed")).toBeInTheDocument();

      // Success state
      vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
        botConsumptionPage: {},
        isAuthenticating: false,
        isAuthenticated: true,
        error: null,
      });
      rerender(<BotConsumptionPageWithAuth {...defaultProps} />);
      expect(screen.queryByText("Auth failed")).not.toBeInTheDocument();
    });
  });

  it("should render loading state", () => {
    vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
      botConsumptionPage: null,
      isAuthenticating: true,
      isAuthenticated: false,
      error: null,
    });

    render(<BotConsumptionPageWithAuth {...defaultProps} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render custom loading component", () => {
    vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
      botConsumptionPage: null,
      isAuthenticating: true,
      isAuthenticated: false,
      error: null,
    });

    render(
      <BotConsumptionPageWithAuth
        {...defaultProps}
        loadingComponent={
          <div data-testid="custom-loading">Custom Loading...</div>
        }
      />
    );

    expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
  });

  it("should handle authentication errors with custom error component", () => {
    const testError = "Auth Failed";
    vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
      botConsumptionPage: null,
      isAuthenticating: false,
      isAuthenticated: false,
      error: testError,
    });

    render(
      <BotConsumptionPageWithAuth
        {...defaultProps}
        errorComponent={(error) => (
          <div data-testid="custom-error">Error: {error}</div>
        )}
      />
    );

    expect(screen.getByTestId("custom-error")).toHaveTextContent(
      `Error: ${testError}`
    );
  });

  it("should pass correct authentication props to hook", () => {
    render(
      <BotConsumptionPageWithAuth
        {...defaultProps}
        loginMode="standard"
        username="testuser"
        password="testpass"
      />
    );

    expect(useCreateBotConsumptionPageWithAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        loginMode: "standard",
        username: "testuser",
        password: "testpass",
        projectId: defaultProps.projectId,
        objectId: defaultProps.objectId,
      })
    );
  });

  it("should render authenticated view with custom styles", () => {
    vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
      botConsumptionPage: {},
      isAuthenticating: false,
      isAuthenticated: true,
      error: null,
    });

    const { container } = render(
      <BotConsumptionPageWithAuth
        {...defaultProps}
        className="custom-class"
        style={{ backgroundColor: "red" }}
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("custom-class");
    expect(element).not.toHaveClass("w-full", "h-[600px]");
    expect(element.style.backgroundColor).toBe("red");
  });

  it("should render nothing when authenticated but no bot page", () => {
    vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
      botConsumptionPage: null,
      isAuthenticating: false,
      isAuthenticated: true,
      error: null,
    });

    const { container } = render(
      <BotConsumptionPageWithAuth {...defaultProps} />
    );
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });
});
