import { pgTable, serial, text, numeric, integer } from "drizzle-orm/pg-core";

export const itemGroups = pgTable("item_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const groupItems = pgTable("group_items", {
  id: serial("id").primaryKey(),
  itemNo: text("item_no"),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  unitRateSar: numeric("unit_rate_sar", { precision: 12, scale: 2 }).notNull(),
  groupId: integer("group_id")
    .notNull()
    .references(() => itemGroups.id, { onDelete: "cascade" }),
});

export const manpowerItems = pgTable("manpower_items", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  rate: numeric("rate", { precision: 8, scale: 2 }).notNull(), // e.g. 147.86
});