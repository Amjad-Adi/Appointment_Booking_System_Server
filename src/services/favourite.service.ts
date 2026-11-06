import { countAll, create, findAll, remove, serviceExists } from '../repositories/favourite.repository';
import { CreateFavourite, FavouriteServiceResponse, QueryFavourite } from '../models/favourite.model';
import { NotFoundError } from '../errors/not-found.error';

export async function getFavourites(query: QueryFavourite): Promise<FavouriteServiceResponse[]> {
    return findAll(query);
}

export async function getNumberOfFavourites(query: QueryFavourite): Promise<number> {
    return countAll(query);
}

export async function addFavourite(favourite: CreateFavourite): Promise<void> {
    if (!(await serviceExists(favourite.serviceUuid))) {
        throw new NotFoundError('Service');
    }
    await create(favourite.userUuid, favourite.serviceUuid);
}

export async function removeFavourite(userUuid: string, serviceUuid: string): Promise<void> {
    await remove(userUuid, serviceUuid);
}
