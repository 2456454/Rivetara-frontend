import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import BusinessPreview from "../src/components/BusinessPreview";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
test("business tools cycle automatically and stay still while a visitor reads on hover", () => {
  vi.useFakeTimers();
  render(<BusinessPreview />);
  expect(screen.getByRole("tabpanel").textContent).toContain(
    "A clearer day starts here.",
  );
  act(() => vi.advanceTimersByTime(8000));
  expect(screen.getByRole("tabpanel").textContent).toContain(
    "Give your idea a way forward.",
  );
  fireEvent.mouseEnter(
    screen.getByLabelText("Illustrative Rivetara business support tools"),
  );
  act(() => vi.advanceTimersByTime(16000));
  expect(
    screen.getByRole("tab", { name: "Planning" }).getAttribute("aria-selected"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("tab", { name: "Finances" }));
  expect(screen.getByRole("tabpanel").textContent).toContain(
    "Records prepared for professional review",
  );
});
test("reduced motion keeps a static scene while allowing keyboard exploration", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.useFakeTimers();
  render(<BusinessPreview />);
  act(() => vi.advanceTimersByTime(24000));
  expect(
    screen.getByRole("tab", { name: "Everyday" }).getAttribute("aria-selected"),
  ).toBe("true");
  fireEvent.keyDown(screen.getByRole("tab", { name: "Everyday" }), {
    key: "ArrowRight",
  });
  expect(
    screen.getByRole("tab", { name: "Planning" }).getAttribute("aria-selected"),
  ).toBe("true");
});
