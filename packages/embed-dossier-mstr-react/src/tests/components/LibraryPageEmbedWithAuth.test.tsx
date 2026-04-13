import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryPageEmbedWithAuth } from "../../components/LibraryPageEmbedWithAuth";
import { useCreateLibraryPageWithAuth } from "../../hooks/useCreateLibraryPageWithAuth";

vi.mock("../../hooks/useCreateLibraryPageWithAuth", () => ({
  useCreateLibraryPageWithAuth: vi.fn(),
}));

describe("LibraryPageEmbedWithAuth", () => {
  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
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
      vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
        libraryPage: null,
        isAuthenticated: false,
        error: null,
      });
    });

    it("should handle guest authentication", () => {
      render(<LibraryPageEmbedWithAuth {...defaultProps} loginMode="guest" />);

      expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "guest",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should handle standard authentication", () => {
      render(
        <LibraryPageEmbedWithAuth
          {...defaultProps}
          loginMode="standard"
          username="testuser"
          password="testpass"
        />
      );

      expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "standard",
          username: "testuser",
          password: "testpass",
        })
      );
    });

    it("should handle LDAP authentication", () => {
      render(
        <LibraryPageEmbedWithAuth
          {...defaultProps}
          loginMode="ldap"
          username="ldapuser"
          password="ldappass"
        />
      );

      expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "ldap",
          username: "ldapuser",
          password: "ldappass",
        })
      );
    });

    it("should handle SAML authentication", () => {
      render(<LibraryPageEmbedWithAuth {...defaultProps} loginMode="saml" />);

      expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "saml",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should handle OIDC authentication", () => {
      render(<LibraryPageEmbedWithAuth {...defaultProps} loginMode="oidc" />);

      expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMode: "oidc",
          username: undefined,
          password: undefined,
        })
      );
    });

    it("should show error for standard auth without credentials", () => {
      vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
        libraryPage: null,
        isAuthenticated: false,
        error:
          "Username and password are required for standard/LDAP authentication",
      });

      render(
        <LibraryPageEmbedWithAuth {...defaultProps} loginMode="standard" />
      );

      expect(
        screen.getByText(/username and password are required/i)
      ).toBeInTheDocument();
    });

    it("should handle authentication state transitions", async () => {
      const { rerender } = render(
        <LibraryPageEmbedWithAuth {...defaultProps} />
      );

      // Initial loading state
      vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
        libraryPage: null,
        isAuthenticated: false,
        error: null,
      });
      rerender(<LibraryPageEmbedWithAuth {...defaultProps} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Error state
      vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
        libraryPage: null,
        isAuthenticated: false,
        error: "Auth failed",
      });
      rerender(<LibraryPageEmbedWithAuth {...defaultProps} />);
      expect(screen.getByText("Auth failed")).toBeInTheDocument();

      // Success state
      vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
        libraryPage: {
          getAllMyGroups: vi.fn(),
          getAllDefaultGroups: vi.fn(),
          setNavigationBarEnabled: vi.fn(),
          setSidebarVisibility: vi.fn(),
        },
        isAuthenticated: true,
        error: null,
      });
      rerender(<LibraryPageEmbedWithAuth {...defaultProps} />);
      expect(screen.queryByText("Auth failed")).not.toBeInTheDocument();
    });
  });

  it("should render loading component when not authenticated", () => {
    vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
      libraryPage: null,
      isAuthenticated: false,
      error: null,
    });

    // const { container } = 
    render(<LibraryPageEmbedWithAuth {...defaultProps} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render custom loading component", () => {
    vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
      libraryPage: null,
      isAuthenticated: false,
      error: null,
    });

    render(
      <LibraryPageEmbedWithAuth
        {...defaultProps}
        loadingComponent={
          <div data-testid="custom-loading">Custom Loading...</div>
        }
      />
    );

    expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
  });

  it("should render error state with custom error component", () => {
    const testError = "Authentication Error";
    vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
      libraryPage: null,
      isAuthenticated: false,
      error: testError,
    });

    render(
      <LibraryPageEmbedWithAuth
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
      <LibraryPageEmbedWithAuth
        {...defaultProps}
        loginMode="standard"
        username="testuser"
        password="testpass"
      />
    );

    expect(useCreateLibraryPageWithAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        loginMode: "standard",
        username: "testuser",
        password: "testpass",
      })
    );
  });

  it("should render authenticated view with custom styles", () => {
    vi.mocked(useCreateLibraryPageWithAuth).mockReturnValue({
      libraryPage: {},
      isAuthenticated: true,
      error: null,
    });

    const { container } = render(
      <LibraryPageEmbedWithAuth
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
});
