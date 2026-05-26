type CommunityFeedItem = {
  label: string;
  description: string;
  href: string;
};

const FEEDS: CommunityFeedItem[] = [
  {
    label: "All US Conferences",
    description: "Broad US capital markets conference coverage.",
    href: "/events?country=United%20States#calendar-feed",
  },
  {
    label: "US + Canada Conferences",
    description: "North American conference coverage across major markets.",
    href: "/events?country=United%20States&country=Canada#calendar-feed",
  },
  {
    label: "Northeast Conferences",
    description: "Regional conference coverage across the Northeast.",
    href: "/events?region=Northeast#calendar-feed",
  },
  {
    label: "West Coast Conferences",
    description: "West Coast capital markets conference coverage.",
    href: "/events?region=West%20Coast#calendar-feed",
  },
  {
    label: "Microcap Conferences",
    description: "Microcap-focused event coverage.",
    href: "/events?marketFocus=Microcap#calendar-feed",
  },
];

export default function CommunityFeedsPanel() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d7dde5",
        borderRadius: "14px",
        padding: "16px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: 1.2,
            color: "#0f172a",
          }}
        >
          Community Live Calendar Feeds
        </h2>

        <a
          href="/events#calendar-feed"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#0f3d75",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Create Feed
        </a>
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          lineHeight: 1.5,
          marginBottom: "12px",
        }}
      >
        Rotating feed examples that open directly in the event database.
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {FEEDS.map((item) => (
          <div
            key={item.label}
            style={{
              border: "1px solid #e1e7ef",
              borderRadius: "12px",
              padding: "12px",
              backgroundColor: "#fbfdff",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: "4px",
                lineHeight: 1.35,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45,
                marginBottom: "8px",
              }}
            >
              {item.description}
            </div>

            <a
              href={item.href}
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f3d75",
                textDecoration: "none",
              }}
            >
              Use This Feed
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}