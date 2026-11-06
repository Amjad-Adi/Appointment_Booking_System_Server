"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizationRooms = handleGetOrganizationRooms;
exports.handleGetOrganizationRoom = handleGetOrganizationRoom;
exports.handleCreateOrganizationRoom = handleCreateOrganizationRoom;
exports.handleUpdateOrganizationRoom = handleUpdateOrganizationRoom;
const room_service_js_1 = require("../services/room.service.js");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetOrganizationRooms(req, res) {
    const routeOrganizationUuid = req.params.organizationUuid;
    const query = req.validatedQuery;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid;
    if (organizationUuid !== null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [rooms, totalNumberOfRooms] = await Promise.all([(0, room_service_js_1.getRooms)(query), (0, room_service_js_1.getNumberOfRooms)(query),]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(rooms, totalNumberOfRooms, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetOrganizationRoom(req, res) {
    const roomUuid = req.params.roomUuid;
    const organizationUuid = req.user?.organizationUuid;
    const result = await (0, room_service_js_1.getRoom)(roomUuid, organizationUuid);
    return res.status(200).json(result);
}
async function handleCreateOrganizationRoom(req, res) {
    const room = req.body;
    room.organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, room_service_js_1.createRoom)(room, userUuid);
    return res.status(201).json(result);
}
async function handleUpdateOrganizationRoom(req, res) {
    const room = req.body;
    room.uuid = req.params.roomUuid;
    room.organizationUuid = req.params.organizationUuid;
    room.userUuid = req.user?.uuid;
    const result = await (0, room_service_js_1.updateRoom)(room);
    return res.status(200).json(result);
}
