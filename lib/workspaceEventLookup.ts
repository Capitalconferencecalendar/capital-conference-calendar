export type WorkspaceEventTitle = { id: string; title: string };

export async function fetchWorkspaceEventTitles(
  eventIds: string[],
  request: typeof fetch = fetch
): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(eventIds.filter(Boolean))];
  const titles: Record<string, string> = {};
  for (let index = 0; index < uniqueIds.length; index += 30) {
    const batch = uniqueIds.slice(index, index + 30);
    const params = new URLSearchParams({ schedule: "1", limit: "30" });
    batch.forEach((id) => params.append("eventId", id));
    const response = await request(`/api/events?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load saved event details.");
    const page = await response.json() as { events?: WorkspaceEventTitle[] };
    const requested = new Set(batch);
    for (const event of page.events || []) {
      if (requested.has(event.id) && event.title) titles[event.id] = event.title;
    }
  }
  return titles;
}
