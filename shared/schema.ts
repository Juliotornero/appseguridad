import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define sheet data types
export const sheetDataSchema = z.object({
  sheetName: z.string(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string()))
});

export type SheetData = z.infer<typeof sheetDataSchema>;

export const allSheetsDataSchema = z.array(sheetDataSchema);
export type AllSheetsData = z.infer<typeof allSheetsDataSchema>;

// Keep existing user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
