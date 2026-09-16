import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanaPage } from "./KanaPage";
import { ProgressProvider } from "../progress/ProgressContext";

/**
 * Covers the typed-answer test flow shared by every test page in the app
 * (config -> question -> result -> next), using KanaPage as the simplest
 * representative instance. A wrong answer is used so the test doesn't
 * depend on knowing which kana the randomised question picks. Enter is
 * dispatched on the input (bubbling to window, same as a real keypress)
 * because every test page submits/advances via a window-level keydown
 * listener rather than an onKeyDown prop, to survive focus moving to
 * <body> when the result screen swaps out the answer input.
 */
describe("KanaPage test flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("takes a wrong answer through to a result, then advances to the next question", () => {
    render(
      <ProgressProvider>
        <KanaPage />
      </ProgressProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /start test/i }));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "definitely not a valid answer" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/1 \/ /)).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Enter" });

    expect(screen.getByText(/2 \/ /)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
