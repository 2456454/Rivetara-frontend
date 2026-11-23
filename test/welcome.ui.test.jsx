import React from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Welcome from "../src/pages/Welcome";
import { api } from "../src/lib/api";
vi.mock("../src/lib/api", () => ({ api: vi.fn() }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
test("premium welcome retains sign-in and demo actions and accessible workflow tabs", async () => {
  const onSignIn = vi.fn(),
    onExplore = vi.fn();
  const user = userEvent.setup();
  render(<Welcome onSignIn={onSignIn} onExplore={onExplore} />);
  await user.click(
    screen.getByRole("button", { name: "Sign in", exact: true }),
  );
  expect(onSignIn).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: /Explore the demo/ }));
  expect(onExplore).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("tab", { name: "Sort the numbers" }));
  expect(
    screen.getByRole("tabpanel", { name: "Sort the numbers" }).textContent,
  ).toContain("A clearer picture of your paperwork.");
  await user.keyboard("{ArrowRight}");
  expect(
    screen
      .getByRole("tab", { name: "Find new customers" })
      .getAttribute("aria-selected"),
  ).toBe("true");
});
test("early-access form retains failed input, retries and clears after confirmed storage", async () => {
  const user = userEvent.setup();
  api
    .mockRejectedValueOnce(Error("Offline"))
    .mockResolvedValueOnce({ status: "registered" });
  render(<Welcome />);
  const email = screen.getByLabelText("Your email address");
  await user.type(email, "owner@example.com");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: /Join early access/ }));
  await screen.findByText(/We couldn’t save your email/);
  expect(email.value).toBe("owner@example.com");
  await user.click(screen.getByRole("button", { name: /Join early access/ }));
  await screen.findByText(/You’re on the list/);
  expect(email.value).toBe("");
  expect(api).toHaveBeenLastCalledWith("/api/early-access", {
    method: "POST",
    body: JSON.stringify({
      email: "owner@example.com",
      consent: true,
      website: "",
    }),
  });
});
test("existing account signup still checks availability and can return to the landing page", async () => {
  api.mockResolvedValue({ signupAvailable: false });
  const user = userEvent.setup();
  render(<Welcome />);
  await user.click(screen.getByRole("button", { name: "Create an account" }));
  await waitFor(() => expect(api).toHaveBeenCalledWith("/api/auth/status"));
  expect(screen.getByText(/Account creation isn’t open yet/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /Back to welcome/ }));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "You bring",
  );
});
