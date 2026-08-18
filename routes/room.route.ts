import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {handleGetOrganizationRooms,handleUpdateOrganizationRoom,handleCreateOrganizationRoom,handleGetOrganizationRoom} from "../controllers/room.controller";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {authorize} from "../middlewares/authorization/authorization";
import {CREATE_ROOM, READ_ROOM, UPDATE_ROOM} from "../permissions/permissions";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import {createRoomSchema, updateRoomSchema} from "../middlewares/zod-schemas/room.schema";
export let roomRouter=express.Router({mergeParams:true});
roomRouter.route("/")
    .get(authenticateToken,authorize(READ_ROOM),handleGetOrganizationRooms)
    .post(authenticateToken,authorize(CREATE_ROOM),validateBody(createRoomSchema),handleCreateOrganizationRoom)

roomRouter.route("/:roomUuid")
    .get(authenticateToken,authorize(READ_ROOM),validateParameter(validateUuid,"roomUuid"),handleGetOrganizationRoom)
    .patch(authenticateToken,authorize(UPDATE_ROOM),validateParameter(validateUuid,"roomUuid"),validateBody(updateRoomSchema),handleUpdateOrganizationRoom)