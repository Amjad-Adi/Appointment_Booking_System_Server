import express from 'express';

import {
    validateBody,
    validateParameter,
    validateQuery,
} from '../middlewares/validaiton.js';

import {
    handleGetOrganizationRooms,
    handleUpdateOrganizationRoom,
    handleCreateOrganizationRoom,
    handleGetOrganizationRoom,
} from '../controllers/room.controller.js';

import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller.js';

import { authorize } from '../middlewares/authorization/authorization.js';

import {
    CREATE_ROOM,
    READ_ROOM,
    UPDATE_ROOM,
} from '../permissions/permissions.js';

import { validateUuid } from '../middlewares/zod-schemas/parameters.schema.js';

import {
    createRoomSchema,
    queryRoomSchema,
    updateRoomSchema,
} from '../middlewares/zod-schemas/room.schema.js';

export const publicRoomRoute = express.Router();

publicRoomRoute.route('/')

publicRoomRoute.route('/:roomUuid')

export const roomRouter = express.Router({
    mergeParams: true,
});

roomRouter.route('/')
    .get(authenticateToken,validateQuery(queryRoomSchema), handleGetOrganizationRooms,)
    .post(authenticateToken, authorize(CREATE_ROOM), validateBody(createRoomSchema), handleCreateOrganizationRoom,);

roomRouter.route('/:roomUuid')
    .get(authenticateToken,validateParameter(validateUuid, 'roomUuid'), handleGetOrganizationRoom,)
    .patch(authenticateToken, authorize(UPDATE_ROOM), validateParameter(validateUuid, 'roomUuid'), validateBody(updateRoomSchema), handleUpdateOrganizationRoom,);
