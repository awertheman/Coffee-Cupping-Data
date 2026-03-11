import { pgTable, serial, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const scoreAttributeSchema = z.object({
  score: z.number().min(6).max(10),
  intensity: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

const booleanAttributeSchema = z.object({
  score: z.number().min(0).max(10),
  notes: z.string().optional(),
});

const defectsSchema = z.object({
  taints: z.number().int().min(0).max(5).optional(),
  faults: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});

export const cuppingsTable = pgTable("cuppings", {
  id: serial("id").primaryKey(),
  sampleId: text("sample_id").notNull(),
  origin: text("origin"),
  variety: text("variety"),
  process: text("process"),
  roastDate: text("roast_date"),
  roastLevel: text("roast_level"),
  cuppingDate: text("cupping_date"),
  cupperName: text("cupper_name"),
  fragranceAroma: jsonb("fragrance_aroma"),
  flavor: jsonb("flavor"),
  aftertaste: jsonb("aftertaste"),
  acidity: jsonb("acidity"),
  body: jsonb("body"),
  balance: jsonb("balance"),
  uniformity: jsonb("uniformity"),
  cleanCup: jsonb("clean_cup"),
  sweetness: jsonb("sweetness"),
  overall: jsonb("overall"),
  defects: jsonb("defects"),
  finalScore: real("final_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCuppingSchema = createInsertSchema(cuppingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCupping = z.infer<typeof insertCuppingSchema>;
export type Cupping = typeof cuppingsTable.$inferSelect;

export { scoreAttributeSchema, booleanAttributeSchema, defectsSchema };
