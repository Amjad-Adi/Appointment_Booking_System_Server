"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocationSchema = exports.createLocationSchema = void 0;
const zod_1 = require("zod");
const longitudeMinRange = -180;
const longitudeMaxRange = 180;
const latitudeMinRange = -90;
const latitudeMaxRange = 90;
exports.createLocationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(1024),
    timezone: zod_1.z.string().trim().min(1).max(64),
    locationOnMap: zod_1.z.tuple([zod_1.z.number().min(longitudeMinRange).max(longitudeMaxRange),
        zod_1.z.number().min(latitudeMinRange).max(latitudeMaxRange)]),
}).strict();
exports.updateLocationSchema = exports.createLocationSchema.partial();
