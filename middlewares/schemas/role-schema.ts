import { z} from "zod"
import {Status} from "../../models/enums/model-status"
export let roleValidation=z.object({
    id:z.bigint(),
    uuid:z.uuid(),
    name:z.string().nonempty().max(128).nullish(),
    status:z.nativeEnum(Status)
});