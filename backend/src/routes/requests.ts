import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  CreateRequestCommentBody,
  CreateRequestCommentResponse,
  CreateRequestBody,
  CreateRequestResponse,
  DeleteRequestParams,
  DeleteRequestResponse,
  ListRequestsResponse,
} from "../types";
import { activityTable, db, requestCommentsTable, requestsTable } from "../db";
import { isFullName } from "../lib/name-validation";

const router: IRouter = Router();

router.get("/requests", async (_req, res): Promise<void> => {
  const requests = await db
    .select()
    .from(requestsTable)
    .orderBy(desc(requestsTable.createdAt));
  const comments = await db
    .select()
    .from(requestCommentsTable)
    .orderBy(asc(requestCommentsTable.createdAt));
  const commentsByRequest = new Map<number, typeof comments>();
  for (const comment of comments) {
    const current = commentsByRequest.get(comment.requestId) ?? [];
    current.push(comment);
    commentsByRequest.set(comment.requestId, current);
  }
  res.json(
    ListRequestsResponse.parse(
      requests.map((request) => ({
        ...request,
        comments: commentsByRequest.get(request.id) ?? [],
      })),
    ),
  );
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

router.post("/requests/:requestId/comments", async (req, res): Promise<void> => {
  const parsedParams = DeleteRequestParams.safeParse(req.params);
  const parsedBody = CreateRequestCommentBody.safeParse(req.body);
  if (!parsedParams.success || !parsedBody.success) {
    res.status(400).json({ error: "Please provide a full name and a comment" });
    return;
  }
  if (!isFullName(parsedBody.data.commenterName)) {
    res.status(400).json({ error: "Please enter your full name" });
    return;
  }
  if (!parsedBody.data.message.trim()) {
    res.status(400).json({ error: "Please enter a comment" });
    return;
  }
  const [request] = await db
    .select({ id: requestsTable.id })
    .from(requestsTable)
    .where(eq(requestsTable.id, parsedParams.data.requestId));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  const [comment] = await db
    .insert(requestCommentsTable)
    .values({
      requestId: request.id,
      commenterName: parsedBody.data.commenterName.trim(),
      message: parsedBody.data.message.trim(),
    })
    .returning();
  res.status(201).json(CreateRequestCommentResponse.parse(comment));
});

router.delete("/requests/:requestId", async (req, res): Promise<void> => {
  const parsedParams = DeleteRequestParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const [request] = await db
    .delete(requestsTable)
    .where(eq(requestsTable.id, parsedParams.data.requestId))
    .returning({ id: requestsTable.id });
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(DeleteRequestResponse.parse(request));
});

export default router;
