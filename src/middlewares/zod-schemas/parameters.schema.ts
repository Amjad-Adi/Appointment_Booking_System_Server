import { z} from "zod"
export const validateUuid = z.uuid({ error: 'Invalid UUID'});