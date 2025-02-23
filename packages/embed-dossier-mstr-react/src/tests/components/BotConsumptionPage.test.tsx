import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { BotConsumptionPage } from "../../components/BotConsumptionPage";
import { useCreateBotConsumptionPage } from "../../hooks/useCreateBotConsumptionPage";

// ...existing code if any...

vi.mock("../../hooks/useCreateBotConsumptionPage", () => ({
  useCreateBotConsumptionPage: vi.fn(),
}));

describe("BotConsumptionPage", () => {
  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com",
    projectId: "project123",
    objectId: "object456",
    config: {
      containerHeight: "500px",
      containerWidth: "100%",
      enableCustomAuthentication: false,
      enableResponsive: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render and pass correct props to hook", () => {
    vi.mocked(useCreateBotConsumptionPage).mockReturnValue({
      botConsumptionPage: null,
      botConsumptionPageRef: { current: null },
      isBotConsumptionPageError: false,
      isSdkError: { isError: false, message: "" },
      isSdkLoaded: true,
    });

    const { container } = render(<BotConsumptionPage {...defaultProps} />);
    expect(useCreateBotConsumptionPage).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrlLibrary: defaultProps.serverUrlLibrary,
        projectId: defaultProps.projectId,
        objectId: defaultProps.objectId,
        config: expect.objectContaining({ containerHeight: "500px" }),
      })
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("should apply className and style", () => {
    vi.mocked(useCreateBotConsumptionPage).mockReturnValue({
      botConsumptionPage: null,
      botConsumptionPageRef: { current: null },
      isBotConsumptionPageError: false,
      isSdkError: { isError: false, message: "" },
      isSdkLoaded: true,
    });

    const { container } = render(
      <BotConsumptionPage
        {...defaultProps}
        className="test-class"
        style={{ backgroundColor: "red" }}
      />
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("test-class");
    expect(element.style.backgroundColor).toBe("red");
  });
});
