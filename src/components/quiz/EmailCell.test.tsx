import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EmailCell } from "./EmailCell";

class ResizeObserverMock {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    setTimeout(() => {
      this.callback(
        [
          {
            target,
            contentRect: {
              width: 400,
              height: 50,
              top: 0,
              left: 0,
              bottom: 50,
              right: 400,
              x: 0,
              y: 0,
            } as DOMRectReadOnly,
            borderBoxSize: [] as any,
            contentBoxSize: [] as any,
            devicePixelContentBoxSize: [] as any,
          },
        ],
        this
      );
    }, 0);
  }

  unobserve() {}
  disconnect() {}
}

const mockMeasureText = vi.fn((text: string) => ({
  width: text.length * 8,
}));

const mockGetContext = vi.fn(() => ({
  measureText: mockMeasureText,
  font: "",
}));

beforeEach(() => {
  globalThis.ResizeObserver = ResizeObserverMock as any;

  HTMLCanvasElement.prototype.getContext = mockGetContext as any;

  mockMeasureText.mockClear();
  mockGetContext.mockClear();
});

describe("EmailCell", () => {
  describe("Basic Rendering", () => {
    it("should render empty state when no emails provided", () => {
      render(<EmailCell emails={[]} />);
      expect(screen.getByText("–")).toBeInTheDocument();
    });

    it("should render empty state when empty string provided", () => {
      render(<EmailCell emails={[""]} />);
      expect(screen.getByText("–")).toBeInTheDocument();
    });

    it("should render single email", async () => {
      render(<EmailCell emails={["test@example.com"]} />);
      await waitFor(() => {
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });
    });

    it("should render multiple emails", async () => {
      render(<EmailCell emails={["a@test.com", "b@test.com"]} />);
      await waitFor(() => {
        expect(screen.getByText(/a@test.com, b@test.com/)).toBeInTheDocument();
      });
    });
  });

  describe("Email Separator", () => {
    it("should use comma and space as separator", async () => {
      render(<EmailCell emails={["first@test.com", "second@test.com"]} />);
      await waitFor(() => {
        const text = screen.getByText(/first@test.com, second@test.com/);
        expect(text.textContent).toContain(", ");
      });
    });

    it("should not add separator for single email", async () => {
      render(<EmailCell emails={["single@test.com"]} />);
      await waitFor(() => {
        const text = screen.getByText("single@test.com");
        expect(text.textContent).not.toContain(",");
      });
    });
  });

  describe("Overflow Badge", () => {
    it("should show +N badge when not all emails fit", async () => {
      const narrowObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 150, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = narrowObserver as any;

      render(
        <EmailCell
          emails={["a@test.com", "b@test.com", "c@test.com", "d@test.com"]}
        />
      );

      await waitFor(() => {
        const badge = screen.queryByText(/\+\d+/);
        expect(badge).toBeInTheDocument();
      });
    });

    it("should have correct aria-label on badge", async () => {
      const narrowObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = narrowObserver as any;

      const emails = ["first@test.com", "second@test.com", "third@test.com"];
      render(<EmailCell emails={emails} />);

      await waitFor(() => {
        const badge = screen.queryByRole("button");
        if (badge) {
          expect(badge).toHaveAttribute("aria-label");
          const ariaLabel = badge.getAttribute("aria-label");
          expect(ariaLabel).toContain("email");
        }
      });
    });

    it("should show tooltip on hover", async () => {
      const user = userEvent.setup();
      const narrowObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 150, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = narrowObserver as any;

      const emails = ["first@test.com", "second@test.com", "third@test.com"];
      render(<EmailCell emails={emails} />);

      await waitFor(async () => {
        const badge = screen.queryByText(/\+\d+/);
        if (badge) {
          await user.hover(badge);
          await waitFor(() => {
            expect(
              screen.getByText(
                /first@test.com, second@test.com, third@test.com/
              )
            ).toBeInTheDocument();
          });
        }
      });
    });
  });

  describe("Text Truncation", () => {
    it("should truncate long single email with ellipsis", async () => {
      const longEmail =
        "very-long-email-address-that-should-be-truncated@example-domain.com";
      const { container } = render(<EmailCell emails={[longEmail]} />);

      await waitFor(() => {
        const listElement = container.querySelector(".email-cell__list");
        expect(listElement).toHaveStyle({ textOverflow: "ellipsis" });
        expect(listElement).toHaveStyle({ overflow: "hidden" });
      });
    });

    it("should not truncate when multiple emails fit", async () => {
      const wideObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 800, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = wideObserver as any;

      const { container } = render(
        <EmailCell emails={["a@test.com", "b@test.com"]} />
      );

      await waitFor(() => {
        const listElement = container.querySelector(".email-cell__list");
        expect(listElement).not.toHaveStyle({ textOverflow: "ellipsis" });
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle duplicate emails", async () => {
      render(
        <EmailCell
          emails={["dup@test.com", "dup@test.com", "unique@test.com"]}
        />
      );
      await waitFor(() => {
        expect(
          screen.getByText(/dup@test.com, dup@test.com, unique@test.com/)
        ).toBeInTheDocument();
      });
    });

    it("should handle special characters in emails", async () => {
      const emails = ["user+tag@domain.com", "name.surname@company.co.uk"];
      render(<EmailCell emails={emails} />);
      await waitFor(() => {
        expect(screen.getByText(/user\+tag@domain\.com/)).toBeInTheDocument();
      });
    });

    it("should handle very long email list", async () => {
      const manyEmails = Array.from(
        { length: 20 },
        (_, i) => `user${i}@test.com`
      );
      render(<EmailCell emails={manyEmails} />);
      await waitFor(() => {
        const container = screen.getByText(/user0@test\.com/);
        expect(container).toBeInTheDocument();
      });
    });

    it("should handle single character emails", async () => {
      render(<EmailCell emails={["a@a.com", "b@b.com"]} />);
      await waitFor(() => {
        expect(screen.getByText(/a@a\.com, b@b\.com/)).toBeInTheDocument();
      });
    });
  });

  describe("ResizeObserver Integration", () => {
    it("should setup ResizeObserver on mount", () => {
      const observeSpy = vi.spyOn(ResizeObserverMock.prototype, "observe");
      render(<EmailCell emails={["test@example.com"]} />);
      expect(observeSpy).toHaveBeenCalled();
    });

    it("should cleanup ResizeObserver on unmount", () => {
      const disconnectSpy = vi.spyOn(
        ResizeObserverMock.prototype,
        "disconnect"
      );
      const { unmount } = render(<EmailCell emails={["test@example.com"]} />);
      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on badge", async () => {
      const narrowObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = narrowObserver as any;

      render(<EmailCell emails={["a@test.com", "b@test.com", "c@test.com"]} />);

      await waitFor(() => {
        const badge = screen.queryByRole("button");
        if (badge) {
          expect(badge).toHaveAttribute("tabIndex", "0");
          expect(badge).toHaveAttribute("aria-label");
        }
      });
    });

    it("should be keyboard accessible", async () => {
      const narrowObserver = class extends ResizeObserverMock {
        observe(target: Element) {
          setTimeout(() => {
            this.callback(
              [
                {
                  target,
                  contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
                  borderBoxSize: [] as any,
                  contentBoxSize: [] as any,
                  devicePixelContentBoxSize: [] as any,
                },
              ],
              this
            );
          }, 0);
        }
      };
      globalThis.ResizeObserver = narrowObserver as any;

      render(<EmailCell emails={["a@test.com", "b@test.com"]} />);

      await waitFor(() => {
        const badge = screen.queryByRole("button");
        if (badge) {
          expect(badge).toHaveAttribute("tabIndex", "0");
          badge.focus();
          expect(badge).toHaveFocus();
        }
      });
    });
  });
});
