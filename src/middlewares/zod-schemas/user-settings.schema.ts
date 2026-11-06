import { z } from 'zod';

import { Theme } from '../../models/enums/theme';

const languageSchema = z
    .string()
    .trim()
    .min(2, { error: 'Language must be at least 2 characters' })
    .max(8, { error: 'Language must be at most 8 characters' });

export const updateUserSettingsSchema = z.object({
    language: languageSchema.optional(),
    theme: z.enum(Theme, { error: 'Invalid theme' }).optional(),
    emailNotifications: z.boolean({ error: 'Email notifications must be a boolean' }).optional(),
    appointmentReminders: z.boolean({ error: 'Appointment reminders must be a boolean' }).optional(),
    marketingEmails: z.boolean({ error: 'Marketing emails must be a boolean' }).optional(),
}).strict().refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: 'At least one setting must be provided' },
);
