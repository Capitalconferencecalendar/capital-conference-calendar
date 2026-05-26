"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FiltersBarProps = {
  initialQuery: string;
  initialCategories: string[];
  initialMarketFocuses: string[];
  initialFormats: string[];
  initialIssuerParticipation: string[];
  initialSectorThemes: string[];
  initialStates: string[];
  initialRegions: string[];
  initialFromDate: string;
  initialToDate: string;
  categoryOptions: string[];
  marketFocusOptions: string[];
  formatOptions: string[];
  issuerParticipationOptions: string[];
  sectorThemeOptions: string[];
  stateOptions: string[];
  regionOptions: string[];
};

type MultiSelectDropdownProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        backgroundColor: "#eef2f7",
        border: "1px solid #d9e0e7",
        fontSize: "12px",
        color: "#334155",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function summarizeSelection(label: string, selected: string[]) {
  if (selected.length === 0) return `All ${label}`;
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]}, ${selected[1]}`;
  return `${selected.length} selected`;
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    onChange([...selected, option]);
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        minWidth: "190px",
        flex: "1 1 220px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#667085",
          marginBottom: "7px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "11px 12px",
          borderRadius: "8px",
          border: "1px solid #d7dde5",
          backgroundColor: "#ffffff",
          fontSize: "14px",
          color: "#0f172a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {summarizeSelection(label, selected)}
        </span>
        <span style={{ color: "#64748b", fontSize: "12px" }}>▼</span>
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            backgroundColor: "#ffffff",
            border: "1px solid #d7dde5",
            borderRadius: "10px",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
            padding: "10px",
            zIndex: 40,
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            {options.map((option) => (
              <label
                key={option}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid #e6ebf0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => onChange([])}
              style={{
                border: "none",
                background: "none",
                padding: 0,
                color: "#0f3d75",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "1px solid #d7dde5",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (next: string) => void;
}) {
  return (
    <div style={{ minWidth: "180px", flex: "0 0 190px" }}>
      <div
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#667085",
          marginBottom: "7px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 12px",
          borderRadius: "8px",
          border: "1px solid #d7dde5",
          backgroundColor: "#ffffff",
          fontSize: "14px",
          color: "#0f172a",
        }}
      />
    </div>
  );
}

export default function FiltersBar({
  initialQuery,
  initialCategories,
  initialMarketFocuses,
  initialFormats,
  initialIssuerParticipation,
  initialSectorThemes,
  initialStates,
  initialRegions,
  initialFromDate,
  initialToDate,
  categoryOptions,
  marketFocusOptions,
  formatOptions,
  issuerParticipationOptions,
  sectorThemeOptions,
  stateOptions,
  regionOptions,
}: FiltersBarProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [marketFocuses, setMarketFocuses] = useState(initialMarketFocuses);
  const [formats, setFormats] = useState(initialFormats);
  const [issuerParticipation, setIssuerParticipation] = useState(
    initialIssuerParticipation
  );
  const [sectorThemes, setSectorThemes] = useState(initialSectorThemes);
  const [states, setStates] = useState(initialStates);
  const [regions, setRegions] = useState(initialRegions);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);

  function handleFromDateChange(nextFromDate: string) {
    setFromDate(nextFromDate);

    if (!nextFromDate) return;

    if (!toDate || toDate < nextFromDate) {
      setToDate(nextFromDate);
    }
  }

  function handleToDateChange(nextToDate: string) {
    if (!nextToDate) {
      setToDate("");
      return;
    }

    if (fromDate && nextToDate < fromDate) {
      setToDate(fromDate);
      return;
    }

    setToDate(nextToDate);
  }

  const activeSelectionTags = useMemo(() => {
    return [
      initialQuery ? `Search: ${initialQuery}` : "Search: All",
      categories.length > 0
        ? `Category: ${categories.join(", ")}`
        : "Category: All",
      marketFocuses.length > 0
        ? `Market Focus: ${marketFocuses.join(", ")}`
        : "Market Focus: All",
      formats.length > 0
        ? `Format: ${formats.join(", ")}`
        : "Format: All",
      issuerParticipation.length > 0
        ? `Issuer Participation: ${issuerParticipation.join(", ")}`
        : "Issuer Participation: All",
      sectorThemes.length > 0
        ? `Sector / Themes: ${sectorThemes.join(", ")}`
        : "Sector / Themes: All",
      states.length > 0 ? `State: ${states.join(", ")}` : "State: All",
      regions.length > 0 ? `Region: ${regions.join(", ")}` : "Region: All",
      fromDate ? `From: ${fromDate}` : "From: All",
      toDate ? `To: ${toDate}` : "To: All",
    ];
  }, [
    categories,
    marketFocuses,
    formats,
    issuerParticipation,
    sectorThemes,
    states,
    regions,
    fromDate,
    toDate,
    initialQuery,
  ]);

  function applyFilters() {
    const params = new URLSearchParams();

    if (initialQuery) {
      params.set("q", initialQuery);
    }

    categories.forEach((value) => params.append("category", value));
    marketFocuses.forEach((value) => params.append("marketFocus", value));
    formats.forEach((value) => params.append("format", value));
    issuerParticipation.forEach((value) =>
      params.append("issuerParticipation", value)
    );
    sectorThemes.forEach((value) => params.append("sectorTheme", value));
    states.forEach((value) => params.append("state", value));
    regions.forEach((value) => params.append("region", value));

    if (fromDate) {
      params.set("startDate", fromDate);
    }

    if (toDate) {
      params.set("endDate", toDate);
    }

    window.location.href = `/events${params.toString() ? `?${params.toString()}` : ""}`;
  }

  function resetFilters() {
    const params = new URLSearchParams();

    if (initialQuery) {
      params.set("q", initialQuery);
    }

    window.location.href = `/events${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d7dde5",
        borderRadius: "10px",
        padding: "18px",
        marginBottom: "16px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 4px 0",
              fontSize: "20px",
            }}
          >
            Filters
          </h2>
          <div
            style={{
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Narrow results with structured filters. From / To affects page results only.
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={applyFilters}
            style={{
              backgroundColor: "#111827",
              color: "#fff",
              border: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            style={{
              color: "#0f172a",
              border: "1px solid #d7dde5",
              backgroundColor: "#fff",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        <MultiSelectDropdown
          label="Category"
          options={categoryOptions}
          selected={categories}
          onChange={setCategories}
        />

        <MultiSelectDropdown
          label="Market Focus"
          options={marketFocusOptions}
          selected={marketFocuses}
          onChange={setMarketFocuses}
        />

        <MultiSelectDropdown
          label="Format"
          options={formatOptions}
          selected={formats}
          onChange={setFormats}
        />

        <MultiSelectDropdown
          label="Issuer Participation"
          options={issuerParticipationOptions}
          selected={issuerParticipation}
          onChange={setIssuerParticipation}
        />

        <MultiSelectDropdown
          label="Sector / Themes"
          options={sectorThemeOptions}
          selected={sectorThemes}
          onChange={setSectorThemes}
        />

        <MultiSelectDropdown
          label="State"
          options={stateOptions}
          selected={states}
          onChange={setStates}
        />

        <MultiSelectDropdown
          label="Region"
          options={regionOptions}
          selected={regions}
          onChange={setRegions}
        />

        <DateField
          label="From"
          value={fromDate}
          onChange={handleFromDateChange}
        />

        <DateField
          label="To"
          value={toDate}
          min={fromDate || undefined}
          onChange={handleToDateChange}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid #e6ebf0",
          paddingTop: "14px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#667085",
            marginBottom: "10px",
            fontWeight: 700,
          }}
        >
          Current Selections
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {activeSelectionTags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
