import assert from "node:assert/strict";
import test from "node:test";
import { workspacePreferenceKey } from "../lib/supabase/workspacePreferences.ts";
import { fetchWorkspaceEventTitles } from "../lib/workspaceEventLookup.ts";

test("transient preference keys are isolated by account and anonymous session", () => {
  const first = workspacePreferenceKey("user-a", "filterMode");
  const second = workspacePreferenceKey("user-b", "filterMode");
  const anonymous = workspacePreferenceKey("anonymous", "filterMode");
  assert.notEqual(first, second);
  assert.notEqual(first, anonymous);
  assert.equal(first, workspacePreferenceKey("user-a", "filterMode"));
  assert.notEqual(first, workspacePreferenceKey("user-a", "selectedEvents"));
});

test("saved event lookup batches IDs and preserves unresolved IDs without changing them", async () => {
  const ids = Array.from({ length: 35 }, (_, index) => `event-${index}`);
  const requests = [];
  const titles = await fetchWorkspaceEventTitles([...ids, ids[0]], async (url) => {
    const params = new URL(url, "http://localhost").searchParams;
    const batch = params.getAll("eventId");
    requests.push(batch);
    assert.equal(params.get("schedule"), "1");
    assert.equal(params.get("limit"), "30");
    return { ok: true, json: async () => ({ events: batch.filter((id) => id !== "event-31").map((id) => ({ id, title: `Title ${id}` })) }) };
  });
  assert.deepEqual(requests.map((batch) => batch.length), [30, 5]);
  assert.equal(titles["event-0"], "Title event-0");
  assert.equal(titles["event-34"], "Title event-34");
  assert.equal(titles["event-31"], undefined);
  assert.equal(ids.length, 35);
});

test("saved event lookup rejects API failures instead of marking IDs unavailable", async () => {
  await assert.rejects(
    fetchWorkspaceEventTitles(["event-1"], async () => ({ ok: false })),
    /Could not load saved event details/
  );
});
