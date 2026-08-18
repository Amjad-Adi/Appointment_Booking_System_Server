import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location.model";
import {InvitationStatus} from "../../models/enums/invitation-status";
import {inviteUserSchema} from "./user.schema";
import {CreateInvitation} from "../../models/invitation.model";
export const createInvitationSchema=inviteUserSchema.extend({
    expiresAtUTC:z.iso.datetime({offset:true}),
}).strict()

export const updateInvitationSchema=z.object({
    status:z.enum(InvitationStatus).optional()
}).strict()