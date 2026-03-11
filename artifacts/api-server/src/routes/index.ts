import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cuppingsRouter from "./cuppings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cuppingsRouter);

export default router;
