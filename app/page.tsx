"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppFoot, AppTop, ListButton, Pill, PlusIcon, type Tone } from "@/components/app-shell";
import { EMPTY_DRAFT, SEED, STATUSES, STORAGE_KEY, addService as addLine, filterServices, parseServices, removeService, type Service, type ServiceDraft, type ServiceStatus, type StatusFilter } from "@/lib/services";
import { useStoredState } from "@/lib/use-stored-state";

const TONE: Record<ServiceStatus, Tone> = { Available: "green", Draft: "amber", Paused: "grey" };

export default function Home() {
  const [services, setServices] = useStoredState(STORAGE_KEY, SEED, parseServices);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_DRAFT);
  const [removed, setRemoved] = useState<{ item: Service; index: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const visible = useMemo(() => filterServices(services, filter, query), [filter, query, services]);
  const countOf = (status: StatusFilter) => (status === "All" ? services.length : services.filter((item) => item.status === status).length);

  useEffect(() => { if (composing) nameRef.current?.focus(); }, [composing]);
  // The undo offer disappears after a few seconds, like a system toast.
  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 6000);
    return () => window.clearTimeout(timer);
  }, [removed]);

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setServices((current) => addLine(current, draft, crypto.randomUUID(), Date.now()));
    setAnnouncement(`Added ${draft.title.trim()}.`);
    setDraft(EMPTY_DRAFT);
    setComposing(false);
  }
  function remove(item: Service) {
    setServices((current) => removeService(current, item.id));
    setRemoved({ item, index: services.findIndex((entry) => entry.id === item.id) });
    setAnnouncement(`Removed ${item.title}. Undo is available for a few seconds.`);
  }
  function undo() {
    if (!removed) return;
    const { item, index } = removed;
    setServices((current) => [...current.slice(0, index), item, ...current.slice(index)]);
    setRemoved(null);
    setAnnouncement(`Restored ${item.title}.`);
  }

  const title = filter === "All" ? "All services" : filter;
  const lists: { value: StatusFilter; tone?: Tone }[] = [{ value: "All" }, ...STATUSES.map((status) => ({ value: status, tone: TONE[status] }))];

  return (
    <div className="as">
      <a className="as-skip" href="#main">Skip to content</a>
      <AppTop name="Services" tagline="A small catalog of what you offer" />

      <div className="as-body">
        <aside className="as-side" aria-label="Lists">
          <h2>Lists</h2>
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
              <p>{visible.length} {visible.length === 1 ? "service" : "services"}{query.trim() ? ` matching “${query.trim()}”` : ""}</p>
            </div>
            <div className="as-tools">
              <label className="as-search">
                <span className="as-sr">Search services</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
              </label>
              {composing ? null : <button type="button" className="as-button" onClick={() => setComposing(true)}><PlusIcon />New service</button>}
            </div>
          </div>

          {composing ? (
            <form className="as-composer" onSubmit={add} aria-label="New service">
              <label className="as-field">Name
                <input ref={nameRef} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Interface direction" autoComplete="off" />
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
                  <button type="submit" className="as-button" disabled={!draft.title.trim()}>Add</button>
                </div>
              </div>
            </form>
          ) : null}

          {visible.length ? (
            <ul className="as-list" aria-label={title}>
              {visible.map((service) => (
                <li className="as-row" key={service.id}>
                  <div>
                    <h3>{service.title}</h3>
                    {service.body ? <p>{service.body}</p> : null}
                  </div>
                  <Pill tone={TONE[service.status]}>{service.status}</Pill>
                  <button type="button" className="as-plain as-danger" onClick={() => remove(service)} aria-label={`Remove ${service.title}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="as-list as-empty">
              {services.length === 0 ? (
                <><strong>No services yet</strong>Press New service to add the first one.</>
              ) : (
                <><strong>Nothing here</strong>No service in this list matches your search.</>
              )}
            </div>
          )}

          <p className="as-note">Stored in this browser only. No checkout, account, or remote catalog.</p>
        </main>
      </div>

      <p className="as-sr" role="status" aria-live="polite">{announcement}</p>
      {removed ? (
        <div className="as-toast" role="group" aria-label="Undo remove">
          <span>Removed “{removed.item.title}”</span>
          <button type="button" className="as-plain" onClick={undo}>Undo</button>
        </div>
      ) : null}

      <AppFoot source="https://github.com/bookchaowalit-website/marketing-services-web" />
    </div>
  );
}
