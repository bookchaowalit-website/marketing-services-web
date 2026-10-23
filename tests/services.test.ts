import { describe, expect, it } from "vitest";
import { SEED, addService, countAvailable, filterServices, parseServices, removeService } from "@/lib/services";

describe("parseServices", () => {
  it("returns null for missing, corrupt or non-array data so the sample is used", () => {
    expect(parseServices(null)).toBeNull();
    expect(parseServices("{broken")).toBeNull();
    // Regression: a stored object reached services.filter() and crashed the page.
    expect(parseServices('{"service-1":true}')).toBeNull();
    expect(parseServices("42")).toBeNull();
  });

  it("keeps valid lines, drops malformed ones, keeps an empty ledger empty", () => {
    expect(parseServices(JSON.stringify([SEED[0], { id: 1 }, { ...SEED[1], status: "Sold" }]))).toEqual([SEED[0]]);
    expect(parseServices("[]")).toEqual([]);
  });
});

describe("filterServices", () => {
  it("matches name, details and state, ignoring case and surrounding spaces", () => {
    // Regression: the query was not trimmed, so "draft " missed the Draft line (its state is the last word matched).
    expect(filterServices(SEED, "All", "draft ").map((s) => s.id)).toEqual(["service-3"]);
    expect(filterServices(SEED, "All", " AUDIT ").map((s) => s.id)).toEqual(["service-2"]);
    expect(filterServices(SEED, "All", "draft").map((s) => s.id)).toEqual(["service-3"]);
  });

  it("combines the state filter with the query", () => {
    expect(filterServices(SEED, "Available", "").map((s) => s.id)).toEqual(["service-1", "service-2"]);
    expect(filterServices(SEED, "Paused", "")).toEqual([]);
    expect(filterServices(SEED, "Draft", "next")).toEqual([]);
  });
});

describe("ledger edits", () => {
  it("adds a trimmed line on top and ignores a blank name", () => {
    const next = addService(SEED, { title: "  Copy review ", body: " Tone pass ", status: "Paused" }, "n1", 9);
    expect(next[0]).toEqual({ id: "n1", title: "Copy review", body: "Tone pass", status: "Paused", createdAt: 9 });
    expect(addService(SEED, { title: " ", body: "x", status: "Draft" }, "n2", 9)).toBe(SEED);
  });

  it("counts available lines and removes one by id", () => {
    expect(countAvailable(SEED)).toBe(2);
    expect(removeService(SEED, "service-1").map((s) => s.id)).toEqual(["service-2", "service-3"]);
    expect(countAvailable(removeService(SEED, "service-1"))).toBe(1);
  });
});
