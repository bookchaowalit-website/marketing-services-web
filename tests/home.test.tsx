import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("home page", () => {
  it("renders the sample ledger, counters and the local-only notice", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Make the work easy to find.");
    expect(html).toContain("Full-stack build");
    expect(html).toContain("Data workflow prototype");
    expect(html).toContain("<strong>2</strong> available now");
    expect(html).toContain("Stored in this browser only. No checkout, account, or remote catalog.");
  });
});
