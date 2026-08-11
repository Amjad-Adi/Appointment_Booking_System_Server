import { z} from "zod"
export const validateUuid=z.object({
    uuid:z.uuid()
});