import express from "express";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton.js";

import {
    handleGetOrganizationWorkingHours,
    handleGetOrganizationWorkingHour,
    handleUpdateOrganizationWorkingHoursWeek,handleUpdateOrganizationWorkingHours
} from "../controllers/working-hours.controller.js";

import {
    authenticateToken,
} from "../controllers/authentication/jwt.authentication.controller.js";

import {
    authorize,
} from "../middlewares/authorization/authorization.js";

import {
    UPDATE_WORKING_HOURS,
} from "../permissions/permissions.js";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema.js";

import {
    queryWorkingHoursSchema,
    updateWorkingHoursSchema,
    updateOrganizationWorkingHoursSchema,
} from "../middlewares/zod-schemas/working-hours.schema.js";

export const workingHoursRouter = express.Router({
    mergeParams: true,
});

/**
 * Get all working hours for an organization.
 */
workingHoursRouter
    .route("/")
    .get(
        authenticateToken,
        validateQuery(queryWorkingHoursSchema),
        handleGetOrganizationWorkingHours,
    )
    .patch(
        authenticateToken,
        authorize(UPDATE_WORKING_HOURS),
        validateBody(updateOrganizationWorkingHoursSchema),
        handleUpdateOrganizationWorkingHoursWeek,
    );

/**
 * Get or update one working-hours day.
 */
workingHoursRouter
    .route("/:workingHoursUuid")
    .get(
        authenticateToken,
        validateParameter(
            validateUuid,
            "workingHoursUuid",
        ),
        handleGetOrganizationWorkingHour,
    )
    .patch(
        authenticateToken,
        authorize(UPDATE_WORKING_HOURS),
        validateParameter(
            validateUuid,
            "workingHoursUuid",
        ),
        validateBody(updateWorkingHoursSchema),
        handleUpdateOrganizationWorkingHours,
    );