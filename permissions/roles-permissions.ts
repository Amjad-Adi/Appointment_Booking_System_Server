import {
    READ_USERS,
    READ_CURRENT_USER,
    WRITE_USER_AS_ADMIN,
    CREATE_USER,
    WRITE_CURRENT_USER
} from "./permissions"
export const rolesPermissions=new Map<String, string[]>;
rolesPermissions.set("SUPER ADMIN", [WRITE_USER_AS_ADMIN,CREATE_USER,READ_CURRENT_USER,READ_USERS])
rolesPermissions.set("CUSTOMER", [READ_CURRENT_USER,WRITE_CURRENT_USER])