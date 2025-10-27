import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  role: text("role").notNull().default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const accounts = sqliteTable("accounts", {
  userId: text("userId").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  access_token: text("access_token"),
  id_token: text("id_token"),
  expires_at: integer("expires_at")
}, (t) => ({
  pk: uniqueIndex("u_accounts").on(t.provider, t.providerAccountId)
}));

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull()
});

export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullNameNorm: text("full_name_norm").notNull(),
  primaryEmail: text("primary_email"),
  priority: integer("priority").default(0),
  assignedTo: text("assigned_to").references(() => users.id),
  locationText: text("location_text"),
  confidence: real("confidence").default(0),
  lastRefreshedAt: integer("last_refreshed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  u_name_email: uniqueIndex("u_people_name_email").on(t.fullNameNorm, t.primaryEmail)
}));

export const contactMethods = sqliteTable("contact_methods", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => people.id),
  type: text("type"),
  value: text("value").notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
  source: text("source"),
  lastVerifiedAt: integer("last_verified_at", { mode: "timestamp_ms" })
});

export const socials = sqliteTable("social_profiles", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => people.id),
  network: text("network"),
  url: text("url"),
  username: text("username"),
  followers: integer("followers"),
  source: text("source"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" })
});

export const orgs = sqliteTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  linkedinUrl: text("linkedin_url")
});

export const employment = sqliteTable("employment", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => people.id),
  orgId: text("org_id").references(() => orgs.id),
  title: text("title"),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  current: integer("current", { mode: "boolean" }).default(false),
  source: text("source")
});

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  personId: text("person_id").references(() => people.id),
  author: text("author"),
  body: text("body"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const outreach = sqliteTable("outreach", {
  id: text("id").primaryKey(),
  personId: text("person_id").references(() => people.id),
  campaign: text("campaign"),
  sentAt: integer("sent_at", { mode: "timestamp_ms" }),
  respondedAt: integer("responded_at", { mode: "timestamp_ms" }),
  status: text("status")
});

export const rawIngest = sqliteTable("raw_ingest", {
  id: text("id").primaryKey(),
  personId: text("person_id").references(() => people.id),
  source: text("source").notNull(),
  payloadJson: text("payload_json").notNull(),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  hash: text("hash").notNull().unique()
});




