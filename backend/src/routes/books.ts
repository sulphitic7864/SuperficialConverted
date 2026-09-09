import { Router, type IRouter } from "express";
import { and, desc, eq, exists, ilike, or, sql } from "drizzle-orm";
import {
  CreateBookBody,
  CreateBookResponse,
  DeleteBookParams,
  DeleteBookResponse,
  ListBooksQueryParams,
  ListBooksResponse,
  ReturnBookBody,
  ReturnBookParams,
  ReturnBookResponse,
  TakeBookBody,
  TakeBookParams,
  TakeBookResponse,
} from "../types";
import {
  activityTable,
  booksTable,
  db,
} from "../db";
import { isFullName } from "../lib/name-validation";

const router: IRouter = Router();

router.get("/books", async (req, res): Promise<void> => {
  const parsedQuery = ListBooksQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    req.log.warn({ errors: parsedQuery.error.message }, "Invalid book filters");
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const { status, search, borrowedBy } = parsedQuery.data;
  const filters = [];
  if (status !== "all") {
    filters.push(
  eq(
    booksTable.status,
    status as "available" | "reading"
  )
);
  }
  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    filters.push(
      or(ilike(booksTable.title, pattern), ilike(booksTable.author, pattern)),
    );
  }
  if (borrowedBy?.trim()) {
    filters.push(
      exists(
        db
          .select({ id: activityTable.id })
          .from(activityTable)
          .where(
            and(
              eq(activityTable.bookId, booksTable.id),
              eq(activityTable.type, "taken"),
              ilike(activityTable.personName, borrowedBy.trim()),
            ),
          ),
      ),
    );
  }

  const books = await db
    .select()
    .from(booksTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(booksTable.addedAt));

  const readerCounts = await db
    .select({
      bookId: activityTable.bookId,
      count: sql<number>`count(distinct ${activityTable.personName})`.mapWith(Number),
    })
    .from(activityTable)
    .where(eq(activityTable.type, "taken"))
    .groupBy(activityTable.bookId);
  const countByBookId = new Map(
    readerCounts
      .filter((row): row is { bookId: number; count: number } => row.bookId !== null)
      .map((row) => [row.bookId, row.count]),
  );

  res.json(ListBooksResponse.parse(books.map((book) => ({
    ...book,
    readerCount: countByBookId.get(book.id) ?? 0,
  }))));
});

router.post("/books", async (req, res): Promise<void> => {
  const parsedBody = CreateBookBody.safeParse(req.body);
  if (!parsedBody.success) {
    req.log.warn({ errors: parsedBody.error.message }, "Invalid book details");
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }
  const { personName, rating, nextReaderNote, lovedThing } = parsedBody.data;
  const [book] = await db
    .insert(booksTable)
    .values({
      title: parsedBody.data.title.trim(),
      author: parsedBody.data.author.trim(),
      genre: parsedBody.data.genre.trim(),
      rating: rating ? Math.round(rating) : null,
      nextReaderNote: nextReaderNote?.trim() || null,
      lovedThing: lovedThing?.trim() || null,
    })
    .returning();
  await db.insert(activityTable).values({
    type: "added",
    personName: personName?.trim() || "A community member",
    bookTitle: book.title,
    bookId: book.id,
  });
  res.status(201).json(CreateBookResponse.parse(book));
});

router.post("/books/:bookId/take", async (req, res): Promise<void> => {
  const parsedParams = TakeBookParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const parsedBody = TakeBookBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }
  if (!isFullName(parsedBody.data.personName)) {
    res.status(400).json({ error: "Please enter your full name" });
    return;
  }

  const [existingBook] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsedParams.data.bookId));
  if (!existingBook) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (existingBook.status === "reading") {
    res.status(409).json({ error: "This book is already being read" });
    return;
  }

  const takenAt = new Date();
  const dueAt = new Date(takenAt);
  dueAt.setDate(dueAt.getDate() + 21);
  const [book] = await db
    .update(booksTable)
    .set({
      status: "reading",
      holderName: parsedBody.data.personName.trim(),
      takenAt,
      dueAt,
    })
    .where(eq(booksTable.id, parsedParams.data.bookId))
    .returning();
  await db.insert(activityTable).values({
    type: "taken",
    personName: parsedBody.data.personName.trim(),
    bookTitle: book.title,
    bookId: book.id,
  });
  res.json(TakeBookResponse.parse(book));
});

router.delete("/books/:bookId", async (req, res): Promise<void> => {
  const parsedParams = DeleteBookParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const deletedBook = await db.transaction(async (tx) => {
    await tx
      .delete(activityTable)
      .where(eq(activityTable.bookId, parsedParams.data.bookId));
    const [book] = await tx
      .delete(booksTable)
      .where(eq(booksTable.id, parsedParams.data.bookId))
      .returning();
    return book;
  });
  if (!deletedBook) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(DeleteBookResponse.parse(deletedBook));
});

router.post("/books/:bookId/return", async (req, res): Promise<void> => {
  const parsedParams = ReturnBookParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const parsedBody = ReturnBookBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [existingBook] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsedParams.data.bookId));
  if (!existingBook) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (existingBook.status === "available") {
    res.status(409).json({ error: "This book is already available" });
    return;
  }

  const [book] = await db
    .update(booksTable)
    .set({
      status: "available",
      holderName: null,
      takenAt: null,
      dueAt: null,
      ...(parsedBody.data.rating
        ? { rating: Math.round(parsedBody.data.rating) }
        : {}),
      ...(parsedBody.data.nextReaderNote !== undefined
        ? { nextReaderNote: parsedBody.data.nextReaderNote.trim() || null }
        : {}),
      ...(parsedBody.data.lovedThing !== undefined
        ? { lovedThing: parsedBody.data.lovedThing.trim() || null }
        : {}),
    })
    .where(eq(booksTable.id, parsedParams.data.bookId))
    .returning();
  await db.insert(activityTable).values({
    type: "returned",
    personName: parsedBody.data.personName.trim(),
    bookTitle: book.title,
    bookId: book.id,
  });
  res.json(ReturnBookResponse.parse(book));
});

export default router;