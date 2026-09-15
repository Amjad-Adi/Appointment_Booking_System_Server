import {
    READ_USERS,
    CREATE_USER,
    UPDATE_USER_AS_ADMIN,
    UPDATE_ORGANIZATION_AS_ADMIN,
    UPDATE_ORGANIZATION,
    CREATE_ORGANIZATION,
    CREATE_SERVICE,
    CREATE_ROOM,
    UPDATE_ROOM,
    UPDATE_SERVICE,
    READ_ORGANIZATION_INVITATIONS, CREATE_ORGANIZATION_INVITATIONS, CREATE_SERVICE_CATEGORY, UPDATE_WORKING_HOURS
} from "./permissions.js";
import {Role} from "../models/enums/roles.js";
const customerPermissions:string[]=[

]

const workerPermissions:string[]=[

]

const crmPermissions:string[]=[
    READ_USERS,UPDATE_WORKING_HOURS
]

const managerPermissions:string[]=[
    READ_ORGANIZATION_INVITATIONS,
    CREATE_ORGANIZATION_INVITATIONS,
    CREATE_SERVICE,
    UPDATE_SERVICE,
    READ_USERS,
    CREATE_ROOM,
    UPDATE_ROOM,UPDATE_WORKING_HOURS
]

const ownerPermissions:string[]=[
    ...managerPermissions,
    CREATE_ORGANIZATION,
    UPDATE_ORGANIZATION,UPDATE_WORKING_HOURS
]

const superAdminPermissions:string[]=[
    UPDATE_USER_AS_ADMIN,
    UPDATE_ORGANIZATION_AS_ADMIN,
    CREATE_USER,
    READ_USERS,
    CREATE_SERVICE_CATEGORY,
    CREATE_SERVICE_CATEGORY
]
export const rolesPermissions: Record<Role, string[]> = {
    [Role.SUPER_ADMIN]: superAdminPermissions,
    [Role.OWNER]: ownerPermissions,
    [Role.MANAGER]: managerPermissions,
    [Role.CRM]: crmPermissions,
    [Role.WORKER]: workerPermissions,
    [Role.CUSTOMER]: customerPermissions,
};