import express from "express";
import { createTimeBlockSchema, createTimeBlockSchemaByCrm, queryTimeBlockSchema, updateTimeBlockSchema } from '../middlewares/zod-schemas/time-block.schema';
import { validateBody, validateBodyByRole, validateParameter, validateQuery } from '../middlewares/validaiton';
import { Role } from '../models/enums/roles';
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { CREATE_TIME_BLOCK, READ_TIME_BLOCKS, UPDATE_TIME_BLOCK } from '../permissions/permissions';
import { handleCreateOrganizationTimeBlock, handleGetOrganizationTimeBlock, handleGetOrganizationTimeBlocks,
    handleUpdateOrganizationTimeBlock
} from '../controllers/time-block.controller';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';


export const timeBlockRouter = express.Router({ mergeParams: true });
const createRoleSchemas={
    [Role.CRM]:createTimeBlockSchemaByCrm,
    [Role.WORKER]:createTimeBlockSchema,
};

timeBlockRouter.route("/")
    .get(authenticateToken,authorize(READ_TIME_BLOCKS), validateQuery(queryTimeBlockSchema), handleGetOrganizationTimeBlocks)
    .post(authenticateToken,authorize(CREATE_TIME_BLOCK),  validateBodyByRole(createRoleSchemas), handleCreateOrganizationTimeBlock);

timeBlockRouter
    .route("/:timeBlockUuid")
    .get(authenticateToken, validateParameter(validateUuid, "timeBlockUuid",), handleGetOrganizationTimeBlock)
    .patch(authenticateToken, authorize(UPDATE_TIME_BLOCK), validateParameter(validateUuid, "timeBlockUuid",), validateBody(updateTimeBlockSchema), handleUpdateOrganizationTimeBlock);