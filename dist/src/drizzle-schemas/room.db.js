"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const room_contract_js_1 = require("../databases/contracts/room.contract.js");
const enums_js_1 = require("./enums.js");
const organizations_db_js_1 = require("./organizations.db.js");
const activation_status_js_1 = require("../models/enums/activation-status.js");
const room_occupancy_status_js_1 = require("../models/enums/room-occupancy-status.js");
const users_db_js_1 = require("./users.db.js");
exports.roomTable = (0, pg_core_1.pgTable)(room_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uuid: (0, pg_core_1.uuid)().defaultRandom().unique().notNull(),
    name: (0, pg_core_1.varchar)({ length: 256 }).notNull(),
    description: (0, pg_core_1.varchar)({ length: 4096 }),
    userId: (0, pg_core_1.bigint)(room_contract_js_1.COLUMN_USER_ID, { mode: "number" }).notNull().references(() => users_db_js_1.usersTable.id),
    organizationId: (0, pg_core_1.bigint)(room_contract_js_1.COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizations_db_js_1.organizationTable.id),
    createdAtUTC: (0, pg_core_1.timestamp)(room_contract_js_1.COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(room_contract_js_1.COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: (0, enums_js_1.activationStatusEnum)().default(activation_status_js_1.ActivationStatus.ACTIVE).notNull(),
    occupancyStatus: (0, enums_js_1.occupancyStatusEnum)().default(room_occupancy_status_js_1.RoomOccupancyStatus.AVAILABLE).notNull(),
});
