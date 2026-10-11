import express from "express";
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { queryWorkingHoursSchema, updateWorkingHoursSchema ,updateDayWorkingHoursSchema} from '../middlewares/zod-schemas/working-hours.schema';
import { validateBody, validateParameter, validateQuery } from '../middlewares/validaiton';
import { handleGetOrganizationWorkingHour, handleGetOrganizationWorkingHours, handleUpdateOrganizationWorkingHours,handleUpdateOrganizationDayWorkingHours } from '../controllers/working-hours.controller';
import { UPDATE_WORKING_HOURS } from '../permissions/permissions';
import { authorize } from '../middlewares/authorization/authorization';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';

export const workingHoursRouter = express.Router({
    mergeParams: true,
});
workingHoursRouter.route("/")
    .get(authenticateToken, validateQuery(queryWorkingHoursSchema), handleGetOrganizationWorkingHours)
    .patch(authenticateToken, authorize(UPDATE_WORKING_HOURS), validateBody(updateWorkingHoursSchema), handleUpdateOrganizationWorkingHours);

workingHoursRouter
    .route("/:workingHoursUuid")
    .get(authenticateToken, validateParameter(validateUuid, "workingHoursUuid") ,handleGetOrganizationWorkingHour)
    .patch(authenticateToken, authorize(UPDATE_WORKING_HOURS),validateParameter(validateUuid, "workingHoursUuid") ,validateBody(updateDayWorkingHoursSchema), handleUpdateOrganizationDayWorkingHours);
