import type { Request, Response } from 'express';

import {
    createReview,
    deleteReview,
    getNumberOfReviews,
    getReviews,
    updateReview,
} from '../services/review.service';

import { CreateReview, QueryReview, UpdateReview } from '../models/review.model';
import { QueryResponse } from '../models/query.model';

async function buildPaginatedResponse(req: Request, res: Response, query: QueryReview) {
    query.offset = (query.page - 1) * query.limit;
    const [reviews, totalReviews] = await Promise.all([
        getReviews(query),
        getNumberOfReviews(query),
    ]);
    const baseUrl = req.originalUrl.split('?')[0];
    return res.status(200).json(
        new QueryResponse(reviews, totalReviews, baseUrl, query.page, query.limit),
    );
}

export async function handleGetMyReviews(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryReview;
    query.userUuid = req.user?.uuid as string;
    return buildPaginatedResponse(req, res, query);
}

export async function handleGetServiceReviews(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryReview;
    query.serviceUuid = req.params.serviceUuid as string;
    return buildPaginatedResponse(req, res, query);
}

export async function handleGetOrganizationReviews(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryReview;
    query.organizationUuid = req.params.organizationUuid as string;
    return buildPaginatedResponse(req, res, query);
}

export async function handleCreateReview(req: Request, res: Response) {
    const review: CreateReview = {
        ...req.body,
        userUuid: req.user?.uuid as string,
    };
    const result = await createReview(review);
    return res.status(201).json(result);
}

export async function handleUpdateReview(req: Request, res: Response) {
    const review: UpdateReview = {
        ...req.body,
        uuid: req.params.reviewUuid as string,
        userUuid: req.user?.uuid as string,
    };
    const result = await updateReview(review);
    return res.status(200).json(result);
}

export async function handleDeleteReview(req: Request, res: Response) {
    await deleteReview(req.params.reviewUuid as string, req.user?.uuid as string);
    return res.status(204).send();
}
