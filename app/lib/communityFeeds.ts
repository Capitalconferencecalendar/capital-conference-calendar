export type FeedFilters = {
  countries?: string[];
  regions?: string[];
  states?: string[];
  categories?: string[];
  marketFocus?: string[];
  formats?: ("In-Person" | "Hybrid" | "Virtual")[];
  tags?: string[];
};

export type FeedTemplate = {
  id: string;
  label: string;
  description: string;
  filters: FeedFilters;
};

export type CommunityFeedItem = {
  id: string;
  label: string;
  description: string;
  filters: FeedFilters;
  url: string;
  source: "preset" | "recent";
};

const ROTATION_WINDOW_MS = 5 * 60 * 1000;
const REFRESH_BUMP_EVERY = 3;

const RECENT_FEED_KEY = "ccc_recent_feed_v1";
const REFRESH_COUNT_KEY = "ccc_feed_refresh_count_v1";

function appendArray(
  params: URLSearchParams,
  key: string,
  values?: string[]
): void {
  if (!values?.length) return;
  values.forEach((value) => params.append(key, value));
}

export function buildFeedUrl(filters: FeedFilters): string {
  const params = new URLSearchParams();

  appendArray(params, "country", filters.countries);
  appendArray(params, "region", filters.regions);
  appendArray(params, "state", filters.states);
  appendArray(params, "category", filters.categories);
  appendArray(params, "marketFocus", filters.marketFocus);
  appendArray(params, "format", filters.formats);
  appendArray(params, "tag", filters.tags);

  const query = params.toString();
  return query ? `/api/ics?${query}` : "/api/ics";
}

export function saveRecentGeneratedFeed(
  label: string,
  filters: FeedFilters
): void {
  if (typeof window === "undefined") return;

  const payload: CommunityFeedItem = {
    id: `recent-${Date.now()}`,
    label,
    description: "Your most recently generated live feed on this browser.",
    filters,
    url: buildFeedUrl(filters),
    source: "recent",
  };

  window.localStorage.setItem(RECENT_FEED_KEY, JSON.stringify(payload));
}

function getRecentFeed(): CommunityFeedItem | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RECENT_FEED_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CommunityFeedItem;
    if (!parsed?.url || !parsed?.label) return null;

    return parsed;
  } catch {
    return null;
  }
}

function getRefreshBump(): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(REFRESH_COUNT_KEY);
    const count = raw ? Number(raw) || 0 : 0;
    const nextCount = count + 1;

    window.localStorage.setItem(REFRESH_COUNT_KEY, String(nextCount));
    return Math.floor(nextCount / REFRESH_BUMP_EVERY);
  } catch {
    return 0;
  }
}

export const FEED_TEMPLATES: FeedTemplate[] = [
  {
    id: "all-us",
    label: "All US Conferences",
    description: "Broad US capital markets conference coverage.",
    filters: { countries: ["United States"] },
  },
  {
    id: "all-us-canada",
    label: "US + Canada Conferences",
    description: "North American conference coverage across major markets.",
    filters: { countries: ["United States", "Canada"] },
  },
  {
    id: "northeast",
    label: "Northeast Conferences",
    description: "Regional coverage across the Northeast.",
    filters: { regions: ["Northeast"] },
  },
  {
    id: "west-coast",
    label: "West Coast Conferences",
    description: "West Coast capital markets conference coverage.",
    filters: { regions: ["West Coast"] },
  },
  {
    id: "southeast",
    label: "Southeast Conferences",
    description: "Southeast regional conference coverage.",
    filters: { regions: ["Southeast"] },
  },
  {
    id: "midwest",
    label: "Midwest Conferences",
    description: "Midwest regional conference coverage.",
    filters: { regions: ["Midwest"] },
  },
  {
    id: "southwest",
    label: "Southwest Conferences",
    description: "Conference activity across Texas and the Southwest.",
    filters: { regions: ["Southwest"] },
  },
  {
    id: "canada",
    label: "Canada Conferences",
    description: "Canadian capital markets conference coverage.",
    filters: { countries: ["Canada"] },
  },
  {
    id: "microcap",
    label: "Microcap Conferences",
    description: "Microcap-focused event coverage.",
    filters: { marketFocus: ["Microcap"] },
  },
  {
    id: "small-cap",
    label: "Small Cap Conferences",
    description: "Small cap issuer and investor conference coverage.",
    filters: { marketFocus: ["Small Cap"] },
  },
  {
    id: "micro-small",
    label: "Microcap + Small Cap Conferences",
    description: "Combined lower-cap conference coverage.",
    filters: { marketFocus: ["Microcap", "Small Cap"] },
  },
  {
    id: "growth",
    label: "Growth Conferences",
    description: "Growth-focused conference coverage.",
    filters: { marketFocus: ["Growth"] },
  },
  {
    id: "technology",
    label: "Technology Conferences",
    description: "Technology and software event coverage.",
    filters: { tags: ["Technology", "Software", "AI"] },
  },
  {
    id: "biotech-healthcare",
    label: "Biotech + Healthcare Conferences",
    description: "Healthcare and biotech conference coverage.",
    filters: { tags: ["Biotech", "Healthcare"] },
  },
  {
    id: "energy",
    label: "Energy Conferences",
    description: "Energy and power conference coverage.",
    filters: { tags: ["Energy", "Power", "Oil & Gas"] },
  },
  {
    id: "mining-metals",
    label: "Mining + Metals Conferences",
    description: "Mining, metals, and natural resources event coverage.",
    filters: { tags: ["Mining", "Metals", "Natural Resources"] },
  },
  {
    id: "financial-services",
    label: "Financial Services Conferences",
    description: "Banks, fintech, and financial services event coverage.",
    filters: { tags: ["Financial Services", "Fintech", "Insurance"] },
  },
  {
    id: "consumer-retail",
    label: "Consumer + Retail Conferences",
    description: "Consumer and retail conference coverage.",
    filters: { tags: ["Consumer", "Retail", "Ecommerce"] },
  },
  {
    id: "spac-deal",
    label: "SPAC + Deal Market Events",
    description: "SPAC and deal-market oriented event coverage.",
    filters: { tags: ["SPAC", "M&A", "Capital Formation"] },
  },
  {
    id: "issuer-access",
    label: "Issuer Access Events",
    description: "1x1 and issuer access event coverage.",
    filters: { tags: ["1x1", "Issuer Access"] },
  },
  {
    id: "investor-conferences",
    label: "Investor Conferences",
    description: "Broad investor conference coverage.",
    filters: { categories: ["Investor Conference"] },
  },
  {
    id: "bank-hosted",
    label: "Bank-Hosted Conferences",
    description: "Conferences hosted by investment banks.",
    filters: { categories: ["Investment Bank Conference"] },
  },
  {
    id: "independent",
    label: "Independent Conferences",
    description: "Independent organizer conference coverage.",
    filters: { categories: ["Independent Conference"] },
  },
  {
    id: "in-person",
    label: "In-Person Conferences",
    description: "Physical events only.",
    filters: { formats: ["In-Person"] },
  },
  {
    id: "hybrid",
    label: "Hybrid Conferences",
    description: "Hybrid-format event coverage.",
    filters: { formats: ["Hybrid"] },
  },
  {
    id: "virtual",
    label: "Virtual Conferences",
    description: "Virtual event coverage only.",
    filters: { formats: ["Virtual"] },
  },
  {
    id: "ny-metro",
    label: "NY Metro Conferences",
    description: "New York, New Jersey, and Connecticut event coverage.",
    filters: { states: ["New York", "New Jersey", "Connecticut"] },
  },
  {
    id: "florida",
    label: "Florida Conferences",
    description: "Florida conference activity.",
    filters: { states: ["Florida"] },
  },
  {
    id: "california",
    label: "California Conferences",
    description: "California conference activity.",
    filters: { states: ["California"] },
  },
  {
    id: "us-investor",
    label: "US Investor Conferences",
    description: "US investor conference coverage.",
    filters: {
      countries: ["United States"],
      categories: ["Investor Conference"],
    },
  },
];

export function getCommunityFeeds(): CommunityFeedItem[] {
  const recentFeed = getRecentFeed();
  const presetCount = recentFeed ? 4 : 5;

  const timeBucket = Math.floor(Date.now() / ROTATION_WINDOW_MS);
  const refreshBump = getRefreshBump();
  const startIndex = (timeBucket + refreshBump) % FEED_TEMPLATES.length;

  const presetItems: CommunityFeedItem[] = Array.from(
    { length: presetCount },
    (_, index) => {
      const template =
        FEED_TEMPLATES[(startIndex + index) % FEED_TEMPLATES.length];

      return {
        id: template.id,
        label: template.label,
        description: template.description,
        filters: template.filters,
        url: buildFeedUrl(template.filters),
        source: "preset",
      };
    }
  );

  return recentFeed ? [recentFeed, ...presetItems] : presetItems;
}