import { z } from 'zod';
import { ActivationStatus } from '../../models/enums/activation-status';
import { RoomOccupancyStatus } from '../../models/enums/room-occupancy-status';
import { querySchema } from './query.schema';
import { SORT_BY_NAME, SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC } from '../../databases/contracts/room.contract';

export const createRoomSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Room Name is required'}).max(256, { error: 'Room Name must be at most 256 characters'}),
    description: z.string().trim().max(4096, { error: 'Description must be at most 4096 characters'}).optional(),
    assignedUserUuid: z.uuid({ error: 'Invalid assigned user UUID'}).nullable().optional(),
}).strict();

export const updateRoomSchema = z.object({
    name: z.string().trim().nonempty({ error: 'Room Name is required'}).max(256, { error: 'Room Name must be at most 256 characters'}).optional(),
    description: z.string().trim().nonempty({ error: 'Description cannot be empty'}).max(4096, { error: 'Description must be at most 4096 characters'}).optional(),
    assignedUserUuid: z.uuid({ error: 'Invalid assigned user UUID'}).nullable().optional(),
    status: z.enum(ActivationStatus, { error: 'Invalid activation status'}).optional(),
    occupancyStatus: z.enum(RoomOccupancyStatus, { error: 'Invalid room occupancy status'}).optional(),
}).strict().refine((data) => (Object.keys(data).length !== 0), { message: "At least one field must be provided"});

export const roomFilterSchema = z.object({
    organizationUuid: z.uuid({ error: 'Invalid organization UUID'}).optional(),
    status: z.enum(ActivationStatus, { error: 'Invalid activation status filter'}).optional(),
    occupancyStatus: z.enum(RoomOccupancyStatus, { error: 'Invalid room occupancy status filter'}).optional(),
}).strict();

export const queryRoomSchema = querySchema.extend({
    search: z.string().trim().nonempty({ error: 'Search cannot be empty'}).max(256, { error: 'Search must be at most 256 characters'}).optional(),
    filter: roomFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC], { error: 'Invalid sort field'}).optional(),
}).strict();