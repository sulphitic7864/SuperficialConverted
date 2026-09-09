import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  GetLibrarySummaryResponse,
} from "../types";
import type { LibrarySummary } from "../types";
import { activityTable, booksTable, db, requestsTable } from "../db";

const router: IRouter = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const [
    [{ count: totalBooks }],
    [{ count: availableBooks }],
    [{ count: readingBooks }],
    [{ count: openRequests }],
    recentActivity,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(booksTable),
    db
      .select({ count: sql<number>`count(*)` })
      .from(booksTable)
      .where(eq(booksTable.status, "available")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(booksTable)
      .where(eq(booksTable.status, "reading")),
    db.select({ count: sql<number>`count(*)` }).from(requestsTable),
    db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.createdAt))
      .limit(6),
  ]);

  const summary: LibrarySummary = {
    totalBooks: Number(totalBooks),
    availableBooks: Number(availableBooks),
    readingBooks: Number(readingBooks),
    openRequests: Number(openRequests),
    recentActivity,
  };
  res.json(GetLibrarySummaryResponse.parse(summary));
});

export default router;