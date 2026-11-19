import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "geist" }) }));
vi.mock("./../app/globals.css", () => ({}));
import { metadata } from "@/app/layout";
import { alt, size } from "@/app/opengraph-image";

describe("share metadata", () => {
  it("describes the site as a Bookchaowalit demo and asks for a large share card", () => {
    expect(metadata.description).toMatch(/Bookchaowalit demo/);
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("ships a 1200x630 share image with alt text", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(alt).toMatch(/Services/);
  });
});
