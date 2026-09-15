import express from "express";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton.js";

import {
    handleGetOrganizationSpecialDays,
    handleGetOrganizationSpecialDay,
    handleCreateOrganizationSpecialDay,
    handleUpdateOrganizationSpecialDay,
    handleIsTodaySpecialDay,
} from "../controllers/special-days.controller.js";

import {
    authenticateToken,
} from "../controllers/authentication/jwt.authentication.controller.js";

import {
    authorize,
} from "../middlewares/authorization/authorization.js";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema.js";

import {
    querySpecialDaySchema,
    createSpecialDaySchema,
    updateSpecialDaySchema
} from "../middlewares/zod-schemas/special-days.schema.js";

import {
    UPDATE_SPECIAL_DAY,
    CREATE_SPECIAL_DAY,
} from "../permissions/permissions.js";

export const specialDaysRouter =
    express.Router({
        mergeParams: true,
    });

specialDaysRouter
    .route("/")
    .get(
        authenticateToken,
        validateQuery(
            querySpecialDaySchema,
        ),
        handleGetOrganizationSpecialDays,
    )
    .post(
        authenticateToken,
        authorize(CREATE_SPECIAL_DAY),
        validateBody(
            createSpecialDaySchema,
        ),
        handleCreateOrganizationSpecialDay,
    );

specialDaysRouter
    .route("/today")
    .get(
        authenticateToken,
        handleIsTodaySpecialDay,
    );

specialDaysRouter
    .route("/:specialDayUuid")
    .get(
        authenticateToken,
        validateParameter(
            validateUuid,
            "specialDayUuid",
        ),
        handleGetOrganizationSpecialDay,
    )
    .patch(
        authenticateToken,
        authorize(UPDATE_SPECIAL_DAY),
        validateParameter(
            validateUuid,
            "specialDayUuid",
        ),
        validateBody(
            updateSpecialDaySchema,
        ),
        handleUpdateOrganizationSpecialDay,
    );