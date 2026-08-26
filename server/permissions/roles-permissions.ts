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
    READ_ORGANIZATION_INVITATIONS, CREATE_ORGANIZATION_INVITATIONS
} from "./permissions.js";
import {Role} from "../models/enums/roles.js";
const customerPermissions:string[]=[

]

const workerPermissions:string[]=[
    ...customerPermissions,
]

const crmPermissions:string[]=[
    ...workerPermissions,
]

const managerPermissions:string[]=[
    ...crmPermissions,
    READ_ORGANIZATION_INVITATIONS,
    CREATE_ORGANIZATION_INVITATIONS,
    CREATE_SERVICE,
    UPDATE_SERVICE,
    CREATE_ROOM,
    UPDATE_ROOM
]

const ownerPermissions:string[]=[
    ...managerPermissions,
    CREATE_ORGANIZATION,
    UPDATE_ORGANIZATION,
]

const superAdminPermissions:string[]=[
    ...ownerPermissions,
    UPDATE_USER_AS_ADMIN,
    UPDATE_ORGANIZATION_AS_ADMIN,
    CREATE_USER,
    READ_USERS,
    UPDATE_SERVICE
]
export const rolesPermissions : Record<string, string[]>= {
    [Role.SUPER_ADMIN]: superAdminPermissions,
    [Role.OWNER]: ownerPermissions,
    [Role.MANAGER]: managerPermissions,
    [Role.CRM]: crmPermissions,
    [Role.WORKER]:workerPermissions,
    [Role.CUSTOMER]:customerPermissions
}