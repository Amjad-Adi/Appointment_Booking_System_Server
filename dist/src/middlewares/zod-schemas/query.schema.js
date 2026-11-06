"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySchema = void 0;
const zod_1 = require("zod");
const order_js_1 = require("../../models/enums/order.js");
const query_model_js_1 = require("../../models/query.model.js");
exports.querySchema = zod_1.z.object({
    order: zod_1.z.enum(order_js_1.Order).optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(query_model_js_1.DEFAULT_PAGE),
    limit: zod_1.z.coerce.number().int().positive().max(1000).optional().default(query_model_js_1.DEFAULT_LIMIT),
}).strict();
