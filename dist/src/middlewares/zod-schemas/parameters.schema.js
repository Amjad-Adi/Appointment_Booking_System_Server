"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUuid = void 0;
const zod_1 = require("zod");
exports.validateUuid = zod_1.z.uuid();
