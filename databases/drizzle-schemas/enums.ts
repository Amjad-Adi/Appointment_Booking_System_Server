import {pgEnum} from "drizzle-orm/pg-core";

export const activationStatusEnum=pgEnum("status",["ACTIVE","INACTIVE"])
export const roleEnum=pgEnum("role",["SUPER_ADMIN","OWNER","MANAGER","CRM","WORKER","CUSTOMER"])
export const occupancyStatusEnum=pgEnum("occupancy_status",["OCCUPIED","AVAILABLE"])