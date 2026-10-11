import { z } from 'zod';
import { ActivationStatus } from '../../models/enums/activation-status';
import { createLocationSchema, updateLocationSchema } from './location.schema';
import { querySchema } from './query.schema';
import { SORT_BY_CREATED_AT_UTC, SORT_BY_NAME, SORT_BY_UPDATED_AT_UTC } from '../../databases/contracts/organization.contract';

export const createOrganizationSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Organization Name is required'}).max(256, { error: 'Organization Name must be at most 256 characters'}),
    email: z.email({ error: 'Invalid email address'}),
    phoneNumber: z.e164({ error: 'Invalid phone number'}),
    bio: z.string().trim().nonempty({ error: 'Bio cannot be empty'}).max(4096, { error: 'Bio must be at most 4096 characters'}).optional(),
    location: createLocationSchema.optional(),
}).strict();

export const updateOrganizationSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Organization Name is required'}).max(256, { error: 'Organization Name must be at most 256 characters'}).optional(),
    bio: z.string().trim().nonempty({ error: 'Bio cannot be empty'}).max(4096, { error: 'Bio must be at most 4096 characters'}).optional(),
    phoneNumber: z.e164({ error: 'Invalid phone number'}).optional(),
    location: updateLocationSchema.optional(),
}).strict().refine((data)=>(Object.keys(data).length !== 0),{ message: "At least one field must be provided"});

export const updateOrganizationByAdminSchema = z.object({
    status: z.enum(ActivationStatus, { error: 'Invalid activation status'}),
}).strict();

export const organizationFilterSchema = z.object({
    status: z.enum(ActivationStatus, { error: 'Invalid activation status filter'}).optional(),
}).strict();

export const queryOrganizationSchema = querySchema
    .extend({
        search: z.string().trim().nonempty({ error: 'Search cannot be empty'}).max(320, { error: 'Search must be at most 320 characters'}).optional(),
        filter: organizationFilterSchema.optional(),
        sortBy: z.enum([SORT_BY_NAME, SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC], { error: 'Invalid sort field'}).optional(),
    })
    .strict();

export const createOrganizationByAdminSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Organization Name is required'}).max(256, { error: 'Organization Name must be at most 256 characters'}),
    email: z.email({ error: 'Invalid email address'}),
    phoneNumber: z.e164({ error: 'Invalid phone number'}),
    bio: z.string().trim().nonempty({ error: 'Bio cannot be empty'}).max(4096, { error: 'Bio must be at most 4096 characters'}).optional(),
    location: createLocationSchema,
    userEmail: z.email({ error: 'Invalid user email address'}),
}).strict();