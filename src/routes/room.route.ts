import express from "express";
import {validateBody, validateParameter, validateQuery} from "../middlewares/validaiton.js";
import {handleGetOrganizationRooms,handleUpdateOrganizationRoom,handleCreateOrganizationRoom,handleGetOrganizationRoom} from "../controllers/room.controller.js";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {CREATE_ROOM, READ_ROOM, UPDATE_ROOM} from "../permissions/permissions.js";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema.js";
import {createRoomSchema, updateRoomSchema} from "../middlewares/zod-schemas/room.schema.js";
import {queryServiceSchema} from "../middlewares/zod-schemas/service.schema.js";
export const roomRouter=express.Router({mergeParams:true});
roomRouter.route("/")
    .get(authenticateToken,authorize(READ_ROOM),handleGetOrganizationRooms)
    .post(authenticateToken,authorize(CREATE_ROOM),validateBody(createRoomSchema),handleCreateOrganizationRoom)

roomRouter.route("/:roomUuid")
    .get(authenticateToken,authorize(READ_ROOM),validateParameter(validateUuid,"roomUuid"),handleGetOrganizationRoom)
    .patch(authenticateToken,authorize(UPDATE_ROOM),validateParameter(validateUuid,"roomUuid"),validateBody(updateRoomSchema),handleUpdateOrganizationRoom)