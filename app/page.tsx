"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppFoot, AppTop, ListButton, Pill, PlusIcon, type Tone } from "@/components/app-shell";
import { EMPTY_DRAFT, SEED, STATUSES, STORAGE_KEY, addService as addLine, filterServices, parseServices, removeService, restoreService, type Service, type ServiceDraft, type ServiceStatus, type StatusFilter } from "@/lib/services";
import { useStoredState } from "@/lib/use-stored-state";

const TONE: Record<ServiceStatus, Tone> = { Available: "green", Draft: "amber", Paused: "grey" };

export default function Home() {
  const [services, setServices] = useStoredState(STORAGE_KEY, SEED, parseServices);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_DRAFT);
  // Undo remembers the item that followed the removed one, not an index, so rows added in the
  // meantime do not shift where it comes back.
  const [removed, setRemoved] = useState<{ item: Service; beforeId: string | null; viaKeyboard: boolean } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);
  const wasComposing = useRef(false);
  const undoRef = useRef<HTMLButtonElement>(null);
  const [toastFocused, setToastFocused] = useState(false);
  // A mouse resting on the toast pauses the countdown too (WCAG 2.2.1), not only keyboard focus.
  const [toastHovered, setToastHovered] = useState(false);
  const visible = useMemo(() => filterServices(services, filter, query), [filter, query, services]);
  const countOf = (status: StatusFilter) => (status === "All" ? services.length : services.filter((item) => item.status === status).length);

  // Opening the composer focuses its first field; closing it (Add or Cancel) returns focus to
  // the New service button, which is rendered again, so keyboard users do not lose their place.
  useEffect(() => {
    if (composing) nameRef.current?.focus();
    else if (wasComposing.current) newRef.current?.focus();
    wasComposing.current = composing;
  }, [composing]);
  // The undo offer disappears after a few seconds, like a system toast, but never while the
  // keyboard focus is on it. Removing with the keyboard moves focus to Undo so it is one key away
  // (the Remove button that had focus is gone); a mouse removal leaves focus alone.
  useEffect(() => {
    if (removed?.viaKeyboard) undoRef.current?.focus();
  }, [removed]);
  useEffect(() => {
    if (!removed || toastFocused || toastHovered) return;
    const timer = window.setTimeout(() => setRemoved(null), 6000);
    return () => window.clearTimeout(timer);
  }, [removed, toastFocused, toastHovered]);
  function closeToast() {
    setRemoved(null);
    setToastFocused(false);
    setToastHovered(false);
    // New service is not rendered while the composer is open; then go back to the composer.
    (newRef.current ?? nameRef.current)?.focus();
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setServices((current) => addLine(current, draft, crypto.randomUUID(), Date.now()));
    setAnnouncement(`Added ${draft.title.trim()}.`);
    setDraft(EMPTY_DRAFT);
    setComposing(false);
  }
  function remove(item: Service, viaKeyboard: boolean) {
    setServices((current) => removeService(current, item.id));
    const index = services.findIndex((entry) => entry.id === item.id);
    setRemoved({ item, beforeId: services[index + 1]?.id ?? null, viaKeyboard });
    setAnnouncement(`Removed ${item.title}. Undo is available for a few seconds.`);
  }
  function undo() {
    if (!removed) return;
    const { item, beforeId } = removed;
    setServices((current) => restoreService(current, item, beforeId));
    closeToast();
    setAnnouncement(`Restored ${item.title}.`);
  }

  function compose(status?: ServiceStatus) {
    setDraft(status ? { ...EMPTY_DRAFT, status } : EMPTY_DRAFT);
    setComposing(true);
  }

  const title = filter === "All" ? "All services" : filter;
  const nameMissing = !draft.title.trim();
  const lists: { value: StatusFilter; tone?: Tone }[] = [{ value: "All" }, ...STATUSES.map((status) => ({ value: status, tone: TONE[status] }))];

  return (
    <div className="as">
      <a className="as-skip" href="#main">Skip to content</a>
      <AppTop name="Services" tagline="A small catalog of what you offer" />

      <div className="as-body">
        <aside className="as-side" aria-label="Lists">
          <p className="as-side-title" aria-hidden="true">Lists</p>
          <ul className="as-lists">
            {lists.map(({ value, tone }) => (
              <ListButton key={value} label={value === "All" ? "All services" : value} count={countOf(value)} tone={tone} current={filter === value} onSelect={() => setFilter(value)} />
            ))}
          </ul>
        </aside>

        <main id="main" className="as-main">
          <div className="as-head">
            <div>
              <h1>{title}</h1>
              <p className="as-intro">A demo catalog: add, edit and remove services freely, they stay in this browser. Want this kind of work done? Start at <a href="https://bookchaowalit.com/">bookchaowalit.com</a>.</p>
              <p aria-live="polite">{visible.length} {visible.length === 1 ? "service" : "services"}{query.trim() ? ` matching “${query.trim()}”` : ""}</p>
            </div>
            <div className="as-tools">
              <label className="as-search">
                <span className="as-search-label">Search services</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or details" />
              </label>
              {composing ? null : <button ref={newRef} type="button" className="as-button" onClick={() => compose()}><PlusIcon />New service</button>}
            </div>
          </div>

          {composing ? (
            <form className="as-composer" onSubmit={add} aria-label="New service">
              <label className="as-field">Name
                <input ref={nameRef} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Interface direction" autoComplete="off" aria-describedby="name-hint" />
                <span id="name-hint" className="as-hint">{nameMissing ? "Name is required to add a service." : "Ready to add."}</span>
              </label>
              <label className="as-field">Details
                <textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="What does this help someone do?" />
              </label>
              <div className="as-composer-foot">
                <div className="as-segmented-wrap">
                  <span id="state-label">State</span>
                  <div className="as-segmented" role="group" aria-labelledby="state-label">
                    {STATUSES.map((status) => (
                      <button key={status} type="button" aria-pressed={draft.status === status} onClick={() => setDraft({ ...draft, status })}>{status}</button>
                    ))}
                  </div>
                </div>
                <div className="as-composer-actions">
                  <button type="button" className="as-plain" onClick={() => { setComposing(false); setDraft(EMPTY_DRAFT); }}>Cancel</button>
                  <button type="submit" className="as-button" disabled={nameMissing}>Add</button>
                </div>
              </div>
            </form>
          ) : null}

          {visible.length ? (
            <ul className="as-list" aria-label={title}>
              {visible.map((service) => (
                <li className="as-row" key={service.id}>
                  <div>
                    <h2>{service.title}</h2>
                    {service.body ? <p>{service.body}</p> : null}
                  </div>
                  <Pill tone={TONE[service.status]}>{service.status}</Pill>
                  <button type="button" className="as-plain as-danger" onClick={(event) => remove(service, event.detail === 0)} aria-label={`Remove ${service.title}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="as-list as-empty">
              {query.trim() ? (
                <><strong>Nothing here</strong>No service in this list matches your search.</>
              ) : (
                <>
                  <strong>{services.length === 0 ? "No services yet" : `No ${filter.toLowerCase()} services`}</strong>
                  {services.length === 0 ? "Add the first one." : `Add one with the ${filter} state.`}
                  {composing ? null : (
                    <button type="button" className="as-button as-empty-action" onClick={() => compose(filter === "All" ? undefined : filter)}><PlusIcon />New service</button>
                  )}
                </>
              )}
            </div>
          )}

          <p className="as-note">Stored in this browser only. No checkout, account, or remote catalog.</p>
        </main>
      </div>

      <p className="as-sr" role="status" aria-live="polite">{announcement}</p>
      {removed ? (
        <div
          className="as-toast"
          role="group"
          aria-label="Undo remove"
          onFocus={() => setToastFocused(true)}
          onMouseEnter={() => setToastHovered(true)}
          onMouseLeave={() => setToastHovered(false)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setToastFocused(false); }}
          onKeyDown={(event) => { if (event.key === "Escape") closeToast(); }}
        >
          <span>Removed “{removed.item.title}”</span>
          <button ref={undoRef} type="button" className="as-plain" onClick={undo}>Undo</button>
        </div>
      ) : null}

      <AppFoot source="https://github.com/bookchaowalit-website/marketing-services-web" />
    </div>
  );
}
