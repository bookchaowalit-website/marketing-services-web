import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("home page on the App shell", () => {
  const html = renderToString(<Home />);

  it("renders the sample list with status pills and the local-only notice", () => {
    expect(html).toContain('class="as"');
    expect(html).toContain("Full-stack build");
    expect(html).toContain("Data workflow prototype");
    expect(html).toMatch(/data-tone="green"[^>]*>Available</);
    expect(html).toMatch(/data-tone="amber"[^>]*>Draft</);
    expect(html).toContain("Stored in this browser only. No checkout, account, or remote catalog.");
  });

  it("shows the lists with their counts and marks All services as current", () => {
    expect(html).toMatch(/aria-current="true"[^>]*><span>All services<\/span><span class="as-count">3<\/span>/);
    expect(html).toMatch(/Available<\/span><span class="as-count">2<\/span>/);
    expect(html).toMatch(/Paused<\/span><span class="as-count">0<\/span>/);
  });

  it("names every remove button after its service and links back to the hub", () => {
    expect(html).toContain('aria-label="Remove Full-stack build"');
    expect(html).toContain('href="https://bookchaowalit.com/"');
    expect(html).not.toMatch(/ledger/i);
  });
});
