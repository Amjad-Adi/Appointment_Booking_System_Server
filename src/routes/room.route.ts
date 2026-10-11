import express from 'express';

import {
    validateBody,
    validateParameter,
    validateQuery,
} from '../middlewares/validaiton';

import {
    handleGetOrganizationRooms,
    handleUpdateOrganizationRoom,
    handleCreateOrganizationRoom,
    handleGetOrganizationRoom,
} from '../controllers/room.controller';

import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';

import { authorize } from '../middlewares/authorization/authorization';

import {
    CREATE_ROOM,
    READ_ORGANIZATION_ROOMS,
    UPDATE_ROOM,
} from '../permissions/permissions';

import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';

import {
    createRoomSchema,
    queryRoomSchema,
    updateRoomSchema,
} from '../middlewares/zod-schemas/room.schema';

export const publicRoomRoute = express.Router();

publicRoomRoute.route('/')

publicRoomRoute.route('/:roomUuid')

export const roomRouter = express.Router({
    mergeParams: true,
});

roomRouter.route('/')
    .get(authenticateToken,authorize(READ_ORGANIZATION_ROOMS),validateQuery(queryRoomSchema), handleGetOrganizationRooms)
    .post(authenticateToken, authorize(CREATE_ROOM), validateBody(createRoomSchema), handleCreateOrganizationRoom);

roomRouter.route('/:roomUuid')
    .get(authenticateToken,authorize(READ_ORGANIZATION_ROOMS),validateParameter(validateUuid, 'roomUuid'), handleGetOrganizationRoom)
    .patch(authenticateToken, authorize(UPDATE_ROOM), validateParameter(validateUuid, 'roomUuid'), validateBody(updateRoomSchema), handleUpdateOrganizationRoom);
