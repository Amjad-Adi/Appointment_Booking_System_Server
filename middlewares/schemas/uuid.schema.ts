import { z} from "zod"
export let validateUuid=z.object({
    uuid:z.uuid()
});