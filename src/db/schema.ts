import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "cataloger", "administrator"]);
export const accountStatus = pgEnum("account_status", ["active", "blocked", "inactive"]);
export const academicLevel = pgEnum("academic_level", ["undergraduate", "specialization", "master", "doctorate"]);
export const workType = pgEnum("work_type", ["undergraduate_thesis", "specialization_thesis", "dissertation", "thesis"]);
export const announcementType = pgEnum("announcement_type", ["normal", "recess", "strike", "other"]);
export const requestStatus = pgEnum("request_status", ["submitted", "in_review", "changes_requested", "approved", "completed", "canceled"]);
export const personRole = pgEnum("person_role", ["author", "advisor", "coadvisor"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRole("role").default("student").notNull(),
  status: accountStatus("status").default("active").notNull(),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  ...timestamps,
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull().unique(),
  cpf: text("cpf").notNull().unique(),
  ...timestamps,
});

export const academicEnrollments = pgTable("academic_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentProfileId: uuid("student_profile_id").references(() => studentProfiles.id, { onDelete: "cascade" }).notNull(),
  academicProgramId: uuid("academic_program_id").references(() => academicPrograms.id).notNull(),
  registrationNumber: text("registration_number").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("academic_enrollments_student_program_registration_key").on(table.studentProfileId, table.academicProgramId, table.registrationNumber)]);

export const catalogingRequests = pgTable("cataloging_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentProfileId: uuid("student_profile_id").references(() => studentProfiles.id, { onDelete: "restrict" }).notNull(),
  academicEnrollmentId: uuid("academic_enrollment_id").references(() => academicEnrollments.id, { onDelete: "restrict" }).notNull(),
  protocol: text("protocol").notNull().unique(),
  status: requestStatus("status").default("submitted").notNull(),
  assignedTo: uuid("assigned_to").references(() => profiles.id, { onDelete: "restrict" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  equivalentTitle: text("equivalent_title"),
  otherTitles: jsonb("other_titles").$type<string[]>().default([]).notNull(),
  publicWorkUrl: text("public_work_url").notNull(),
  specialCases: jsonb("special_cases").$type<string[]>().default([]).notNull(),
  volumeInformation: text("volume_information"),
  libraryNote: text("library_note"),
  defendedAndApproved: boolean("defended_and_approved").notNull(),
  finalFileConfirmed: boolean("final_file_confirmed").notNull(),
  approvalPageConfirmed: boolean("approval_page_confirmed").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps,
});

export const requestAnalyses = pgTable("request_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull().unique(),
  analysisNotes: text("analysis_notes").default("").notNull(),
  internalNote: text("internal_note").default("").notNull(),
  lastEditedBy: uuid("last_edited_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  ...timestamps,
});

export const issueTemplates = pgTable("issue_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  message: text("message").notNull(),
  active: boolean("active").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const requestRevisionRounds = pgTable("request_revision_rounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  roundNumber: integer("round_number").notNull(),
  returnedBy: uuid("returned_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  ...timestamps,
});

export const requestFieldIssues = pgTable("request_field_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisionRoundId: uuid("revision_round_id").references(() => requestRevisionRounds.id, { onDelete: "cascade" }).notNull(),
  fieldKey: text("field_key").notNull(),
  fieldLabel: text("field_label").notNull(),
  templateId: uuid("template_id").references(() => issueTemplates.id, { onDelete: "restrict" }),
  justification: text("justification").notNull(),
  originalValue: jsonb("original_value").$type<unknown>(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  ...timestamps,
});

export const requestCorrections = pgTable("request_corrections", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisionRoundId: uuid("revision_round_id").references(() => requestRevisionRounds.id, { onDelete: "cascade" }).notNull(),
  fieldKey: text("field_key").notNull(),
  previousValue: jsonb("previous_value").$type<unknown>(),
  correctedValue: jsonb("corrected_value").$type<unknown>(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailOutbox = pgTable("email_outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  eventType: text("event_type").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  textBody: text("text_body").notNull(),
  status: text("status").default("pending").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  lastError: text("last_error"),
  ...timestamps,
});

export const requestPeople = pgTable("request_people", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  role: personRole("role").notNull(),
  transcribedName: text("transcribed_name").notNull(),
  authorizedName: text("authorized_name"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const requestKeywords = pgTable("request_keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  language: text("language").notNull(),
  term: text("term").notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const personAuthorities = pgTable("person_authorities", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorizedName: text("authorized_name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  updatedBy: uuid("updated_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  ...timestamps,
});

export const requestCatalogingPeople = pgTable("request_cataloging_people", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  authorityPersonId: uuid("authority_person_id").references(() => personAuthorities.id, { onDelete: "restrict" }).notNull(),
  role: text("role").notNull(),
  transcribedName: text("transcribed_name").notNull(),
  authorizedNameSnapshot: text("authorized_name_snapshot").notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const controlledTerms = pgTable("controlled_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  preferredLabelPt: text("preferred_label_pt").notNull(),
  normalizedLabelPt: text("normalized_label_pt").notNull().unique(),
  preferredLabelEn: text("preferred_label_en"),
  normalizedLabelEn: text("normalized_label_en"),
  active: boolean("active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  updatedBy: uuid("updated_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  ...timestamps,
});

export const requestControlledTerms = pgTable("request_controlled_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull(),
  controlledTermId: uuid("controlled_term_id").references(() => controlledTerms.id, { onDelete: "restrict" }).notNull(),
  labelPtSnapshot: text("label_pt_snapshot").notNull(),
  labelEnSnapshot: text("label_en_snapshot"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requestCatalogingMetadata = pgTable("request_cataloging_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "cascade" }).notNull().unique(),
  cduCode: text("cdu_code"),
  cutterCode: text("cutter_code"),
  marc21Preparation: jsonb("marc21_preparation").$type<Record<string, unknown>>().default({}).notNull(),
  lastEditedBy: uuid("last_edited_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  ...timestamps,
});

export const catalogingCardHomologations = pgTable("cataloging_card_homologations", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => catalogingRequests.id, { onDelete: "restrict" }).notNull().unique(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  layoutVersion: text("layout_version").default("provisional-v1").notNull(),
  homologatedBy: uuid("homologated_by").references(() => profiles.id, { onDelete: "restrict" }).notNull(),
  librarianNameSnapshot: text("librarian_name_snapshot").notNull(),
  librarianCrbSnapshot: text("librarian_crb_snapshot").notNull(),
  homologatedAt: timestamp("homologated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const staffProfiles = pgTable("staff_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull().unique(),
  professionalName: text("professional_name").notNull(),
  crb: text("crb").notNull(),
  availableForAssignment: boolean("available_for_assignment").default(true).notNull(),
  ...timestamps,
});

export const academicPrograms = pgTable("academic_programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  level: academicLevel("level").notNull(),
  workType: workType("work_type").notNull(),
  active: boolean("active").default(true).notNull(),
  serviceLevelBusinessDays: integer("service_level_business_days").default(3).notNull(),
  repositoryDepositEnabled: boolean("repository_deposit_enabled").default(true).notNull(),
  coordinationMagicLinkEnabled: boolean("coordination_magic_link_enabled").default(false).notNull(),
  coordinationIssueEmailsEnabled: boolean("coordination_issue_emails_enabled").default(false).notNull(),
  repositoryCollectionLabel: text("repository_collection_label"),
  repositoryDocumentTypeLabel: text("repository_document_type_label"),
  repositoryAcademicDegreeLabel: text("repository_academic_degree_label"),
  repositoryInstitutionLabel: text("repository_institution_label").default("Universidade Federal da Bahia").notNull(),
  repositoryInstitutionAcronym: text("repository_institution_acronym").default("UFBA").notNull(),
  repositoryUnitLabel: text("repository_unit_label").default("Faculdade de Arquitetura").notNull(),
  repositoryProgramLabel: text("repository_program_label"),
  repositoryCountryLabel: text("repository_country_label").default("Brasil").notNull(),
  repositoryDefaultLanguageLabel: text("repository_default_language_label").default("Português").notNull(),
  ...timestamps,
});

export const coordinationContacts = pgTable("coordination_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  academicProgramId: uuid("academic_program_id").references(() => academicPrograms.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  active: boolean("active").default(true).notNull(),
  receivesOpeningEmails: boolean("receives_opening_emails").default(true).notNull(),
  receivesIssueEmails: boolean("receives_issue_emails").default(false).notNull(),
  receivesCompletionEmails: boolean("receives_completion_emails").default(true).notNull(),
  ...timestamps,
});

export const libraryAnnouncements = pgTable("library_announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: announcementType("type").default("normal").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  active: boolean("active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => profiles.id).notNull(),
  ...timestamps,
});

export const slaSettings = pgTable("sla_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  academicProgramId: uuid("academic_program_id").references(() => academicPrograms.id, { onDelete: "cascade" }),
  businessDays: integer("business_days").default(3).notNull(),
  active: boolean("active").default(true).notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => profiles.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
});
