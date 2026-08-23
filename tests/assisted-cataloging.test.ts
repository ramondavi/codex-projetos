import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/202608230003_assisted_cataloging.sql", "utf8");

test("stores reusable authorities without overwriting request snapshots", () => {
  assert.match(migration, /create table public\.person_authorities/);
  assert.match(migration, /create table public\.request_cataloging_people/);
  assert.match(migration, /transcribed_name text not null/);
  assert.match(migration, /authorized_name_snapshot text not null/);
});

test("models bilingual controlled terms and one primary subject", () => {
  assert.match(migration, /preferred_label_pt text not null/);
  assert.match(migration, /preferred_label_en text/);
  assert.match(migration, /request_controlled_terms_one_primary/);
});

test("keeps CDU and Cutter manual and prepares structured MARC metadata", () => {
  assert.match(migration, /cdu_code text/);
  assert.match(migration, /cutter_code text/);
  assert.match(migration, /marc21_preparation jsonb/);
  assert.doesNotMatch(migration, /cutter.*suggest/i);
});

test("scores CDU history with primary weight two and secondary weight one", () => {
  assert.match(migration, /2 \* count\(distinct requests\.id\).*primary_term_id[\s\S]*\+ count\(distinct \(requests\.id, terms\.controlled_term_id\)\)/);
  assert.match(migration, /requests\.status in \('approved', 'completed'\)/);
  assert.match(migration, /limit 3/);
});

test("restricts assisted cataloging writes to the ticket owner", () => {
  assert.match(migration, /assigned_to = auth\.uid\(\) and status in \('in_review', 'changes_requested'\)/);
  assert.match(migration, /revoke all on table public\.person_authorities[\s\S]*from anon, authenticated/);
});
