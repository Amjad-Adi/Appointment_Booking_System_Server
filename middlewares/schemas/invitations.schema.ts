import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location.model";
import {InvitationStatus} from "../../models/enums/invitation-status";
export const createInvitationSchema=z.object({
    title:z.string().trim().nonempty().max(256),
    body:z.string().trim().max(4096).nonempty().optional(),
    recipientUuid:z.uuid(),
    expiresAtUTC:z.coerce.date().min(new Date()),
}).strict()

export const updateInvitationSchema=z.object({
    title:z.string().trim().nonempty().max(256),
    body:z.string().trim().max(4096).nonempty().optional(),
    status:z.enum(InvitationStatus).optional()
}).strict()