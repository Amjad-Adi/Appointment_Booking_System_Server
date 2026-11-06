import { z } from 'zod';

import { Theme } from './enums/theme';
import { updateUserSettingsSchema } from '../middlewares/zod-schemas/user-settings.schema';

export interface UserSettings {
    language: string;
    theme: Theme;
    emailNotifications: boolean;
    appointmentReminders: boolean;
    marketingEmails: boolean;
    createdAtUTC: Date;
    updatedAtUTC: Date;
}

export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
