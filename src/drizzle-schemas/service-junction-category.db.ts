import { pgTable, bigint, primaryKey } from "drizzle-orm/pg-core";
import { serviceCategoryTable } from "./service-categories.db";
import { serviceTable } from "./services.db";
import { COLUMN_SERVICE_CATEGORY_ID, COLUMN_SERVICE_ID } from '../databases/contracts/service-junction-category.contract';

export const serviceJunctionCategoryTable = pgTable("service_junction_category", {
    serviceCategoryId: bigint(COLUMN_SERVICE_CATEGORY_ID, { mode: "number" }).notNull().references(() => serviceCategoryTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    serviceId: bigint(COLUMN_SERVICE_ID, { mode: "number" }).notNull().references(() => serviceTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
}, (table) => [
    primaryKey({ columns: [table.serviceCategoryId, table.serviceId] }),
]);