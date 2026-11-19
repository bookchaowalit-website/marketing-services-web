// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { resetStoredCache } from "@/lib/use-stored-state";

// Mounted tests for the App shell page: composer, filters, search, remove, undo and focus.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;

const $ = <T extends Element = HTMLElement>(selector: string) => host.querySelector(selector) as T | null;
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.trim().includes(text)) as HTMLButtonElement;
const rows = () => [...host.querySelectorAll(".as-row h2")].map((h) => h.textContent);
const press = (el: Element, detail = 0) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true, detail })); });
function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStoredCache();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Home />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe("composer", () => {
  it("opens focused on Name, keeps Add disabled until there is a name, adds on top and returns focus", () => {
    press(button("New service"));
    const name = $<HTMLInputElement>(".as-composer input")!;
    expect(document.activeElement).toBe(name);
    expect(button("Add").disabled).toBe(true);

    type(name, "Brand sprint");
    type($<HTMLTextAreaElement>(".as-composer textarea")!, "Two weeks");
    press([...host.querySelectorAll(".as-composer .as-segmented button")].find((b) => b.textContent === "Paused")!);
    press(button("Add"));

    expect($(".as-composer")).toBeNull();
    expect(rows()[0]).toBe("Brand sprint");
    expect(host.textContent).toContain("Two weeks");
    expect(document.activeElement?.textContent).toContain("New service");
    expect(JSON.parse(localStorage.getItem("services-ledger-v2")!)[0].status).toBe("Paused");
  });

  it("Cancel closes without adding and returns focus to New service", () => {
    press(button("New service"));
    type($<HTMLInputElement>(".as-composer input")!, "Never mind");
    press(button("Cancel"));
    expect($(".as-composer")).toBeNull();
    expect(rows()).not.toContain("Never mind");
    expect(document.activeElement?.textContent).toContain("New service");
  });
});

describe("lists and search", () => {
  // BOO-387: the search field had only a screen-reader label.
  it("gives the search field a visible label that names it", () => {
    const label = $(".as-search")!;
    const text = $(".as-search-label")!;
    expect(text.textContent).toBe("Search services");
    expect(text.classList.contains("as-sr")).toBe(false);
    expect(label.tagName).toBe("LABEL");
    expect(label.contains($(".as-search input"))).toBe(true);
  });

  it("filters by list and shows a no-match state for a search with no results", () => {
    press(button("Draft"));
    expect(rows()).toEqual(["Data workflow prototype"]);
    expect($("h1")!.textContent).toBe("Draft");

    press(button("All services"));
    type($<HTMLInputElement>(".as-search input")!, "nothing like this");
    expect(rows()).toEqual([]);
    expect(host.textContent).toContain("Nothing here");
    expect(host.textContent).toContain("0 services matching “nothing like this”");
  });

  it("says nothing is saved yet once every service is removed", () => {
    for (const title of ["Full-stack build", "Product interface audit", "Data workflow prototype"]) {
      press($(`[aria-label="Remove ${title}"]`)!, 1);
    }
    expect(host.textContent).toContain("No services yet");
  });
});

describe("remove and undo", () => {
  it("a keyboard removal puts focus on Undo; Undo restores the row in place and focus goes to New service", () => {
    press($('[aria-label="Remove Product interface audit"]')!, 0);
    expect(rows()).toEqual(["Full-stack build", "Data workflow prototype"]);
    expect(document.activeElement?.textContent).toBe("Undo");

    press(button("Undo"));
    expect(rows()).toEqual(["Full-stack build", "Product interface audit", "Data workflow prototype"]);
    expect($(".as-toast")).toBeNull();
    expect(document.activeElement?.textContent).toContain("New service");
  });

  it("Escape dismisses the toast without restoring", () => {
    press($('[aria-label="Remove Full-stack build"]')!, 0);
    act(() => { $(".as-toast")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
    expect($(".as-toast")).toBeNull();
    expect(rows()).not.toContain("Full-stack build");
  });

  it("a mouse removal leaves focus alone and the toast goes away after six seconds", () => {
    vi.useFakeTimers();
    press($('[aria-label="Remove Full-stack build"]')!, 1);
    expect(document.activeElement?.textContent).not.toBe("Undo");
    expect($(".as-toast")).not.toBeNull();
    act(() => { vi.advanceTimersByTime(6000); });
    expect($(".as-toast")).toBeNull();
  });
});

describe("review fixes", () => {
  it("Undo returns focus to the open composer when New service is hidden", () => {
    press($('[aria-label="Remove Full-stack build"]')!, 0);
    press(button("New service"));
    press(button("Undo"));
    expect(document.activeElement).toBe($(".as-composer input"));
  });

  // 2026-11-18 review round 2.
  it("an empty list without a search says what is missing; the single New service starts in that state", () => {
    press(button("Paused"));
    expect(host.textContent).toContain("No paused services");
    expect(host.textContent).not.toContain("matches your search");
    // One New service button only (Codex 2026-11-19), and it follows the list on screen.
    expect([...host.querySelectorAll("button")].filter((b) => b.textContent?.includes("New service"))).toHaveLength(1);
    press(button("New service"));
    expect(document.activeElement).toBe($(".as-composer input"));
    const paused = [...host.querySelectorAll(".as-composer .as-segmented button")].find((b) => b.textContent === "Paused")!;
    expect(paused.getAttribute("aria-pressed")).toBe("true");
  });

  it("tells why Add is disabled and links the hint to the Name field", () => {
    press(button("New service"));
    const name = $<HTMLInputElement>(".as-composer input")!;
    expect(name.getAttribute("aria-describedby")).toBe("name-hint");
    expect($("#name-hint")!.textContent).toBe("Name is required to add a service.");
    // Outside the label: the field is named "Name" and only described by the hint.
    expect(name.closest("label")!.textContent).toBe("Name");
    type(name, "Audit");
    expect($("#name-hint")!.textContent).toBe("Ready to add.");
  });

  it("a mouse resting on the toast keeps Undo open; leaving restarts the countdown", () => {
    vi.useFakeTimers();
    press($('[aria-label="Remove Full-stack build"]')!, 1);
    const toast = $(".as-toast")!;
    act(() => { toast.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect($(".as-toast")).not.toBeNull();
    act(() => { toast.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body })); });
    act(() => { vi.advanceTimersByTime(6000); });
    expect($(".as-toast")).toBeNull();
  });

  it("keeps the heading outline in order: one h1, then h2 row titles, no h3", () => {
    const levels = [...host.querySelectorAll("h1, h2, h3")].map((h) => h.tagName);
    expect(levels[0]).toBe("H1");
    expect(levels.filter((l) => l === "H1")).toHaveLength(1);
    expect(levels).not.toContain("H3");
  });

  it("New service in All starts as Available", () => {
    press(button("New service"));
    const available = [...host.querySelectorAll(".as-composer .as-segmented button")].find((b) => b.textContent === "Available")!;
    expect(available.getAttribute("aria-pressed")).toBe("true");
  });

  it("removing the last service under a leftover search says the catalog is empty, not 'no match'", () => {
    type($<HTMLInputElement>(".as-search input")!, "Full-stack");
    press($('[aria-label="Remove Full-stack build"]')!, 1);
    type($<HTMLInputElement>(".as-search input")!, "");
    for (const title of ["Product interface audit", "Data workflow prototype"]) press($(`[aria-label="Remove ${title}"]`)!, 1);
    type($<HTMLInputElement>(".as-search input")!, "anything");
    expect(host.textContent).toContain("No services yet");
    expect(host.textContent).not.toContain("matches your search");
  });
});
