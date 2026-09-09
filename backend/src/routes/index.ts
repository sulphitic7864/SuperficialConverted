import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import requestsRouter from "./requests";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(requestsRouter);
router.use(summaryRouter);

export default router;
