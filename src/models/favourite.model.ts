import { z } from 'zod';

import {
    createFavouriteSchema,
    queryFavouriteSchema,
} from '../middlewares/zod-schemas/favourite.schema';

import { DataResponses } from './query.model';
import type { ServiceResponse } from './service.model';

export interface FavouriteServiceResponse extends ServiceResponse, DataResponses {
    favouritedAtUTC: Date;
    isFavourite: boolean;
    averageRating: number;
    reviewCount: number;
}

export type CreateFavourite = z.infer<typeof createFavouriteSchema> & { userUuid: string };

export type QueryFavourite = z.infer<typeof queryFavouriteSchema> & {
    offset: number;
    userUuid: string;
};
