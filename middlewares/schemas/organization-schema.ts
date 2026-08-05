import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location";
import {createLocationSchema, updateLocationSchema} from "./location-schema";
export let createOrganizationSchema=z.object({
    name:z.string().max(256).nonempty(),
    email:z.email(),
    phoneNumber:z.e164(),
    bio:z.string().max(4096).nonempty(),
    location:createLocationSchema,
    profilePicturePath:z.string().nonempty().default("DEFAULT_PICTURE_PATH")
}).strict()

export let updateOrganizationSchema=z.object({
    name:z.string().max(256).nonempty().optional(),
    bio:z.string().max(4096).nonempty().optional(),
    location:updateLocationSchema.optional(),
    profilePicturePath:z.string().nonempty().optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();

export let updateOrganizationByAdminSchema=z.object({
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();