"use client";

import { useState } from "react";

type DateRangeFieldsProps = {
  initialFrom: string;
  initialTo: string;
};

export default function DateRangeFields({
  initialFrom,
  initialTo,
}: DateRangeFieldsProps) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  return (
    <>
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#667085",
            marginBottom: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Start Date
        </div>
        <input
          type="date"
          name="from"
          value={from}
          onChange={(event) => {
            const nextFrom = event.target.value;
            setFrom(nextFrom);
            setTo(nextFrom);
          }}
          style={{
            width: "100%",
            height: "40px",
            borderRadius: "9px",
            border: "1px solid #d5dde7",
            backgroundColor: "#ffffff",
            padding: "0 11px",
            fontSize: "13px",
            color: "#1f2937",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#667085",
            marginBottom: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          End Date
        </div>
        <input
          type="date"
          name="to"
          value={to}
          min={from || undefined}
          onChange={(event) => {
            setTo(event.target.value);
          }}
          style={{
            width: "100%",
            height: "40px",
            borderRadius: "9px",
            border: "1px solid #d5dde7",
            backgroundColor: "#ffffff",
            padding: "0 11px",
            fontSize: "13px",
            color: "#1f2937",
            boxSizing: "border-box",
          }}
        />
      </div>
    </>
  );
}
