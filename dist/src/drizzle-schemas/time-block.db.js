"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeBlockTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const time_block_contract_js_1 = require("../databases/contracts/time-block.contract.js");
const enums_js_1 = require("./enums.js");
const users_db_js_1 = require("./users.db.js");
const organizations_db_js_1 = require("./organizations.db.js");
const time_block_status_js_1 = require("../models/enums/time-block-status.js");
exports.timeBlockTable = (0, pg_core_1.pgTable)(time_block_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    uuid: (0, pg_core_1.uuid)()
        .defaultRandom()
        .unique()
        .notNull(),
    reason: (0, pg_core_1.varchar)({ length: 4096 }),
    startAtUTC: (0, pg_core_1.timestamp)(time_block_contract_js_1.COLUMN_START_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }).notNull(),
    endAtUTC: (0, pg_core_1.timestamp)(time_block_contract_js_1.COLUMN_END_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }).notNull(),
    requestUserId: (0, pg_core_1.bigint)(time_block_contract_js_1.COLUMN_REQUEST_USER_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => users_db_js_1.usersTable.id),
    respondUserId: (0, pg_core_1.bigint)(time_block_contract_js_1.COLUMN_RESPOND_USER_ID, {
        mode: "number",
    })
        .references(() => users_db_js_1.usersTable.id),
    organizationId: (0, pg_core_1.bigint)(time_block_contract_js_1.COLUMN_ORGANIZATION_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => organizations_db_js_1.organizationTable.id),
    requestedAtUTC: (0, pg_core_1.timestamp)(time_block_contract_js_1.COLUMN_REQUESTED_AT_UTC, {
        withTimezone: true,
        mode: "string",
    })
        .notNull()
        .defaultNow(),
    respondedAtUTC: (0, pg_core_1.timestamp)(time_block_contract_js_1.COLUMN_RESPONDED_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }),
    requestStatus: (0, enums_js_1.timeBlockStatusEnum)(time_block_contract_js_1.COLUMN_REQUEST_STATUS)
        .notNull()
        .default(time_block_status_js_1.TimeBlockStatus.PENDING),
});
