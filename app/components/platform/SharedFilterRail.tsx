"use client";

import type { CSSProperties, ReactNode } from "react";

export type PlatformFiltersState = {
  dateRange: "next30" | "next60" | "next90" | "all";
  country: string[];
  region: string[];
  state: string[];
  cities: string[];
  sectorThemes: string[];
  publicCompanySectors: string[];
  conferenceType: string[];
  issuerParticipation: string[];
  organizer: string[];
  marketFocus: string[];
};

export type PlatformFilterOptions = {
  cities: string[];
  regions: string[];
  countries: string[];
  states: string[];
  themes: string[];
  publicCompanySectors?: string[];
  conferenceTypes: string[];
  issuers: string[];
  organizers: string[];
  marketFocuses: string[];
};

export type PlatformFilterKey = Exclude<keyof PlatformFiltersState, "dateRange">;
export type PlatformFilterSection = "dateTiming" | "location" | "marketSegments" | "participation" | "organizers";
export type QuickFeedIconKind = "investor" | "health" | "private" | "canada" | "next30" | "next60";

export type SharedQuickFeed = {
  key: string;
  title: string;
  color: string;
  icon: QuickFeedIconKind;
  count: number | string;
  onClick: () => void;
};

type Props = {
  filters: PlatformFiltersState;
  filterOptions: PlatformFilterOptions;
  openSections: Record<PlatformFilterSection, boolean>;
  onToggleSection: (section: PlatformFilterSection) => void;
  onDateRangeChange: (value: PlatformFiltersState["dateRange"]) => void;
  onToggleFilter: (key: PlatformFilterKey, value: string) => void;
  onClear: () => void;
  quickFeeds: SharedQuickFeed[];
  dateRangeExtra?: ReactNode;
  filterMatchingControl?: ReactNode;
  isLoading?: boolean;
};

const controlStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  height: "36px",
  borderRadius: "9px",
  background: "#08223d",
  color: "#e2e8f0",
  border: "1px solid rgba(96,165,250,0.28)",
  fontSize: "14px",
  padding: "0 10px",
};

const sections: { key: PlatformFilterSection; label: string; icon: FilterIconKind }[] = [
  { key: "dateTiming", label: "DATE & TIMING", icon: "date" },
  { key: "location", label: "LOCATION", icon: "location" },
  { key: "marketSegments", label: "MARKET SEGMENTS", icon: "segments" },
  { key: "participation", label: "PARTICIPATION", icon: "participation" },
  { key: "organizers", label: "ORGANIZERS", icon: "organizers" },
];

export function FilterDropdown({
  label,
  emptyLabel,
  values,
  options,
  onToggle,
  isLoading = false,
}: {
  label: string;
  emptyLabel: string;
  values: string[];
  options: string[];
  onToggle: (value: string) => void;
  isLoading?: boolean;
}) {
  return (
    <select
      aria-label={label}
      value=""
      onChange={(event) => {
        if (isLoading) return;
        onToggle(event.target.value);
        event.currentTarget.value = "";
      }}
      style={controlStyle}
      disabled={isLoading}
    >
      <option value="">{isLoading ? "Loading options..." : values.length ? `${values.length} ${label.toLowerCase()} selected` : emptyLabel}</option>
      {options.map((option, index) => (
        <option key={`${label}-${option}-${index}`} value={option}>
          {values.includes(option) ? `✓ ${option}` : option}
        </option>
      ))}
    </select>
  );
}

function ClearIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>;
}

type FilterIconKind = "date" | "location" | "segments" | "participation" | "organizers";

function FilterSectionIcon({ kind }: { kind: FilterIconKind }) {
  const common: React.SVGProps<SVGSVGElement> = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "date") return <svg {...common} aria-hidden="true"><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  if (kind === "location") return <svg {...common} aria-hidden="true"><path d="M12 22s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="11" r="2.8" /></svg>;
  if (kind === "segments") return <svg {...common} aria-hidden="true"><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 6v12" /></svg>;
  if (kind === "participation") return <svg {...common} aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="3" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3 3 0 0 1 0 5.74" /></svg>;
  return <svg {...common} aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1.5" /><rect x="14" y="7" width="7" height="14" rx="1.5" /><path d="M6.5 7h.01M6.5 11h.01M6.5 15h.01M17.5 11h.01M17.5 15h.01" /></svg>;
}

function QuickFeedGlyph({ kind, color }: { kind: QuickFeedIconKind; color: string }) {
  const common = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "investor") return <svg {...common} aria-hidden="true"><path d="M3 21h18M5 21V8l7-4 7 4v13M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></svg>;
  if (kind === "health") return <svg {...common} aria-hidden="true"><path d="M12 21s-7-4.2-9-9.1A5.8 5.8 0 0 1 12 5a5.8 5.8 0 0 1 9 6.9c-2 4.9-9 9.1-9 9.1Z" /><path d="M12 8v8M8 12h8" /></svg>;
  if (kind === "private") return <svg {...common} aria-hidden="true"><path d="M3 7h18M5 7l1-3h12l1 3M5 7v12h14V7M9 12h6" /></svg>;
  if (kind === "canada") return <svg {...common} aria-hidden="true"><path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" /><path d="m12 7 1.2 2.4 2.6.3-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.3L12 7Z" /></svg>;
  if (kind === "next60") return <svg {...common} aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18M9 15h6" /></svg>;
  return <svg {...common} aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
}

export default function SharedFilterRail({
  filters,
  filterOptions,
  openSections,
  onToggleSection,
  onDateRangeChange,
  onToggleFilter,
  onClear,
  quickFeeds,
  dateRangeExtra,
  filterMatchingControl,
  isLoading = false,
}: Props) {
  const activeCounts: Record<PlatformFilterSection, number> = {
    dateTiming: 0,
    location: filters.country.length + filters.region.length + filters.state.length + filters.cities.length,
    marketSegments: filters.sectorThemes.length + filters.publicCompanySectors.length + filters.conferenceType.length + filters.marketFocus.length,
    participation: filters.issuerParticipation.length,
    organizers: filters.organizer.length,
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflow: "visible", padding: "10px 0" }}>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontWeight: 900, color: "#dbeafe", fontSize: "20px", lineHeight: 1.05, marginBottom: "6px", textAlign: "center" }}>Refine Your Market View</div>
        <div style={{ color: "#93aeca", fontSize: "12px", lineHeight: 1.35, marginBottom: "8px" }}>Filter conferences by date, location, theme, and participation.</div>
        <button type="button" onClick={onClear} style={{ height: "36px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,220,0.2)", background: "rgba(8,26,46,0.42)", color: "#c9dff7", cursor: "pointer", fontSize: "12px", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9ec2e8" }}><ClearIcon /></span>
          Clear Filters
        </button>
      </div>

      <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
        {sections.map((section, index) => (
          <div key={section.key} style={{ border: `1px solid rgba(96,165,250,${0.36 - index * 0.06})`, borderRadius: "10px", background: `linear-gradient(180deg, rgba(12,34,60,${0.52 - index * 0.06}), rgba(7,24,44,${0.4 - index * 0.05}))`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 ${14 - index * 2}px rgba(59,130,246,${0.2 - index * 0.03})` }}>
            <button type="button" onClick={() => onToggleSection(section.key)} style={{ width: "100%", height: "48px", padding: "0 14px", border: 0, background: "transparent", color: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.07em", display: "inline-flex", alignItems: "center", gap: "9px", color: "#d7e5f5" }}>
                <span style={{ width: "16px", height: "16px", color: "#b6c6da", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><FilterSectionIcon kind={section.icon} /></span>
                {section.label}
              </span>
              <span style={{ fontSize: "14px", color: "#c7dcf6", fontWeight: 800, letterSpacing: "0.01em", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {activeCounts[section.key] ? `${activeCounts[section.key]} active` : ""}
                <span style={{ fontSize: "16px", color: "#dbeafe", lineHeight: 1 }}>{openSections[section.key] ? "▾" : "▸"}</span>
              </span>
            </button>
            {openSections[section.key] ? <div style={{ padding: "0 10px 8px", display: "grid", gap: "6px" }}>
              {section.key === "dateTiming" ? <>
                <select value={filters.dateRange} onChange={(event) => onDateRangeChange(event.target.value as PlatformFiltersState["dateRange"])} style={controlStyle}>
                  <option value="next30">Next 30 Days</option>
                  <option value="next60">Next 60 Days</option>
                  <option value="next90">Next 90 Days</option>
                  <option value="all">All</option>
                </select>
                {dateRangeExtra}
              </> : null}
              {section.key === "location" ? <>
                <FilterDropdown label="Country" emptyLabel="All Country" values={filters.country} options={filterOptions.countries} onToggle={(value) => onToggleFilter("country", value)} isLoading={isLoading} />
                <FilterDropdown label="Region" emptyLabel="All Region" values={filters.region} options={filterOptions.regions} onToggle={(value) => onToggleFilter("region", value)} isLoading={isLoading} />
                <FilterDropdown label="State" emptyLabel="All State" values={filters.state} options={filterOptions.states} onToggle={(value) => onToggleFilter("state", value)} isLoading={isLoading} />
                <FilterDropdown label="Cities" emptyLabel="All Cities" values={filters.cities} options={filterOptions.cities} onToggle={(value) => onToggleFilter("cities", value)} isLoading={isLoading} />
              </> : null}
              {section.key === "marketSegments" ? <>
                <FilterDropdown label="Sectors and themes" emptyLabel="All Sectors / Themes" values={filters.sectorThemes} options={filterOptions.themes} onToggle={(value) => onToggleFilter("sectorThemes", value)} isLoading={isLoading} />
                <FilterDropdown label="Public company sectors" emptyLabel="All Public Company Sectors" values={filters.publicCompanySectors} options={filterOptions.publicCompanySectors || []} onToggle={(value) => onToggleFilter("publicCompanySectors", value)} isLoading={isLoading} />
                <FilterDropdown label="Conference types" emptyLabel="All Types" values={filters.conferenceType} options={filterOptions.conferenceTypes} onToggle={(value) => onToggleFilter("conferenceType", value)} isLoading={isLoading} />
                <FilterDropdown label="Market focus" emptyLabel="All Market Focus" values={filters.marketFocus} options={filterOptions.marketFocuses} onToggle={(value) => onToggleFilter("marketFocus", value)} isLoading={isLoading} />
              </> : null}
              {section.key === "participation" ? <FilterDropdown label="Issuer participation" emptyLabel="All Issuer Participation" values={filters.issuerParticipation} options={filterOptions.issuers} onToggle={(value) => onToggleFilter("issuerParticipation", value)} isLoading={isLoading} /> : null}
              {section.key === "organizers" ? <FilterDropdown label="Organizers" emptyLabel="All Organizers" values={filters.organizer} options={filterOptions.organizers} onToggle={(value) => onToggleFilter("organizer", value)} isLoading={isLoading} /> : null}
            </div> : null}
          </div>
        ))}
      </div>

      {filterMatchingControl ? <div style={{ marginTop: "10px", marginBottom: "20px", display: "flex", justifyContent: "center", width: "100%" }}>{filterMatchingControl}</div> : null}

      <div style={{ marginTop: "6px", padding: "0" }}>
        <div style={{ color: "#f8fbff", fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Quick Feeds</div>
        <div style={{ display: "grid", gap: "4px" }}>
          {quickFeeds.map((feed) => <button key={feed.key} type="button" onClick={feed.onClick} style={{ height: "38px", borderRadius: "8px", border: "1px solid rgba(147,197,253,0.08)", background: "rgba(147,197,253,0.02)", color: "#dbeafe", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: "0 10px" }}>
            <span style={{ width: "20px", height: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: feed.color, filter: "brightness(1.2)" }}><QuickFeedGlyph kind={feed.icon} color={feed.color} /></span>
            <span style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: "8px", width: "100%", minWidth: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#dce8f8", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>{feed.title}</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#f8fbff" }}>({isLoading ? "—" : feed.count})</span>
            </span>
          </button>)}
        </div>
      </div>
    </div>
  );
}
