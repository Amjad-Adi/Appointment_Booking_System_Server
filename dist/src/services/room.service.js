"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRooms = getRooms;
exports.getNumberOfRooms = getNumberOfRooms;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.updateRoom = updateRoom;
exports.getRoomIdByUuid = getRoomIdByUuid;
exports.getRoomIdByUserUuid = getRoomIdByUserUuid;
const room_repository_js_1 = require("../repositories/room.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const user_service_js_1 = require("./user.service.js");
async function getRooms(query) {
    return (0, room_repository_js_1.findAll)(query);
}
async function getNumberOfRooms(query) {
    return (0, room_repository_js_1.countAll)(query);
}
async function getRoom(roomUuid, organizationUuid) {
    const result = await (0, room_repository_js_1.findByUuid)(roomUuid, organizationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Room");
    }
    return result;
}
async function createRoom(room, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, room.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(room.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    room.organizationId = organizationId;
    if (await (0, room_repository_js_1.isNameFound)(room.organizationUuid, room.name)) {
        throw new conflict_error_js_1.ConflictError();
    }
    const result = await (0, room_repository_js_1.create)(room);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateRoom(room) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(room.userUuid, room.organizationUuid);
    if (room.assignedUserUuid !== undefined) {
        if (room.assignedUserUuid === null) {
            room.assignedUserId = null;
        }
        else {
            room.assignedUserId = await (0, user_service_js_1.getUserIdByUuid)(room.assignedUserUuid);
            if (room.assignedUserId === undefined) {
                throw new not_found_error_js_1.NotFoundError('User');
            }
        }
    }
    const result = await (0, room_repository_js_1.update)(room);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError('Room');
    }
    return result;
}
async function getRoomIdByUuid(roomUuid, organizationUuid) {
    const result = await (0, room_repository_js_1.findIdByUuid)(roomUuid, organizationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Room");
    }
    return result;
}
async function getRoomIdByUserUuid(userUuid, organizationUuid) {
    const result = await (0, room_repository_js_1.findIdByUserUuid)(userUuid, organizationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Room");
    }
    return result;
}
