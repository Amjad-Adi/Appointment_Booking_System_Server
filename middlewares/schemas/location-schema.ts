import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
const longitudeMinRange=-180
const longitudeMaxRange=180
const latitudeMinRange=-90
const latitudeMaxRange=90
export let createLocationSchema=z.object({
    name:z.string().nonempty().max(1024),
    locationOnMap:z.tuple([z.number().min(longitudeMinRange).max(longitudeMaxRange),
        z.number().min(latitudeMinRange).max(latitudeMaxRange)]),
    createdATUTC:z.iso.datetime().default(new Date().toISOString()),
    updatedAtUTC:z.iso.datetime().default(new Date().toISOString()),
}).strict()

export let updateLocationSchema=z.object({
    name:z.string().nonempty().max(1024),
    locationOnMap:z.tuple([z.number().min(longitudeMinRange).max(longitudeMaxRange),
        z.number().min(latitudeMinRange).max(latitudeMaxRange)]),
    updatedAtUTC:z.iso.datetime().default(new Date().toISOString()),
}).strict();
