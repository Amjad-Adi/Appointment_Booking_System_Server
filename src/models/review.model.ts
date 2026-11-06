import { z } from 'zod';

import {
    createReviewSchema,
    queryReviewSchema,
    updateReviewSchema,
} from '../middlewares/zod-schemas/review.schema';

import { DataResponses } from './query.model';

export interface Review {
    uuid: string;
    rating: number;
    comment: string;
    createdAtUTC: Date;
    updatedAtUTC: Date;
}

export interface ReviewResponse extends Review, DataResponses {
    customerUuid: string;
    customerFirstName: string;
    customerLastName: string;
    customerProfilePicturePath: string | null;
    appointmentUuid: string;
    scheduledStartAtUTC: Date;
    serviceUuid: string;
    serviceName: string;
    organizationUuid: string;
    organizationName: string;
}

export type CreateReview = z.infer<typeof createReviewSchema> & { userUuid: string };

export type UpdateReview = z.infer<typeof updateReviewSchema> & { uuid: string; userUuid: string };

export type QueryReview = z.infer<typeof queryReviewSchema> & {
    offset: number;
    userUuid?: string;
    serviceUuid?: string;
    organizationUuid?: string;
};
