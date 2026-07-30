import {v4 as uuidv4} from "uuid";
import {Status} from "./enums/model-status"

export interface Role {
    id: bigint,
    uuid: string,
    name:string,
    status:Status
}

export interface CreateRole {
    name:string,
}

export interface UpdateRole {
    name:string,
    status:Status
}