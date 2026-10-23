// Service ledger data and pure logic, shared by the page and the MCP route.

export type ServiceStatus = "Available" | "Draft" | "Paused";
export type Service = { id: string; title: string; body: string; status: ServiceStatus; createdAt: number };
export type ServiceDraft = Pick<Service, "title" | "body" | "status">;
export type StatusFilter = ServiceStatus | "All";

export const STORAGE_KEY = "services-ledger-v2";
export const STATUSES: ServiceStatus[] = ["Available", "Draft", "Paused"];
export const EMPTY_DRAFT: ServiceDraft = { title: "", body: "", status: "Available" };

// Authored sample lines for the portfolio demo (not a price list or booking catalog).
export const SEED: Service[] = [
  { id: "service-1", title: "Full-stack build", body: "Next.js + API", status: "Available", createdAt: 1 },
  { id: "service-2", title: "Product interface audit", body: "Flows, hierarchy, and responsive behavior", status: "Available", createdAt: 2 },
  { id: "service-3", title: "Data workflow prototype", body: "A small local-first operating surface", status: "Draft", createdAt: 3 },
];

export function isStatus(value: unknown): value is ServiceStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

function isService(value: unknown): value is Service {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    isStatus(item.status) &&
    typeof item.createdAt === "number"
  );
}

/** Parse the stored ledger. Returns null (use the sample) for missing, corrupt or non-array data. */
export function parseServices(raw: string | null): Service[] | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  return Array.isArray(value) ? value.filter(isService) : null;
}

export function filterServices(items: Service[], filter: StatusFilter, query: string): Service[] {
  const needle = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      (filter === "All" || item.status === filter) &&
      `${item.title} ${item.body} ${item.status}`.toLowerCase().includes(needle),
  );
}

export function countAvailable(items: Service[]): number {
  return items.filter((item) => item.status === "Available").length;
}

/** New lines go on top. A blank name adds nothing (returns the same list). */
export function addService(items: Service[], draft: ServiceDraft, id: string, now: number): Service[] {
  const title = draft.title.trim();
  if (!title) return items;
  return [{ id, title, body: draft.body.trim(), status: draft.status, createdAt: now }, ...items];
}

export function removeService(items: Service[], id: string): Service[] {
  return items.filter((item) => item.id !== id);
}
