import { z } from 'zod';

import { ActivationStatus } from '../../models/enums/activation-status.js';

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_NAME,
} from '../../databases/contracts/service-category.contract.js';

import { querySchema } from './query.schema.js';

export const createServiceCategorySchema = z.object({
    name: z.string().trim().nonempty({error: 'Name is required',}).max(256, {error: 'Name must be at most 256 characters',}),
    description: z.string().trim().max(4096, {error: 'Description must be at most 4096 characters',}).optional(),
    picturePath: z.string().trim().nonempty({error: 'Profile picture path cannot be empty',}).optional(),
}).strict();

export const updateServiceCategorySchema = z.object({
    name: z.string().trim().nonempty({error: 'Name cannot be empty',}).max(256, {error: 'Name must be at most 256 characters',}).optional(),
    description: z.string().trim().max(4096, {error: 'Description must be at most 4096 characters',}).optional(),
    picturePath: z.string().trim().nonempty({error: 'Profile picture path cannot be empty',}).optional(),
    status: z.enum(ActivationStatus, {error: 'Invalid activation status',}).optional(),
}).strict();

export const serviceCategoryFilterSchema = z.object({
    status: z.enum(ActivationStatus, {error: 'Invalid activation status filter',}).optional(),
}).strict();

export const queryServiceCategorySchema = querySchema.extend({
    search: z.string().trim().nonempty({error: 'Search cannot be empty',}).max(320, {error: 'Search must be at most 320 characters',}).optional(),
    filter: serviceCategoryFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_CREATED_AT_UTC], {error: 'Invalid sort field',},).optional(),
}).strict();