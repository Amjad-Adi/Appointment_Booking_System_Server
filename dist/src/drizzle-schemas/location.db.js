"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const location_contract_js_1 = require("../databases/contracts/location.contract.js");
exports.locationTable = (0, pg_core_1.pgTable)(location_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 256 }).notNull(),
    createdAtUTC: (0, pg_core_1.timestamp)(location_contract_js_1.COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(location_contract_js_1.COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    locationOnMaP: (0, pg_core_1.geometry)(location_contract_js_1.COLUMN_LOCATION_ON_MAP, { type: "point", srid: 4326 }).notNull(),
});
