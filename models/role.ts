import {v4 as uuidv4} from "uuid";
import {ActivationStatus} from "./enums/model-activation-status"

export interface Role {
    id: bigint,
    uuid: string,
    name:string,
    status:ActivationStatus
}

export interface CreateRole {
    name:string,
}

export interface UpdateRole {
    name:string,
    status:ActivationStatus
}