"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const service_contract_js_1 = require("../databases/contracts/service.contract.js");
const enums_js_1 = require("./enums.js");
const organizations_db_js_1 = require("./organizations.db.js");
const activation_status_js_1 = require("../models/enums/activation-status.js");
exports.serviceTable = (0, pg_core_1.pgTable)(service_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uuid: (0, pg_core_1.uuid)().defaultRandom().unique().notNull(),
    name: (0, pg_core_1.varchar)({ length: 256 }).notNull(),
    description: (0, pg_core_1.varchar)({ length: 4096 }),
    price: (0, pg_core_1.real)().notNull(),
    durationInMinutes: (0, pg_core_1.integer)(service_contract_js_1.COLUMN_DURATION_IN_MINUTES).notNull(),
    picturePath: (0, pg_core_1.text)(service_contract_js_1.COLUMN_PICTURE_PATH).default('PROFILE PICTURE PATH'),
    organizationId: (0, pg_core_1.bigint)(service_contract_js_1.COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizations_db_js_1.organizationTable.id),
    createdAtUTC: (0, pg_core_1.timestamp)(service_contract_js_1.COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(service_contract_js_1.COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: (0, enums_js_1.activationStatusEnum)().default(activation_status_js_1.ActivationStatus.ACTIVE).notNull(),
});
