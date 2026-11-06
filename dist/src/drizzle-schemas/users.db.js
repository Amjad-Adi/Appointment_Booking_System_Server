"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
const enums_js_1 = require("./enums.js");
const organizations_db_js_1 = require("./organizations.db.js");
const activation_status_js_1 = require("../models/enums/activation-status.js");
exports.usersTable = (0, pg_core_1.pgTable)(user_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uuid: (0, pg_core_1.uuid)().defaultRandom().unique().notNull(),
    firstName: (0, pg_core_1.varchar)(user_contract_js_1.COLUMN_FIRST_NAME, { length: 64 }).notNull(),
    lastName: (0, pg_core_1.varchar)(user_contract_js_1.COLUMN_LAST_NAME, { length: 64 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 320 }).notNull().unique(),
    firebaseUid: (0, pg_core_1.varchar)(user_contract_js_1.COLUMN_UID, { length: 128 }).notNull(),
    profilePicturePath: (0, pg_core_1.text)(user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH).notNull().default('PROFILE PICTURE PATH'),
    createdAtUTC: (0, pg_core_1.timestamp)(user_contract_js_1.COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(user_contract_js_1.COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    organizationId: (0, pg_core_1.bigint)(user_contract_js_1.COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizations_db_js_1.organizationTable.id),
    language: (0, pg_core_1.varchar)({ length: 2 }).notNull().default("en"),
    role: (0, enums_js_1.roleEnum)().notNull(),
    status: (0, enums_js_1.activationStatusEnum)().default(activation_status_js_1.ActivationStatus.ACTIVE).notNull(),
});
