"use client";

import { useMemo, useState } from "react";

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  startRaw: string;
  endRaw: string;
  startTs: number;
  endTs: number;
  city: string;
  state: string;
  country: string;
  venue: string;
  website: string;
  organizer: string;
  category: string;
};

const CANADIAN_PROVINCES = new Set([
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
]);

function cleanDateOnly(value?: string) {
  return (value || "").trim().slice(0, 10);
}

function parseDateOnlyStart(value?: string) {
  const clean = cleanDateOnly(value);
  if (!clean) return NaN;

  const [y, m, d] = clean.split("-").map(Number);
  if (!y || !m || !d) return NaN;

  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function parseDateOnlyEnd(value?: string) {
  const clean = cleanDateOnly(value);
  if (!clean) return NaN;

  const [y, m, d] = clean.split("-").map(Number);
  if (!y || !m || !d) return NaN;

  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function deriveCountryFromState(state?: string) {
  const code = (state || "").trim().toUpperCase();
  if (!code) return "";
  return CANADIAN_PROVINCES.has(code) ? "Canada" : "United States";
}

export default function EventsClient({ events }: { events: Event[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleDateFromChange(value: string) {
    setDateFrom(value);

    if (!value) return;

    setDateTo((prev) => {
      if (!prev) return value;
      if (prev < value) return value;
      return prev;
    });
  }

  function handleDateToChange(value: string) {
    if (!value) {
      setDateTo("");
      return;
    }

    if (dateFrom && value < dateFrom) {
      setDateTo(dateFrom);
      return;
    }

    setDateTo(value);
  }

  function handleCountryChange(value: string) {
    setSelectedCountry(value);
    setSelectedState("");
  }

  const normalizedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      countryDerived: deriveCountryFromState(event.state),
    }));
  }, [events]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        normalizedEvents
          .map((event) => event.category?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [normalizedEvents]);

  const countries = useMemo(() => {
    return Array.from(
      new Set(
        normalizedEvents
          .map((event) => event.countryDerived)
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [normalizedEvents]);

  const states = useMemo(() => {
    const pool = selectedCountry
      ? normalizedEvents.filter(
          (event) => event.countryDerived === selectedCountry
        )
      : normalizedEvents;

    return Array.from(
      new Set(
        pool
          .map((event) => event.state?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort();
  }, [normalizedEvents, selectedCountry]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = parseDateOnlyStart(dateFrom);
    const toTs = parseDateOnlyEnd(dateTo);

    const results = normalizedEvents.filter((event) => {
      const title = event.title?.toLowerCase() || "";
      const city = event.city?.toLowerCase() || "";
      const state = event.state?.toLowerCase() || "";
      const country = event.countryDerived.toLowerCase();
      const organizer = event.organizer?.toLowerCase() || "";
      const category = event.category?.toLowerCase() || "";
      const venue = event.venue?.toLowerCase() || "";

      const matchesQuery =
        !q ||
        title.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        country.includes(q) ||
        organizer.includes(q) ||
        category.includes(q) ||
        venue.includes(q);

      const matchesCategory =
        !selectedCategory || event.category === selectedCategory;

      const matchesCountry =
        !selectedCountry || event.countryDerived === selectedCountry;

      const matchesState =
        !selectedState || event.state === selectedState;

      const matchesDateFrom = isNaN(fromTs) || event.endTs >= fromTs;
      const matchesDateTo = isNaN(toTs) || event.startTs <= toTs;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesCountry &&
        matchesState &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    results.sort((a, b) =>
      sortOrder === "asc" ? a.startTs - b.startTs : b.startTs - a.startTs
    );

    return results;
  }, [
    normalizedEvents,
    query,
    selectedCategory,
    selectedCountry,
    selectedState,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  function resetFilters() {
    setQuery("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedState("");
    setSortOrder("asc");
    setDateFrom("");
    setDateTo("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr auto",
          gap: "16px",
          marginBottom: "24px",
          alignItems: "end",
        }}
      >
        <div>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="Event, city, organizer, venue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            style={inputStyle}
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>State / Province</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={inputStyle}
          >
            <option value="">All States / Provinces</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>To Date</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => handleDateToChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Sort</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={inputStyle}
          >
            <option value="asc">Soonest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>

        <div>
          <label style={{ ...labelStyle, visibility: "hidden" }}>Reset</label>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "15px",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <p style={{ marginBottom: "18px", color: "#555" }}>
        {filteredEvents.length} conference{filteredEvents.length === 1 ? "" : "s"} found
      </p>

      {filteredEvents.length === 0 ? (
        <p style={{ color: "#555" }}>No conferences found.</p>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {filteredEvents.map((event) => {
            const location =
              [event.city, event.state].filter(Boolean).join(", ") || "N/A";

            return (
              <div
                key={event.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "22px",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "22px",
                    lineHeight: 1.3,
                  }}
                >
                  {event.title}
                </h2>

                <p>
                  <strong>Date:</strong> {event.start} – {event.end}
                </p>
                <p>
                  <strong>Location:</strong> {location}
                </p>
                <p>
                  <strong>Country:</strong> {event.countryDerived || "N/A"}
                </p>
                <p>
                  <strong>Venue:</strong> {event.venue || "N/A"}
                </p>
                <p>
                  <strong>Organizer:</strong> {event.organizer || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong> {event.category || "N/A"}
                </p>

                {event.website ? (
                  <p>
                    <strong>Conference Link:</strong>{" "}
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Conference Website
                    </a>
                  </p>
                ) : (
                  <p>
                    <strong>Conference Link:</strong> N/A
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}