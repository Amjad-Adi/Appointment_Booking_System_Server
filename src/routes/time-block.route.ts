import express from "express";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton.js";

import {
    handleGetOrganizationTimeBlocks,
    handleGetOrganizationTimeBlock,
    handleCreateOrganizationTimeBlock,
    handleUpdateOrganizationTimeBlock,
} from "../controllers/time-block.controller.js";

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
    queryTimeBlockSchema,
    createTimeBlockSchema,
    updateTimeBlockSchema,
} from "../middlewares/zod-schemas/time-block.schema.js";

import {
    UPDATE_TIME_BLOCK,
} from "../permissions/permissions.js";

export const timeBlockRouter =
    express.Router({
        mergeParams: true,
    });

timeBlockRouter
    .route("/")
    .get(
        authenticateToken,
        validateQuery(queryTimeBlockSchema),
        handleGetOrganizationTimeBlocks,
    )
    .post(
        authenticateToken,
        validateBody(createTimeBlockSchema),
        handleCreateOrganizationTimeBlock,
    );

timeBlockRouter
    .route("/:timeBlockUuid")
    .get(
        authenticateToken,
        validateParameter(
            validateUuid,
            "timeBlockUuid",
        ),
        handleGetOrganizationTimeBlock,
    )
    .patch(
        authenticateToken,
        authorize(UPDATE_TIME_BLOCK),
        validateParameter(
            validateUuid,
            "timeBlockUuid",
        ),
        validateBody(updateTimeBlockSchema),
        handleUpdateOrganizationTimeBlock,
    );