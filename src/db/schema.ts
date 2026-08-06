import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "cataloger", "administrator"]);
export const accountStatus = pgEnum("account_status", ["active", "blocked", "inactive"]);
export const academicLevel = pgEnum("academic_level", ["undergraduate", "specialization", "master", "doctorate"]);
export const workType = pgEnum("work_type", ["undergraduate_thesis", "specialization_thesis", "dissertation", "thesis"]);
export const announcementType = pgEnum("announcement_type", ["normal", "recess", "strike", "other"]);

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
