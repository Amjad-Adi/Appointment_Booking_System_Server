"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
const enums_js_1 = require("./enums.js");
exports.organizationTable = (0, pg_core_1.pgTable)(organization_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uuid: (0, pg_core_1.uuid)().defaultRandom().unique().notNull(),
    name: (0, pg_core_1.varchar)({ length: 256 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 320 }).unique().notNull(),
    phoneNumber: (0, pg_core_1.varchar)(organization_contract_js_1.COLUMN_PHONE_NUMBER, { length: 20 }),
    bio: (0, pg_core_1.varchar)({ length: 4096 }),
    locationId: (0, pg_core_1.bigint)({ mode: "number" }),
    profilePicturePath: (0, pg_core_1.text)(organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH).default('PROFILE PICTURE PATH'),
    createdAtUTC: (0, pg_core_1.timestamp)(organization_contract_js_1.COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(organization_contract_js_1.COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: (0, enums_js_1.activationStatusEnum)()
});
