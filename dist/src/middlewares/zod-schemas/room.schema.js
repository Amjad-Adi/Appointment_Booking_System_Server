"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRoomSchema = exports.roomFilterSchema = exports.updateRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const room_occupancy_status_js_1 = require("../../models/enums/room-occupancy-status.js");
const query_schema_js_1 = require("./query.schema.js");
const room_contract_js_1 = require("../../databases/contracts/room.contract.js");
exports.createRoomSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256),
    description: zod_1.z
        .string()
        .trim()
        .max(4096, 'Description must not exceed 4096 characters')
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .optional(),
}).strict();
exports.updateRoomSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256).optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(4096, 'Description must not exceed 4096 characters')
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .optional(),
    assignedUserUuid: zod_1.z.uuid().nullable().optional(),
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional(),
    occupancyStatus: zod_1.z.enum(room_occupancy_status_js_1.RoomOccupancyStatus).optional(),
}).strict();
exports.roomFilterSchema = zod_1.z.object({
    organizationUuid: zod_1.z.uuid('Invalid organization UUID').optional(),
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional(),
    occupancyStatus: zod_1.z.enum(room_occupancy_status_js_1.RoomOccupancyStatus).optional(),
}).strict();
exports.queryRoomSchema = query_schema_js_1.querySchema.extend({
    search: zod_1.z.string().trim().nonempty().max(256).optional(),
    filter: exports.roomFilterSchema.optional(),
    sortBy: zod_1.z.enum([room_contract_js_1.SORT_BY_NAME, room_contract_js_1.SORT_BY_CREATED_AT_UTC,]).optional(),
}).strict();
