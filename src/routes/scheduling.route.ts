import { Router } from "express";
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { validateBody } from '../middlewares/validaiton';
import { schedulingSchema } from '../middlewares/zod-schemas/scheduling.schema';
import { handleGetAvailableTimes } from '../controllers/scheduling.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { CREATE_SCHEDULE } from '../permissions/permissions';

export const schedulingRouter = Router({mergeParams: true});
schedulingRouter.post("/", authenticateToken, authorize(CREATE_SCHEDULE), validateBody(schedulingSchema), handleGetAvailableTimes,);