import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compactDraft, emptyStudentRequestDraft, STUDENT_REQUEST_DRAFT_KEY } from "../src/domain/student-requests/draft.ts";

const migration = readFileSync(new URL("../supabase/migrations/202608230000_student_requests.sql", import.meta.url), "utf8");

test("keeps registration numbers on reusable academic enrollments", () => {
  assert.match(migration, /create table public\.academic_enrollments/);
  assert.match(migration, /unique \(student_profile_id, academic_program_id, registration_number\)/);
  assert.match(migration, /academic_enrollment_id uuid not null/);
});

test("makes the five approved programs reproducible in the migration flow", () => {
  for (const code of ["architecture-urbanism-undergraduate", "athdc-specialization", "mp-cecre-master", "ppgau-academic-master", "ppgau-doctorate"]) {
    assert.match(migration, new RegExp(`'${code}'`));
  }
  assert.match(migration, /on conflict \(code\) do nothing/);
});

test("enforces one active request per student in the database", () => {
  assert.match(migration, /create unique index cataloging_requests_one_active_per_student[\s\S]*where status in \('submitted', 'in_review', 'changes_requested', 'approved'\)/);
});

test("generates internal annual protocols transactionally", () => {
  assert.match(migration, /create table public\.protocol_counters/);
  assert.match(migration, /on conflict \(year\) do update set last_number/);
  assert.match(migration, /'FC' \|\| protocol_year::text \|\| '-' \|\| lpad\(protocol_number::text, 4, '0'\)/);
});

test("allows request creation only through the protected RPC", () => {
  assert.match(migration, /revoke all on table public\.academic_enrollments, public\.cataloging_requests,[\s\S]*from anon, authenticated/);
  assert.match(migration, /public\.current_user_role\(\) is distinct from 'student'::public\.user_role/);
  assert.match(migration, /grant execute on function public\.open_student_request\(jsonb\) to authenticated/);
});

test("compacts repeatable draft fields without losing structured people", () => {
  const compact = compactDraft({
    ...emptyStudentRequestDraft,
    title: "  Um trabalho  ",
    keywordsPt: [" Arquitetura ", "", " Cidade "],
    people: { author: "  Ana Silva ", advisor: " Prof. José ", advisorNoteLabel: "Orientador", coadvisor: "", coadvisorNoteLabel: "Coorientador" },
  });
  assert.equal(compact.title, "Um trabalho");
  assert.deepEqual(compact.keywordsPt, ["Arquitetura", "Cidade"]);
  assert.equal(compact.people.author, "Ana Silva");
  assert.match(STUDENT_REQUEST_DRAFT_KEY, /^pronto:student-request-draft:/);
});
