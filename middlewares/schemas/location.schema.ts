import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
const longitudeMinRange=-180
const longitudeMaxRange=180
const latitudeMinRange=-90
const latitudeMaxRange=90
export const createLocationSchema=z.object({
    name:z.string().trim().nonempty().max(1024),
    locationOnMap:z.tuple([z.number().min(longitudeMinRange).max(longitudeMaxRange),
        z.number().min(latitudeMinRange).max(latitudeMaxRange)]),
}).strict()

export const updateLocationSchema=z.object({
    name:z.string().trim().nonempty().max(1024).optional(),
    locationOnMap:z.tuple([z.number().min(longitudeMinRange).max(longitudeMaxRange),
        z.number().min(latitudeMinRange).max(latitudeMaxRange)]).optional(),
}).strict();
