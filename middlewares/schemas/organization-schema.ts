import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location";
import {createLocationSchema, updateLocationSchema} from "./location-schema";
export let createOrganizationSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    email:z.email(),
    phoneNumber:z.e164(),
    bio:z.string().trim().max(4096).nonempty(),
    location:createLocationSchema,
    profilePicturePath:z.string().trim().nonempty().default("DEFAULT_PICTURE_PATH")
}).strict()

export let updateOrganizationSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    bio:z.string().trim().nonempty().max(4096).optional(),
    location:updateLocationSchema.optional(),
    profilePicturePath:z.string().trim().nonempty().optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();

export let updateOrganizationByAdminSchema=z.object({
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();