import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

// Users (new structure)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin","editor","viewer","external"] }).notNull().default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull()
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

// Locations
export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull()
});

export const states = sqliteTable("states", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull().references(() => countries.code)
});

export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  city: text("city").notNull(),
  cityAscii: text("city_ascii").notNull(),
  stateCode: text("state_code").notNull().references(() => states.code),
  countyFips: text("county_fips"),
  countyName: text("county_name"),
  lat: real("lat"),
  lng: real("lng"),
  population: integer("population"),
  density: real("density"),
  timezone: text("timezone"),
  zips: text("zips")
}, (table) => ({
  idx_city_state: uniqueIndex("u_cities_name_state").on(table.cityAscii, table.stateCode)
}));

// Contacts
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  firstName: text("first_name"),
  lastName: text("last_name"),

  emailPrimary: text("email_primary"),
  emailSecondary: text("email_secondary"),

  company: text("company"),
  website: text("website"),
  companyLinkedin: text("company_linkedin"),

  imdb: text("imdb"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  wikipedia: text("wikipedia"),

  biography: text("biography"),

  priority: text("priority", { enum: ["HIGH","MEDIUM","LOW","NONE"] }).notNull().default("NONE"),
  seenFilm: integer("seen_film", { mode: "boolean" }).notNull().default(false),
  docBranchMember: integer("doc_branch_member", { mode: "boolean" }).notNull().default(false),

  locationCountry: text("location_country").references(() => countries.code),
  locationState: text("location_state").references(() => states.code),
  locationCity: integer("location_city").references(() => cities.id),
  locationStateText: text("location_state_text"),
  locationCityText: text("location_city_text"),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  inactiveReason: text("inactive_reason"),
  inactiveReasonUserId: integer("inactive_reason_user_id").references(() => users.id, { onDelete: "set null" }),
  inactiveAt: integer("inactive_at", { mode: "timestamp_ms" }),

  createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull()
}, (table) => ({
  idx_name: uniqueIndex("u_contacts_name_email").on(table.firstName, table.lastName, table.emailPrimary)
}));

export const contactRelationships = sqliteTable("contact_relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  relationshipOwnerUserId: integer("relationship_owner_user_id").references(() => users.id, { onDelete: "set null" }),
  introducedByUserId: integer("introduced_by_user_id").references(() => users.id, { onDelete: "set null" }),
  relationshipStrength: integer("relationship_strength"),
  lastContactAt: integer("last_contact_at", { mode: "timestamp_ms" }),
  relationshipType: text("relationship_type", { enum: ["surface_level","mentor","supporter","colleague","friend","exec","custom"] }).default("custom"),
  label: text("label")
});

export const contactAssignments = sqliteTable("contact_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
}, (table) => ({
  u_contact_user: uniqueIndex("u_contact_assignment").on(table.contactId, table.userId)
}));

export const contactHistory = sqliteTable("contact_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  action: text("action", { enum: ["created","updated","activated","deactivated","archived","deleted","assigned","unassigned"] }).notNull(),
  changesJson: text("changes_json"),
  reason: text("reason"),
  performedByUserId: integer("performed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull()
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  scope: text("scope", { enum: ["general","hemal","yetkin","private"] }).notNull().default("general"),
  body: text("body").notNull(),
  authorUserId: integer("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  editedAt: integer("edited_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull()
});

export const outreachEvents = sqliteTable("outreach_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  campaignKey: text("campaign_key"),
  direction: text("direction", { enum: ["outbound","inbound"] }).notNull(),
  channel: text("channel", { enum: ["email","phone","linkedin","whatsapp","in_person","other"] }).notNull().default("email"),
  message: text("message"),
  status: text("status", { enum: ["sent","delivered","opened","replied","bounced","failed"] }).default("sent"),
  performedByUserId: integer("performed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull()
});
