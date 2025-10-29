CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`access_token` text,
	`id_token` text,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `u_accounts` ON `accounts` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city` text NOT NULL,
	`city_ascii` text NOT NULL,
	`state_code` text NOT NULL,
	`county_fips` text,
	`county_name` text,
	`lat` real,
	`lng` real,
	`population` integer,
	`density` real,
	`timezone` text,
	`zips` text,
	FOREIGN KEY (`state_code`) REFERENCES `states`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `u_cities_name_state` ON `cities` (`city_ascii`,`state_code`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`linkedin_url` text,
	`industry` text,
	`size` text,
	`description` text,
	`logo_url` text,
	`headquarters_country` text,
	`headquarters_state` text,
	`headquarters_city` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`headquarters_country`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`headquarters_state`) REFERENCES `states`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`headquarters_city`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_name_unique` ON `companies` (`name`);--> statement-breakpoint
CREATE TABLE `contact_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `u_contact_assignment` ON `contact_assignments` (`contact_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `contact_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`action` text NOT NULL,
	`changes_json` text,
	`reason` text,
	`performed_by_user_id` integer,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`performed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `contact_relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`relationship_owner_user_id` integer,
	`introduced_by_user_id` integer,
	`relationship_strength` integer,
	`last_contact_at` integer,
	`relationship_type` text DEFAULT 'custom',
	`label` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`relationship_owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`introduced_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text,
	`last_name` text,
	`email_primary` text,
	`email_secondary` text,
	`phone_number` text,
	`company_id` integer,
	`imdb` text,
	`facebook` text,
	`instagram` text,
	`linkedin` text,
	`wikipedia` text,
	`biography` text,
	`priority` text DEFAULT 'NONE' NOT NULL,
	`seen_film` integer DEFAULT false NOT NULL,
	`doc_branch_member` integer DEFAULT false NOT NULL,
	`location_country` text,
	`location_state` text,
	`location_city` integer,
	`location_state_text` text,
	`location_city_text` text,
	`is_active` integer DEFAULT true NOT NULL,
	`inactive_reason` text,
	`inactive_reason_user_id` integer,
	`inactive_at` integer,
	`created_by_user_id` integer,
	`assigned_to` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_country`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_state`) REFERENCES `states`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_city`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inactive_reason_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `u_contacts_name_email` ON `contacts` (`first_name`,`last_name`,`email_primary`);--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`scope` text DEFAULT 'general' NOT NULL,
	`body` text NOT NULL,
	`author_user_id` integer NOT NULL,
	`is_edited` integer DEFAULT false NOT NULL,
	`edited_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outreach_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`campaign_key` text,
	`direction` text NOT NULL,
	`channel` text DEFAULT 'email' NOT NULL,
	`message` text,
	`status` text DEFAULT 'sent',
	`performed_by_user_id` integer,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`performed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `states` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country_code` text NOT NULL,
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`last_name` text,
	`email` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);