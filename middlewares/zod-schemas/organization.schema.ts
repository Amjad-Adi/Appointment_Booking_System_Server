import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location.model";
import {createLocationSchema, updateLocationSchema} from "./location.schema";
export const createOrganizationSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    email:z.email(),
    phoneNumber:z.e164(),
    bio:z.string().trim().max(4096).nonempty().optional(),
    location:createLocationSchema,
    profilePicturePath:z.string().trim().nonempty().optional()
}).strict()

export const updateOrganizationSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    bio:z.string().trim().nonempty().max(4096).optional(),
    phoneNumber:z.e164().optional(),
    location:updateLocationSchema.optional(),
    profilePicturePath:z.string().trim().nonempty().optional(),
    status:z.enum(ActivationStatus).optional()
}).strict();

export const updateOrganizationByAdminSchema=z.object({
    status:z.enum(ActivationStatus).optional()
}).strict();