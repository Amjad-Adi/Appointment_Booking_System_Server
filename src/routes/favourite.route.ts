import express from 'express';

import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import {
    handleAddFavourite,
    handleGetFavourites,
    handleRemoveFavourite,
} from '../controllers/favourite.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { validateBody, validateParameter, validateQuery } from '../middlewares/validaiton';
import { createFavouriteSchema, queryFavouriteSchema } from '../middlewares/zod-schemas/favourite.schema';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';
import { ADD_FAVOURITE, REMOVE_FAVOURITE, VIEW_FAVOURITES } from '../permissions/permissions';

export const favouriteRouter = express.Router();

favouriteRouter.route('/')
    .get(authenticateToken, authorize(VIEW_FAVOURITES), validateQuery(queryFavouriteSchema), handleGetFavourites)
    .post(authenticateToken, authorize(ADD_FAVOURITE), validateBody(createFavouriteSchema), handleAddFavourite);

favouriteRouter.route('/:serviceUuid')
    .delete(
        authenticateToken,
        authorize(REMOVE_FAVOURITE),
        validateParameter(validateUuid, 'serviceUuid'),
        handleRemoveFavourite,
    );
