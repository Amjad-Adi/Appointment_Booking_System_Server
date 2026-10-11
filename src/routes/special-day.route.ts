import express from "express";
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { validateBody, validateParameter, validateQuery } from '../middlewares/validaiton';
import { createSpecialDaySchema, querySpecialDaySchema, updateSpecialDaySchema } from '../middlewares/zod-schemas/special-days.schema';
import { handleCreateOrganizationSpecialDay, handleGetOrganizationSpecialDay, handleGetOrganizationSpecialDays,
    handleUpdateOrganizationSpecialDay
} from '../controllers/special-days.controller';
import { CREATE_SPECIAL_DAY, UPDATE_SPECIAL_DAY } from '../permissions/permissions';
import { authorize } from '../middlewares/authorization/authorization';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';

export const specialDaysRouter = express.Router({ mergeParams: true, });

specialDaysRouter.route("/")
    .get(authenticateToken, validateQuery(querySpecialDaySchema), handleGetOrganizationSpecialDays)
    .post(authenticateToken, authorize(CREATE_SPECIAL_DAY), validateBody(createSpecialDaySchema), handleCreateOrganizationSpecialDay);

specialDaysRouter.route("/:specialDayUuid")
    .get(authenticateToken, validateParameter(validateUuid, "specialDayUuid"), handleGetOrganizationSpecialDay,)
    .patch(authenticateToken, authorize(UPDATE_SPECIAL_DAY), validateParameter(validateUuid, "specialDayUuid"), validateBody(updateSpecialDaySchema), handleUpdateOrganizationSpecialDay);