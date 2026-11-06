"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingHoursTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const working_hours_contract_js_1 = require("../databases/contracts/working-hours.contract.js");
const organizations_db_1 = require("./organizations.db");
exports.workingHoursTable = (0, pg_core_1.pgTable)(working_hours_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)(working_hours_contract_js_1.COLUMN_ID, { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: (0, pg_core_1.uuid)(working_hours_contract_js_1.COLUMN_UUID).defaultRandom().unique().notNull(),
    organizationId: (0, pg_core_1.bigint)(working_hours_contract_js_1.COLUMN_ORGANIZATION_ID, { mode: 'number' }).notNull().references(() => organizations_db_1.organizationTable.id, { onDelete: 'cascade', onUpdate: 'cascade', }),
    dayOfWeek: (0, pg_core_1.varchar)(working_hours_contract_js_1.COLUMN_DAY_OF_WEEK, { length: 10 }).$type().notNull(),
    startTime: (0, pg_core_1.time)(working_hours_contract_js_1.COLUMN_START_TIME, { withTimezone: false, }),
    endTime: (0, pg_core_1.time)(working_hours_contract_js_1.COLUMN_END_TIME, { withTimezone: false, }),
}, (table) => [
    (0, pg_core_1.unique)("working_hours_org_day_unique").on(table.organizationId, table.dayOfWeek),
]);
