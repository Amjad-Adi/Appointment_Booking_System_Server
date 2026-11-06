import express from 'express';

import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import {
    handleCreateReview,
    handleDeleteReview,
    handleGetMyReviews,
    handleGetOrganizationReviews,
    handleGetServiceReviews,
    handleUpdateReview,
} from '../controllers/review.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { validateBody, validateParameter, validateQuery } from '../middlewares/validaiton';
import { createReviewSchema, queryReviewSchema, updateReviewSchema } from '../middlewares/zod-schemas/review.schema';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';
import {
    CREATE_REVIEW,
    DELETE_OWN_REVIEW,
    UPDATE_OWN_REVIEW,
    VIEW_REVIEWS,
} from '../permissions/permissions';

export const reviewRouter = express.Router();

reviewRouter.route('/')
    .get(authenticateToken, authorize(VIEW_REVIEWS), validateQuery(queryReviewSchema), handleGetMyReviews)
    .post(authenticateToken, authorize(CREATE_REVIEW), validateBody(createReviewSchema), handleCreateReview);

reviewRouter.route('/:reviewUuid')
    .patch(
        authenticateToken,
        authorize(UPDATE_OWN_REVIEW),
        validateParameter(validateUuid, 'reviewUuid'),
        validateBody(updateReviewSchema),
        handleUpdateReview,
    )
    .delete(
        authenticateToken,
        authorize(DELETE_OWN_REVIEW),
        validateParameter(validateUuid, 'reviewUuid'),
        handleDeleteReview,
    );

export const serviceReviewRouter = express.Router({ mergeParams: true });

serviceReviewRouter.route('/')
    .get(
        validateParameter(validateUuid, 'serviceUuid'),
        validateQuery(queryReviewSchema),
        handleGetServiceReviews,
    );

export const organizationReviewRouter = express.Router({ mergeParams: true });

organizationReviewRouter.route('/')
    .get(
        validateParameter(validateUuid, 'organizationUuid'),
        validateQuery(queryReviewSchema),
        handleGetOrganizationReviews,
    );
