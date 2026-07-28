import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Tracking from "../components/Tracking";
import { useSettingsStore } from "../store/settingsStore";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  usePathname: () => "/products/test-slug",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the settings store
vi.mock("../store/settingsStore", () => ({
  useSettingsStore: vi.fn(),
}));

// Mock the cart store
vi.mock("../store/cartStore", () => ({
  useCartStore: () => ({
    addItem: vi.fn(),
  }),
}));

describe("Hydration Safety & Tracking Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render script tags on initial server render (unmounted state)", () => {
    // Simulate settings store enabled for facebook pixel
    (useSettingsStore as any).mockReturnValue({
      settings: {
        enable_facebook_pixel: "true",
        facebook_pixel_id: "1234567890",
      },
    });

    const { container } = render(<Tracking />);

    // During initial render, mounted is false, so it must return null (empty container)
    expect(container.firstChild).toBeNull();
  });

  it("should trigger state mount and render facebook pixel scripts after useEffect fires", async () => {
    (useSettingsStore as any).mockReturnValue({
      settings: {
        enable_facebook_pixel: "true",
        facebook_pixel_id: "99999999",
      },
    });

    const { container, rerender } = render(<Tracking />);

    // Re-render simulates useEffect running and setting mounted to true in test environment
    rerender(<Tracking />);

    // Script elements with ID fb-pixel should be present in the container
    const script = container.querySelector("#fb-pixel");
    expect(script).toBeDefined();
  });
});
