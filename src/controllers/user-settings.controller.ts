import type { Request, Response } from 'express';

import { UpdateUserSettings } from '../models/user-settings.model';
import { getUserSettings, updateUserSettings } from '../services/user-settings.service';

export async function handleGetUserSettings(req: Request, res: Response) {
    const result = await getUserSettings(req.user?.uuid as string);
    return res.status(200).json(result);
}

export async function handleUpdateUserSettings(req: Request, res: Response) {
    const settings: UpdateUserSettings = req.body;
    const result = await updateUserSettings(req.user?.uuid as string, settings);
    return res.status(200).json(result);
}
