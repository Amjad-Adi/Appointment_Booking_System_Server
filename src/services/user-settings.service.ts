import { UpdateUserSettings, UserSettings } from '../models/user-settings.model';
import { findByUserUuid, update } from '../repositories/user-settings.repository';
import { NotFoundError } from '../errors/not-found.error';

export async function getUserSettings(userUuid: string): Promise<UserSettings> {
    const settings = await findByUserUuid(userUuid);

    if (settings === undefined) {
        throw new NotFoundError('User');
    }

    return settings;
}

export async function updateUserSettings(
    userUuid: string,
    settings: UpdateUserSettings,
): Promise<UserSettings> {
    const result = await update(userUuid, settings);

    if (result === undefined) {
        throw new NotFoundError('User');
    }

    return result;
}
