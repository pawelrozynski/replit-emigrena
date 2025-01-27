import { pgTable, uuid, timestamp, serial, text, integer, boolean, time, interval } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

export const selectUserSchema = createSelectSchema(users);

export const insertWellbeingSchema = createInsertSchema(wellbeingEntries, {
  sleepQuality: z.number().min(1).max(100).optional(),
  workMotivation: z.number().min(0).max(10).optional(),
  mood: z.number().min(0).max(10).optional(),
  socialSatisfaction: z.number().min(0).max(10).optional(),
  physicalActivityDesire: z.number().min(0).max(10).optional(),
  headache: z.number().min(0).max(10).optional(),
  sleepiness: z.number().min(0).max(10).optional(),
  physicalFatigue: z.number().min(0).max(10).optional(),
  stepsCount: z.number().min(0).max(100000).optional(),
  fullMealsCount: z.number().min(0).max(5).optional(),
  fruitsVeggiesPortions: z.number().min(0).max(5).optional(),
  alcoholMl: z.number().min(0).max(500).optional(),
  sweetsPortions: z.number().min(0).max(5).optional(),
  sweetDrinksPortions: z.number().min(0).max(10).optional(),
});

export const selectWellbeingSchema = createSelectSchema(wellbeingEntries);

export type User = typeof users.$inferSelect;
export type WellbeingEntry = typeof wellbeingEntries.$inferSelect;
export type NewWellbeingEntry = typeof wellbeingEntries.$inferInsert;