import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status.js"
import {Role} from "../../models/enums/roles.js"
import {CreateLocation} from "../../models/location.model.js";
import {InvitationStatus} from "../../models/enums/invitation-status.js";
import {inviteUserSchema} from "./user.schema.js";
import {CreateInvitation} from "../../models/invitation.model.js";
export const createInvitationSchema=inviteUserSchema.extend({
    expiresAtUTC:z.iso.datetime({offset:true}),
}).strict()

export const updateInvitationSchema=z.object({
    status:z.enum(InvitationStatus).optional()
}).strict()