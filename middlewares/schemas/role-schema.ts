import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
export let getRoleValidation=z.object({
    id:z.bigint(),
    uuid:z.uuid(),
    name:z.string().nonempty().max(128),
    status:z.nativeEnum(ActivationStatus)
}).strict();

export let createRoleValidation=z.object({
    name:z.string().nonempty().max(128),
}).strict();

export let updateRoleValidation=z.object({
    name:z.string().nonempty().max(128),
    status:z.nativeEnum(ActivationStatus)
}).strict();