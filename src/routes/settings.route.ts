import express from 'express';

import {
    handleGetUserSettings,
    handleUpdateUserSettings,
} from '../controllers/user-settings.controller';

import { validateBody } from '../middlewares/validaiton';
import { updateUserSettingsSchema } from '../middlewares/zod-schemas/user-settings.schema';
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { UPDATE_SETTINGS } from '../permissions/permissions';

export const settingsRouter = express.Router();

settingsRouter
    .route('/me')
    .get(authenticateToken, handleGetUserSettings)
    .patch(authenticateToken, authorize(UPDATE_SETTINGS), validateBody(updateUserSettingsSchema), handleUpdateUserSettings);
