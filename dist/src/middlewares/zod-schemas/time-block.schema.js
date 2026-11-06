"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTimeBlockSchema = exports.timeBlockFilterSchema = exports.updateTimeBlockSchema = exports.createTimeBlockSchema = void 0;
const zod_1 = require("zod");
const time_block_status_js_1 = require("../../models/enums/time-block-status.js");
const query_schema_1 = require("./query.schema");
const time_block_contract_1 = require("../../databases/contracts/time-block.contract");
exports.createTimeBlockSchema = zod_1.z.object({
    reason: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(4096),
    startAtUTC: zod_1.z.iso.datetime({
        offset: true,
    }),
    endAtUTC: zod_1.z.iso.datetime({
        offset: true,
    }),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.startAtUTC >= data.endAtUTC) {
        ctx.addIssue({
            code: "custom",
            path: ["endAtUTC"],
            message: "End time must be after start time",
        });
    }
});
exports.updateTimeBlockSchema = zod_1.z.object({
    requestStatus: zod_1.z.enum(time_block_status_js_1.TimeBlockStatus),
}).strict();
exports.timeBlockFilterSchema = zod_1.z.object({
    organizationUuid: zod_1.z.uuid().optional(),
    requestStatus: zod_1.z.enum(time_block_status_js_1.TimeBlockStatus).optional(),
    requestUserUuid: zod_1.z.uuid("Invalid request user UUID").optional(),
    respondUserUuid: zod_1.z.uuid("Invalid response user UUID").optional(),
    fromDate: zod_1.z.iso.date().optional(),
    toDate: zod_1.z.iso.date().optional(),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.fromDate !== undefined &&
        data.toDate !== undefined &&
        data.fromDate > data.toDate) {
        ctx.addIssue({
            code: "custom",
            path: ["toDate"],
            message: "To date must be after or equal to from date",
        });
    }
});
exports.queryTimeBlockSchema = query_schema_1.querySchema.extend({
    search: zod_1.z.string().trim().max(256).optional(),
    filter: exports.timeBlockFilterSchema.optional(),
    sortBy: zod_1.z.enum([
        time_block_contract_1.SORT_BY_START_AT_UTC,
        time_block_contract_1.SORT_BY_END_AT_UTC,
        time_block_contract_1.SORT_BY_REQUESTED_AT_UTC,
        time_block_contract_1.SORT_BY_RESPONDED_AT_UTC,
        time_block_contract_1.SORT_BY_REQUEST_STATUS,
    ]),
}).strict();
