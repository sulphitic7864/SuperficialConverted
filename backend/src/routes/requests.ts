import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import {
  CreateRequestBody,
  CreateRequestResponse,
  ListRequestsResponse,
} from "../types";
import { activityTable, db, requestsTable } from "../db";
import { isFullName } from "../lib/name-validation";

const router: IRouter = Router();

router.get("/requests", async (_req, res): Promise<void> => {
  const requests = await db
    .select()
    .from(requestsTable)
    .orderBy(desc(requestsTable.createdAt));
  res.json(ListRequestsResponse.parse(requests));
});

router.post("/requests", async (req, res): Promise<void> => {
  const parsedBody = CreateRequestBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }
  if (!isFullName(parsedBody.data.requesterName)) {
    res.status(400).json({ error: "Please enter your full name" });
    return;
  }
  const [request] = await db
    .insert(requestsTable)
    .values({
      title: parsedBody.data.title.trim(),
      requesterName: parsedBody.data.requesterName.trim(),
      note: parsedBody.data.note?.trim() || null,
    })
    .returning();
  await db.insert(activityTable).values({
    type: "requested",
    personName: request.requesterName,
    bookTitle: request.title,
  });
  res.status(201).json(CreateRequestResponse.parse(request));
});

export default router;
