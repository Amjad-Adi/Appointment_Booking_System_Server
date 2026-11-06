"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceJunctionCategorySchema = exports.createServiceJunctionCategorySchema = void 0;
const zod_1 = require("zod");
exports.createServiceJunctionCategorySchema = zod_1.z.object({
    serviceUuid: zod_1.z.uuid({ error: "Invalid service UUID" }),
    serviceCategoryUuids: zod_1.z.array(zod_1.z.uuid({ error: "Invalid service category UUID" })).min(1, { error: "At least one service category is required" })
        .refine((uuids) => new Set(uuids).size === uuids.length, { error: "Service category UUIDs must be unique" }),
}).strict();
exports.updateServiceJunctionCategorySchema = zod_1.z.object({
    serviceUuid: zod_1.z.uuid({ error: "Invalid service UUID" }),
    serviceCategoryUuids: zod_1.z.array(zod_1.z.uuid({ error: "Invalid service category UUID" })).min(1, { error: "At least one service category is required" })
        .refine((uuids) => new Set(uuids).size === uuids.length, { error: "Service category UUIDs must be unique" }),
}).strict();
