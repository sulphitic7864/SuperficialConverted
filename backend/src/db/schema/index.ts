import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const bookStatusEnum = pgEnum("book_status", ["available", "reading"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "taken",
  "returned",
  "added",
  "requested",
]);

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  status: bookStatusEnum("status").notNull().default("available"),
  holderName: text("holder_name"),
  takenAt: timestamp("taken_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  rating: integer("rating"),
  nextReaderNote: text("next_reader_note"),
  lovedThing: text("loved_thing"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const requestsTable = pgTable("book_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  requesterName: text("requester_name").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activityTable = pgTable("library_activity", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  personName: text("person_name").notNull(),
  bookTitle: text("book_title").notNull(),
  bookId: integer("book_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable)
  .pick({ title: true, author: true, genre: true })
  .extend({
    title: z.string().min(1),
    author: z.string().min(1),
    genre: z.string().min(1),
  });

export const insertRequestSchema = createInsertSchema(requestsTable)
  .pick({ title: true, requesterName: true, note: true })
  .extend({
    title: z.string().min(1),
    requesterName: z.string().min(1).max(80),
    note: z.string().max(240).optional(),
  });

export type Book = typeof booksTable.$inferSelect;
export type BookRequest = typeof requestsTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertRequest = z.infer<typeof insertRequestSchema>;