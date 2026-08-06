import {CREATE_USER_PERMISSION, GET_USERS_PERMISSION} from "./permissions"
export const rolesPermissions=new Map<String, string[]>;
rolesPermissions.set("SUPER ADMIN", [GET_USERS_PERMISSION,CREATE_USER_PERMISSION])