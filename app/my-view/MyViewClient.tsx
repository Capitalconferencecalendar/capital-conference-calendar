"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ControlPanel from "../components/platform/ControlPanel";
import type { DiscoveryEvent } from "../../lib/discoveryDataset";
import { useEventSchedule } from "../../lib/supabase/useEventSchedule";
import { useMyLists } from "../../lib/supabase/useMyLists";
import { useSavedViews } from "../../lib/supabase/useSavedViews";
import styles from "./MyViewClient.module.css";

type EventPage = { events: DiscoveryEvent[]; nextCursor: string | null };
type DetailStatus = "idle" | "loading" | "ready" | "error";

function dateLabel(value: string) {
  if (!value) return "Date not listed";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function savedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Section({ id, title, count, open, onToggle, children }: { id: string; title: string; count: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section}>
      <button className={styles.sectionHead} type="button" onClick={onToggle} aria-expanded={open} aria-controls={`${id}-content`}>
        <span className={styles.sectionName}>{title}</span>
        <span className={styles.sectionCount}>{count} {open ? "▾" : "▸"}</span>
      </button>
      {open ? <div id={`${id}-content`} className={styles.sectionBody}>{children}</div> : null}
    </section>
  );
}

export default function MyViewClient() {
  const { eventIds, status: scheduleStatus, error: scheduleError, refreshSchedule } = useEventSchedule();
  const { lists, status: listsStatus, error: listsError, refreshLists } = useMyLists();
  const { views, status: viewsStatus, error: viewsError, refreshSavedViews } = useSavedViews();
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [listsOpen, setListsOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [details, setDetails] = useState<Map<string, DiscoveryEvent>>(new Map());
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const [detailError, setDetailError] = useState("");
  const [detailRetry, setDetailRetry] = useState(0);

  useEffect(() => {
    if (scheduleStatus !== "ready" || !eventIds.length) {
      setDetails(new Map());
      setDetailStatus("idle");
      return;
    }
    const controller = new AbortController();
    setDetails(new Map());
    setDetailStatus("loading");
    setDetailError("");

    async function hydrate() {
      try {
        const found = new Map<string, DiscoveryEvent>();
        for (let offset = 0; offset < eventIds.length; offset += 25) {
          const params = new URLSearchParams({ schedule: "1", limit: "30" });
          eventIds.slice(offset, offset + 25).forEach((id) => params.append("eventId", id));
          const response = await fetch(`/api/events?${params}`, { signal: controller.signal, cache: "no-store" });
          if (!response.ok) throw new Error("Could not load scheduled conference details.");
          const page = await response.json() as EventPage;
          page.events.forEach((event) => found.set(event.id, event));
        }
        if (!controller.signal.aborted) {
          setDetails(found);
          setDetailStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) {
          setDetailStatus("error");
          setDetailError("Could not load conference details. Your saved schedule is unchanged.");
        }
      }
    }
    void hydrate();
    return () => controller.abort();
  }, [scheduleStatus, eventIds, detailRetry]);

  const detailRows = useMemo(() => eventIds.map((id) => ({ id, event: details.get(id) })), [eventIds, details]);
  const countLabel = (status: string, count: number, noun: string) => status === "loading" ? "Loading..." : status === "error" ? "Unavailable" : `${count} ${noun}`;
  const signedOut = [scheduleStatus, listsStatus, viewsStatus].includes("anonymous");

  return (
    <div className={styles.layout}>
      <nav className={styles.rail} aria-label="My View sections">
        <h2 className={styles.railTitle}>My View</h2>
        <div className={styles.railLinks}>
          <a className={styles.railLink} href="#my-schedule" onClick={() => setScheduleOpen(true)}>My Schedule</a>
          <a className={styles.railLink} href="#my-lists" onClick={() => setListsOpen(true)}>My Saved Lists</a>
          <a className={styles.railLink} href="#my-market-views" onClick={() => setViewsOpen(true)}>My Market Views</a>
          <Link className={styles.railLink} href="/discovery">Discovery</Link>
          <Link className={styles.railLink} href="/market-view">Market View</Link>
        </div>
      </nav>

      <div className={styles.workspace}>
        <header>
          <div className={styles.eyebrow}>Personal workspace</div>
          <h1 className={styles.heading}>My View</h1>
          <p className={styles.intro}>Your scheduled conferences, lists, and saved market views.</p>
        </header>
        {signedOut ? <div className={styles.state}>Your session has ended. <Link href="/account/sign-in?next=%2Fmy-view">Sign in</Link> to reopen My View.</div> : null}

        <Section id="my-schedule" title="My Schedule" count={countLabel(scheduleStatus, eventIds.length, "events")} open={scheduleOpen} onToggle={() => setScheduleOpen((value) => !value)}>
          {scheduleStatus === "loading" ? <div className={styles.state}>Loading your schedule...</div> :
            scheduleStatus === "error" ? <div className={styles.state}>{scheduleError}<button className={styles.retry} type="button" onClick={() => void refreshSchedule()}>Retry</button></div> :
            scheduleStatus === "ready" && !eventIds.length ? <div className={styles.state}>No scheduled conferences yet. <Link href="/discovery">Explore Discovery</Link> to add one.</div> :
            scheduleStatus === "ready" && detailStatus === "loading" ? <div className={styles.state}>Loading conference details...</div> :
            scheduleStatus === "ready" && detailStatus === "error" ? <div className={styles.state}>{detailError}<button className={styles.retry} type="button" onClick={() => setDetailRetry((value) => value + 1)}>Retry</button></div> :
            scheduleStatus === "ready" ? detailRows.map(({ id, event }) => (
              <div className={styles.row} key={id}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{event?.title || "Conference details unavailable"}</div>
                  <div className={styles.rowMeta}>{event ? [dateLabel(event.startDate), [event.city, event.state || event.country].filter(Boolean).join(", "), event.organizer].filter(Boolean).join(" · ") : "This saved event is not in the current approved event index. It remains in your schedule."}</div>
                </div>
                {event ? <Link className={styles.rowAction} href={`/discovery?schedule=1&eventId=${encodeURIComponent(id)}`}>Open event</Link> : null}
              </div>
            )) : null}
        </Section>

        <Section id="my-lists" title="My Saved Lists" count={countLabel(listsStatus, lists.length, "lists")} open={listsOpen} onToggle={() => setListsOpen((value) => !value)}>
          {listsStatus === "loading" ? <div className={styles.state}>Loading your lists...</div> :
            listsStatus === "error" ? <div className={styles.state}>{listsError}<button className={styles.retry} type="button" onClick={() => void refreshLists()}>Retry</button></div> :
            listsStatus === "ready" && !lists.length ? <div className={styles.state}>No saved lists yet. <Link href="/discovery">Select events in Discovery</Link> to create one.</div> :
            listsStatus === "ready" ? lists.map((list) => <div className={styles.row} key={list.id}>
              <div className={styles.rowMain}><div className={styles.rowTitle}>{list.name}</div><div className={styles.rowMeta}>{list.eventIds.length} events{list.createdAt ? ` · Created ${savedDate(list.createdAt)}` : ""}</div></div>
              <Link className={styles.rowAction} href={`/discovery?savedList=${encodeURIComponent(list.id)}`}>Load list</Link>
            </div>) : null}
        </Section>

        <Section id="my-market-views" title="My Market Views" count={countLabel(viewsStatus, views.length, "views")} open={viewsOpen} onToggle={() => setViewsOpen((value) => !value)}>
          {viewsStatus === "loading" ? <div className={styles.state}>Loading saved views...</div> :
            viewsStatus === "error" ? <div className={styles.state}>{viewsError}<button className={styles.retry} type="button" onClick={() => void refreshSavedViews()}>Retry</button></div> :
            viewsStatus === "ready" && !views.length ? <div className={styles.state}>No saved views yet. <Link href="/market-view">Open Market View</Link> to save one.</div> :
            viewsStatus === "ready" ? views.map((view) => <div className={styles.row} key={view.id}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{view.name}</div>
                <div className={styles.rowMeta}>{view.source === "market-view" ? "Market View" : "Discovery"}{view.eventCount !== null ? ` · ${view.eventCount} events when saved` : ""}{view.createdAt ? ` · Saved ${savedDate(view.createdAt)}` : ""}</div>
              </div>
              <Link className={styles.rowAction} href={`/${view.source}?savedView=${encodeURIComponent(view.id)}`}>Load view</Link>
            </div>) : null}
        </Section>
      </div>

      <div className={styles.control}>
        <ControlPanel
          description="Your saved conference workspace."
          syncDescription=""
          selectedCount={0}
          quickActions={[]}
          showCalendarSync={false}
          showQuickActions={false}
          panelHeight="auto"
          savedSections={[
            { title: "My Event Schedule", icon: "lists", count: eventIds.length, countLabel: countLabel(scheduleStatus, eventIds.length, "events"), isOpen: true, children: <div className={styles.state} style={{ padding: "0 14px 12px" }}><a href="#my-schedule" onClick={() => setScheduleOpen(true)}>Open schedule</a></div> },
            { title: "My Lists", icon: "lists", count: lists.length, countLabel: countLabel(listsStatus, lists.length, "saved"), isOpen: true, children: <div className={styles.state} style={{ padding: "0 14px 12px" }}><a href="#my-lists" onClick={() => setListsOpen(true)}>Open lists</a></div> },
            { title: "Saved Views", icon: "views", count: views.length, countLabel: countLabel(viewsStatus, views.length, "saved"), isOpen: true, children: <div className={styles.state} style={{ padding: "0 14px 12px" }}><a href="#my-market-views" onClick={() => setViewsOpen(true)}>Open views</a></div> },
          ]}
          utilityLinks={[{ href: "/discovery", label: "Discovery" }, { href: "/market-view", label: "Market View" }]}
        />
      </div>
    </div>
  );
}
