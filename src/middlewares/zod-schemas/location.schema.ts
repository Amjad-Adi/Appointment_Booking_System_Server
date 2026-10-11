import { z } from 'zod';

const longitudeMinRange = -180;
const longitudeMaxRange = 180;
const latitudeMinRange = -90;
const latitudeMaxRange = 90;

export const createLocationSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Location Name is required'}).max(1024, { error: 'Location Name must be at most 1024 characters'}),
    timezone: z.string().trim().min(1, { error: 'Timezone is required'}).max(64, { error: 'Timezone must be at most 64 characters'}),
    locationOnMap: z.tuple([
        z.number({ error: 'Longitude is required'}).min(longitudeMinRange, { error: `Longitude must be at least ${longitudeMinRange}`}).max(longitudeMaxRange, { error: `Longitude must be at most ${longitudeMaxRange}`}),
        z.number({ error: 'Latitude is required'}).min(latitudeMinRange, { error: `Latitude must be at least ${latitudeMinRange}`}).max(latitudeMaxRange, { error: `Latitude must be at most ${latitudeMaxRange}`}),
    ]),
}).strict();

export const updateLocationSchema = createLocationSchema.partial().refine((data) => (Object.keys(data).length !== 0), {
    message: "At least one field must be provided"
});