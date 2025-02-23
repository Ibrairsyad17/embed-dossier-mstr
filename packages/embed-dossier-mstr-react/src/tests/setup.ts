import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock getComputedStyle
Object.defineProperty(window, "getComputedStyle", {
  value: (element: Element) => ({
    ...element,
    getPropertyValue: (prop: string) => {
      return (
        (element as HTMLElement).style[prop as keyof CSSStyleDeclaration] || ""
      );
    },
    setProperty: (prop: string, value: string) => {
      try {
        Object.defineProperty((element as HTMLElement).style, prop, {
          value: value,
          configurable: true,
        });
      } catch (e) {
        console.error("Failed to set style property:", e);
      }
    },
  }),
});

afterEach(() => {
  cleanup();
});
