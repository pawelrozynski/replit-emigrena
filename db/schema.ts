import { pgTable, uuid, timestamp, serial, text, integer, boolean, time, interval } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const wellbeingEntries = pgTable("wellbeing_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  // Sleep parameters
  sleepQuality: integer("sleep_quality"),
  totalSleepDuration: interval("total_sleep_duration"),
  deepSleepDuration: interval("deep_sleep_duration"),
  sleptWithWindowOpen: boolean("slept_with_window_open"),
  hadGoodDreams: boolean("had_good_dreams"),
  hadBadDreams: boolean("had_bad_dreams"),
  wokeUpToToilet: boolean("woke_up_to_toilet"),
  sleepTime: time("sleep_time"),
  wakeTime: time("wake_time"),
  neckStiffness: boolean("neck_stiffness"),
  timeToGetUp: integer("time_to_get_up"),
  workedFromHome: boolean("worked_from_home"),

  // Wellbeing parameters
  workMotivation: integer("work_motivation"),
  mood: integer("mood"),
  socialSatisfaction: integer("social_satisfaction"),
  physicalActivityDesire: integer("physical_activity_desire"),
  headache: integer("headache"),
  sleepiness: integer("sleepiness"),
  physicalFatigue: integer("physical_fatigue"),

  // Activity and diet parameters
  stepsCount: integer("steps_count"),
  fullMealsCount: integer("full_meals_count"),
  fruitsVeggiesPortions: integer("fruits_veggies_portions"),
  alcoholMl: integer("alcohol_ml"),
  sweetsPortions: integer("sweets_portions"),
  sweetDrinksPortions: integer("sweet_drinks_portions"),
});

export const cmsContents = pgTable("cms_contents", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").unique().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentationVersions = pgTable("documentation_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  versionDate: timestamp("version_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertWellbeingSchema = createInsertSchema(wellbeingEntries);
export const selectWellbeingSchema = createSelectSchema(wellbeingEntries);

export const insertCmsSchema = createInsertSchema(cmsContents, {
  key: z.string().min(1, "Klucz jest wymagany"),
  content: z.string().min(1, "Treść jest wymagana"),
});
export const selectCmsSchema = createSelectSchema(cmsContents);

export const insertDocumentationSchema = createInsertSchema(documentationVersions, {
  content: z.string().min(1, "Treść dokumentacji jest wymagana"),
  versionDate: z.date(),
});
export const selectDocumentationSchema = createSelectSchema(documentationVersions);

// Types
export type User = typeof users.$inferSelect;
export type WellbeingEntry = typeof wellbeingEntries.$inferSelect;
export type CmsContent = typeof cmsContents.$inferSelect;
export type DocumentationVersion = typeof documentationVersions.$inferSelect;