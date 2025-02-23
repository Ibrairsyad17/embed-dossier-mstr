import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardEmbedWithAuth } from "../../components/DashboardEmbedWithAuth";
import { useCreateDashboardWithAuth } from "../../hooks/useCreateDashboardWithAuth";
import { MicroStrategyDossier } from "../../types";

// Mock the hook
vi.mock("../../hooks/useCreateDashboardWithAuth", () => ({
  useCreateDashboardWithAuth: vi.fn(),
}));

describe("DashboardEmbedWithAuth", () => {
  const defaultProps = {
    dossierUrl:
      "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0",
    loginMode: "guest" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading component while authenticating", () => {
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: null,
      isAuthenticating: true,
      isAuthenticated: false,
      error: null,
    });

    render(<DashboardEmbedWithAuth {...defaultProps} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render custom loading component", () => {
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: null,
      isAuthenticating: true,
      isAuthenticated: false,
      error: null,
    });

    render(
      <DashboardEmbedWithAuth
        {...defaultProps}
        loadingComponent={<div>Custom Loading...</div>}
      />
    );
    expect(screen.getByText("Custom Loading...")).toBeInTheDocument();
  });

  it("should render error state", () => {
    const testError = "Authentication failed";
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: null,
      isAuthenticating: false,
      isAuthenticated: false,
      error: testError,
    });

    render(<DashboardEmbedWithAuth {...defaultProps} />);
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it("should render custom error component", () => {
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: null,
      isAuthenticating: false,
      isAuthenticated: false,
      error: "Some error",
    });

    render(
      <DashboardEmbedWithAuth
        {...defaultProps}
        errorComponent={(error) => <div>Custom Error: {error}</div>}
      />
    );
    expect(screen.getByText("Custom Error: Some error")).toBeInTheDocument();
  });

  it("should render dashboard container when authenticated", () => {
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: {} as MicroStrategyDossier,
      isAuthenticating: false,
      isAuthenticated: true,
      error: null,
    });

    const { container } = render(
      <DashboardEmbedWithAuth {...defaultProps} className="custom-class" />
    );

    const dashboardContainer = container.firstChild as HTMLElement;
    expect(dashboardContainer).toHaveClass("custom-class");
    expect(dashboardContainer).toHaveClass("w-full");
    expect(dashboardContainer).toHaveClass("h-[600px]");
  });

  it("should pass correct props to useCreateDashboardWithAuth", () => {
    const config = {
      enableResponsive: true,
      navigationBar: { enabled: true },
    };

    render(
      <DashboardEmbedWithAuth
        {...defaultProps}
        config={config}
        username="test"
        password="pass"
      />
    );

    expect(useCreateDashboardWithAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
        config: expect.objectContaining({
          url: defaultProps.dossierUrl,
          enableResponsive: true,
          navigationBar: { enabled: true },
        }),
        username: "test",
        password: "pass",
      })
    );
  });

  it("should apply custom styles", () => {
    vi.mocked(useCreateDashboardWithAuth).mockReturnValue({
      dashboard: {} as MicroStrategyDossier,
      isAuthenticating: false,
      isAuthenticated: true,
      error: null,
    });

    const customStyle = { backgroundColor: "red" };
    const { container } = render(
      <DashboardEmbedWithAuth {...defaultProps} style={customStyle} />
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle(customStyle);
  });
});
