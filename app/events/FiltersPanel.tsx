"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  q: string;
  from: string;
  to: string;
  view: "list" | "calendar" | "map";
  monthOffset: number;
  signal: "" | "hotweek" | "cluster";
  categories: string[];
  marketFocusOptions: string[];
  issuerParticipationOptions: string[];
  sectorThemeOptions: string[];
  organizerOptions: string[];
  stateOptions: string[];
  regionOptions: string[];
  countryOptions: string[];
  categoriesSelected: string[];
  marketFocusSelected: string[];
  issuerParticipationSelected: string[];
  sectorThemeSelected: string[];
  organizerSelected: string[];
  stateSelected: string[];
  regionSelected: string[];
  countrySelected: string[];
};

type MultiFieldProps = {
  label: string;
  options: string[];
  selected: string[];
  onApply: (values: string[]) => void;
};

function MultiSelectField({ label, options, selected, onApply }: MultiFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);

  const selectedLabel =
    selected.length === 0
      ? `All ${label}`
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 800,
          color: "#93c5fd",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: "100%",
          borderRadius: "10px",
          border: "1px solid rgba(96,165,250,0.32)",
          backgroundColor: "rgba(8,30,53,0.96)",
          fontSize: "13px",
          color: "#e2e8f0",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setDraft(selected);
            setOpen((value) => !value);
          }}
          style={{
            width: "100%",
            height: "44px",
            padding: "0 12px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            color: "#e2e8f0",
            fontWeight: 650,
          }}
        >
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedLabel}
          </span>
          <span style={{ fontSize: "11px", color: "#93c5fd" }}>{open ? "▲" : "▼"}</span>
        </button>
        {open ? (
          <div
            style={{
              borderTop: "1px solid rgba(147,197,253,0.2)",
              padding: "8px 10px",
              maxHeight: "200px",
              overflowY: "auto",
              display: "grid",
              gap: "6px",
            }}
          >
            {options.map((item) => {
              const checked = draft.includes(item);
              return (
                <label
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    lineHeight: 1.3,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setDraft((prev) => (prev.includes(item) ? prev : [...prev, item]));
                      } else {
                        setDraft((prev) => prev.filter((value) => value !== item));
                      }
                    }}
                  />
                  <span>{item}</span>
                </label>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setDraft([])}
                style={{
                  height: "28px",
                  borderRadius: "7px",
                  border: "1px solid rgba(96,165,250,0.32)",
                  backgroundColor: "rgba(8,30,53,0.96)",
                  padding: "0 10px",
                  fontSize: "12px",
                  color: "#cbd5e1",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft);
                  setOpen(false);
                }}
                style={{
                  height: "28px",
                  borderRadius: "7px",
                  border: "1px solid #2563eb",
                  backgroundColor: "#2563eb",
                  padding: "0 10px",
                  fontSize: "12px",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function FiltersPanel(props: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(props.q);
  const [from, setFrom] = useState(props.from);
  const [to, setTo] = useState(props.to);
  const [category, setCategory] = useState(props.categoriesSelected);
  const [issuerParticipation, setIssuerParticipation] = useState(
    props.issuerParticipationSelected
  );
  const [sectorTheme, setSectorTheme] = useState(props.sectorThemeSelected);
  const [marketFocus, setMarketFocus] = useState(props.marketFocusSelected);
  const [organizer, setOrganizer] = useState(props.organizerSelected);
  const [country, setCountry] = useState(props.countrySelected);
  const [state, setState] = useState(props.stateSelected);
  const [region, setRegion] = useState(props.regionSelected);

  const submitSearch = (next?: {
    q?: string;
    from?: string;
    to?: string;
    category?: string[];
    issuerParticipation?: string[];
    sectorTheme?: string[];
    marketFocus?: string[];
    organizer?: string[];
    country?: string[];
    state?: string[];
    region?: string[];
    signal?: "" | "hotweek" | "cluster";
  }) => {
    const qValue = next?.q ?? query;
    const categoryValue = next?.category ?? category;
    const issuerParticipationValue = next?.issuerParticipation ?? issuerParticipation;
    const sectorThemeValue = next?.sectorTheme ?? sectorTheme;
    const marketFocusValue = next?.marketFocus ?? marketFocus;
    const organizerValue = next?.organizer ?? organizer;
    const countryValue = next?.country ?? country;
    const stateValue = next?.state ?? state;
    const regionValue = next?.region ?? region;
    const fromValue = next?.from ?? from;
    const toValue = next?.to ?? to;
    const signalValue = next?.signal ?? props.signal;

    const params = new URLSearchParams();
    if (qValue) params.set("q", qValue);
    categoryValue.forEach((value) => params.append("category", value));
    issuerParticipationValue.forEach((value) => params.append("issuerParticipation", value));
    sectorThemeValue.forEach((value) => params.append("sectorTheme", value));
    marketFocusValue.forEach((value) => params.append("marketFocus", value));
    organizerValue.forEach((value) => params.append("organizer", value));
    countryValue.forEach((value) => params.append("country", value));
    stateValue.forEach((value) => params.append("state", value));
    regionValue.forEach((value) => params.append("region", value));
    if (fromValue) params.set("from", fromValue);
    if (toValue) params.set("to", toValue);
    if (signalValue) params.set("signal", signalValue);
    if (props.view) params.set("view", props.view);
    if (props.monthOffset) params.set("month", String(props.monthOffset));

    const queryString = params.toString();
    router.push(queryString ? `/events?${queryString}#results-panel` : "/events#results-panel", {
      scroll: false,
    });
  };

  const reset = () => {
    setQuery("");
    setFrom("");
    setTo("");
    setCategory([]);
    setIssuerParticipation([]);
    setSectorTheme([]);
    setMarketFocus([]);
    setOrganizer([]);
    setCountry([]);
    setState([]);
    setRegion([]);

    const params = new URLSearchParams();
    if (props.view) params.set("view", props.view);
    if (props.monthOffset) params.set("month", String(props.monthOffset));
    const nextQuery = params.toString();
    router.push(
      nextQuery ? `/events?${nextQuery}#filters-panel` : "/events#filters-panel",
      { scroll: false }
    );
  };

  const selectionChips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (query) {
    selectionChips.push({
      key: `q:${query}`,
      label: `Search: ${query}`,
      onRemove: () => {
        setQuery("");
        submitSearch({ q: "" });
      },
    });
  }
  category.forEach((value) => {
    selectionChips.push({
      key: `category:${value}`,
      label: `Category: ${value}`,
      onRemove: () => {
        const next = category.filter((item) => item !== value);
        setCategory(next);
        submitSearch({ category: next });
      },
    });
  });
  issuerParticipation.forEach((value) => {
    selectionChips.push({
      key: `issuer:${value}`,
      label: `Issuer Participation: ${value}`,
      onRemove: () => {
        const next = issuerParticipation.filter((item) => item !== value);
        setIssuerParticipation(next);
        submitSearch({ issuerParticipation: next });
      },
    });
  });
  sectorTheme.forEach((value) => {
    selectionChips.push({
      key: `sector:${value}`,
      label: `Sector / Themes: ${value}`,
      onRemove: () => {
        const next = sectorTheme.filter((item) => item !== value);
        setSectorTheme(next);
        submitSearch({ sectorTheme: next });
      },
    });
  });
  marketFocus.forEach((value) => {
    selectionChips.push({
      key: `market:${value}`,
      label: `Market Focus: ${value}`,
      onRemove: () => {
        const next = marketFocus.filter((item) => item !== value);
        setMarketFocus(next);
        submitSearch({ marketFocus: next });
      },
    });
  });
  organizer.forEach((value) => {
    selectionChips.push({
      key: `organizer:${value}`,
      label: `Organizer: ${value}`,
      onRemove: () => {
        const next = organizer.filter((item) => item !== value);
        setOrganizer(next);
        submitSearch({ organizer: next });
      },
    });
  });
  country.forEach((value) => {
    selectionChips.push({
      key: `country:${value}`,
      label: `Country: ${value}`,
      onRemove: () => {
        const next = country.filter((item) => item !== value);
        setCountry(next);
        submitSearch({ country: next });
      },
    });
  });
  state.forEach((value) => {
    selectionChips.push({
      key: `state:${value}`,
      label: `State: ${value}`,
      onRemove: () => {
        const next = state.filter((item) => item !== value);
        setState(next);
        submitSearch({ state: next });
      },
    });
  });
  region.forEach((value) => {
    selectionChips.push({
      key: `region:${value}`,
      label: `Region: ${value}`,
      onRemove: () => {
        const next = region.filter((item) => item !== value);
        setRegion(next);
        submitSearch({ region: next });
      },
    });
  });
  if (from) {
    selectionChips.push({
      key: `from:${from}`,
      label: `From: ${from}`,
      onRemove: () => {
        setFrom("");
        setTo("");
        submitSearch({ from: "", to: "" });
      },
    });
  }
  if (to) {
    selectionChips.push({
      key: `to:${to}`,
      label: `To: ${to}`,
      onRemove: () => {
        setTo("");
        submitSearch({ to: "" });
      },
    });
  }
  if (props.signal === "hotweek" || props.signal === "cluster") {
    selectionChips.push({
      key: `signal:${props.signal}`,
      label: props.signal === "hotweek" ? "Signal: Hot Week" : "Signal: Cluster",
      onRemove: () => {
        submitSearch({ signal: "" });
      },
    });
  }

  return (
    <div
      id="filters-panel"
      style={{
        backgroundColor: "rgba(8,30,53,0.96)",
        border: "1px solid rgba(96,165,250,0.24)",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 12px 30px rgba(2, 8, 20, 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "start",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 7px 0", fontSize: "20px", lineHeight: 1.2, color: "#f8fbff" }}>
            Build Your Market View
          </h1>
          <div style={{ fontSize: "13px", color: "#93c5fd", lineHeight: 1.5 }}>
            Build a filtered conference view, review the matching events, then turn the view into a live calendar.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px", marginBottom: "18px" }}>
        <div className="ccc-filter-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr repeat(4, minmax(0, 1fr))", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#93c5fd", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Date Window
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
              <input
                aria-label="Start date"
                type="date"
                value={from}
                onChange={(event) => {
                  const nextFrom = event.target.value;
                  setFrom(nextFrom);
                  setTo(nextFrom);
                }}
                style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.32)", backgroundColor: "rgba(8,30,53,0.96)", padding: "0 12px", fontSize: "13px", color: "#e2e8f0", boxSizing: "border-box" }}
              />
              <input
                aria-label="End date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.32)", backgroundColor: "rgba(8,30,53,0.96)", padding: "0 12px", fontSize: "13px", color: "#e2e8f0", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <MultiSelectField label="Country" options={props.countryOptions} selected={country} onApply={setCountry} />
          <MultiSelectField label="State" options={props.stateOptions} selected={state} onApply={setState} />
          <MultiSelectField label="Region" options={props.regionOptions} selected={region} onApply={setRegion} />
          <MultiSelectField label="Category" options={props.categories} selected={category} onApply={setCategory} />
        </div>

        <div className="ccc-filter-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "14px" }}>
          <MultiSelectField label="Issuer Participation" options={props.issuerParticipationOptions} selected={issuerParticipation} onApply={setIssuerParticipation} />
          <MultiSelectField label="Sector / Themes" options={props.sectorThemeOptions} selected={sectorTheme} onApply={setSectorTheme} />
          <MultiSelectField label="Market Focus" options={props.marketFocusOptions} selected={marketFocus} onApply={setMarketFocus} />
          <MultiSelectField label="Organizer" options={props.organizerOptions} selected={organizer} onApply={setOrganizer} />
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#93c5fd", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Search within results
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, cities, organizers..."
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.32)", backgroundColor: "rgba(8,30,53,0.96)", padding: "0 12px", fontSize: "13px", color: "#e2e8f0", boxSizing: "border-box" }}
            />
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(147,197,253,0.2)" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#93c5fd", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Current Selections
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {selectionChips.length > 0 ? (
            selectionChips.map((item) => (
              <div
                key={item.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 9px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(15,48,84,0.74)",
                  border: "1px solid rgba(147,197,253,0.25)",
                  fontSize: "12px",
                  color: "#cbd5e1",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={item.onRemove}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "rgba(8,30,53,0.96)",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={`Remove ${item.label}`}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div style={{ fontSize: "13px", color: "#93c5fd" }}>No filters applied.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            height: "44px",
            padding: "0 16px",
            borderRadius: "10px",
            border: "1px solid rgba(96,165,250,0.3)",
            backgroundColor: "rgba(8,30,53,0.96)",
            color: "#e2e8f0",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => submitSearch()}
          style={{
            height: "44px",
            padding: "0 16px",
            borderRadius: "10px",
            border: "1px solid #111827",
            backgroundColor: "#111827",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
