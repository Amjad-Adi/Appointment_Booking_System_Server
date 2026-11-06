import type { Request, Response } from 'express';

import {
    addFavourite,
    getFavourites,
    getNumberOfFavourites,
    removeFavourite,
} from '../services/favourite.service';

import { CreateFavourite, QueryFavourite } from '../models/favourite.model';
import { QueryResponse } from '../models/query.model';

export async function handleGetFavourites(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryFavourite;
    query.offset = (query.page - 1) * query.limit;
    query.userUuid = req.user?.uuid as string;

    const [favourites, totalFavourites] = await Promise.all([
        getFavourites(query),
        getNumberOfFavourites(query),
    ]);

    const baseUrl = req.originalUrl.split('?')[0];
    const responseResult = new QueryResponse(
        favourites,
        totalFavourites,
        baseUrl,
        query.page,
        query.limit,
    );

    return res.status(200).json(responseResult);
}

export async function handleAddFavourite(req: Request, res: Response) {
    const favourite: CreateFavourite = {
        ...req.body,
        userUuid: req.user?.uuid as string,
    };

    await addFavourite(favourite);

    return res.status(201).json({
        serviceUuid: favourite.serviceUuid,
        isFavourite: true,
    });
}

export async function handleRemoveFavourite(req: Request, res: Response) {
    await removeFavourite(req.user?.uuid as string, req.params.serviceUuid as string);
    return res.status(204).send();
}
