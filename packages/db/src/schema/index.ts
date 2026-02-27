import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── pgEnums ────────────────────────────────────────────────────────────────

export const relationshipStageEnum = pgEnum("relationship_stage", [
  "intake",
  "active-boardy-onboarding",
  "active-nurture",
  "warm",
  "dormant",
  "converted",
  "archived",
]);

export const boardyStatusEnum = pgEnum("boardy_status", [
  "not-referred",
  "referred",
  "onboarding-in-progress",
  "onboarded",
  "declined",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "boardy-intro",
  "onboarding-nudge",
  "relationship-building",
  "follow-up",
  "check-in",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "drafted",
  "queued-for-review",
  "approved",
  "sent",
  "bounced",
]);

export const personalizationLevelEnum = pgEnum("personalization_level", [
  "template",
  "light-ai",
  "full-ai",
]);

export const conversionPathEnum = pgEnum("conversion_path", [
  "boardy-referral",
  "consulting",
  "nurture",
  "network",
]);

// ─── Entity Tables ──────────────────────────────────────────────────────────

export const founders = pgTable(
  "founders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    companyName: text("company_name").notNull(),
    source: text("source").notNull(),
    stage: text("stage"),
    raiseAmount: text("raise_amount"),
    sector: text("sector"),
    oneLiner: text("one_liner"),
    deckLink: text("deck_link"),
    referringPartner: text("referring_partner"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("founders_email_idx").on(table.email)],
);

export const scouts = pgTable(
  "scouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    connectedEmailAccount: text("connected_email_account"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("scouts_email_idx").on(table.email)],
);

export const relationships = pgTable("relationships", {
  id: uuid("id").primaryKey().defaultRandom(),
  scoutId: uuid("scout_id")
    .notNull()
    .references(() => scouts.id),
  founderId: uuid("founder_id")
    .notNull()
    .references(() => founders.id),
  stage: relationshipStageEnum("stage").notNull().default("intake"),
  boardyStatus: boardyStatusEnum("boardy_status")
    .notNull()
    .default("not-referred"),
  cadencePosition: integer("cadence_position").notNull().default(0),
  interactionCount: integer("interaction_count").notNull().default(0),
  nextTouchpoint: timestamp("next_touchpoint", { withTimezone: true }),
  lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true }),
  lastInteractionChannel: text("last_interaction_channel"),
  lastInteractionSummary: text("last_interaction_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  relationshipId: uuid("relationship_id")
    .notNull()
    .references(() => relationships.id),
  type: messageTypeEnum("type").notNull(),
  status: messageStatusEnum("status").notNull(),
  personalizationLevel: personalizationLevelEnum(
    "personalization_level",
  ).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── History Tables (append-only, field-level change log) ───────────────────

export const founderChanges = pgTable("founder_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  founderId: uuid("founder_id")
    .notNull()
    .references(() => founders.id),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scoutChanges = pgTable("scout_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  scoutId: uuid("scout_id")
    .notNull()
    .references(() => scouts.id),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const relationshipChanges = pgTable("relationship_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  relationshipId: uuid("relationship_id")
    .notNull()
    .references(() => relationships.id),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Drizzle Relations ──────────────────────────────────────────────────────

export const foundersRelations = relations(founders, ({ many }) => ({
  relationships: many(relationships),
  changes: many(founderChanges),
}));

export const scoutsRelations = relations(scouts, ({ many }) => ({
  relationships: many(relationships),
  changes: many(scoutChanges),
}));

export const relationshipsRelations = relations(
  relationships,
  ({ one, many }) => ({
    scout: one(scouts, {
      fields: [relationships.scoutId],
      references: [scouts.id],
    }),
    founder: one(founders, {
      fields: [relationships.founderId],
      references: [founders.id],
    }),
    messages: many(messages),
    changes: many(relationshipChanges),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  relationship: one(relationships, {
    fields: [messages.relationshipId],
    references: [relationships.id],
  }),
}));

export const founderChangesRelations = relations(
  founderChanges,
  ({ one }) => ({
    founder: one(founders, {
      fields: [founderChanges.founderId],
      references: [founders.id],
    }),
  }),
);

export const scoutChangesRelations = relations(scoutChanges, ({ one }) => ({
  scout: one(scouts, {
    fields: [scoutChanges.scoutId],
    references: [scouts.id],
  }),
}));

export const relationshipChangesRelations = relations(
  relationshipChanges,
  ({ one }) => ({
    relationship: one(relationships, {
      fields: [relationshipChanges.relationshipId],
      references: [relationships.id],
    }),
  }),
);
