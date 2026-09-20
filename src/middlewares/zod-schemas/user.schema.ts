import { z } from 'zod';

import { ActivationStatus } from '../../models/enums/activation-status.js';
import { Role } from '../../models/enums/roles.js';

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_NAME,
} from '../../databases/contracts/user.contract.js';

import { querySchema } from './query.schema.js';

export const DEFAULT_LANGUAGE = 'en';

const createUserFields = {
    firstName: z
        .string()
        .trim()
        .nonempty({
            error: 'First Name is required',
        })
        .max(64, {
            error: 'First Name must be at most 64 characters',
        }),

    lastName: z
        .string()
        .trim()
        .nonempty({
            error: 'Last Name is required',
        })
        .max(64, {
            error: 'Last Name must be at most 64 characters',
        }),

    email: z.email({
        error: 'Invalid email address',
    }),

    password: z
        .string()
        .trim()
        .nonempty({
            error: 'Password is required',
        })
        .min(8, {
            error: 'Password must be at least 8 characters',
        })
        .max(64, {
            error: 'Password must be at most 64 characters',
        }),

    confirmPassword: z
        .string()
        .trim()
        .nonempty({
            error: 'Confirm Password is required',
        })
        .min(8, {
            error: 'Confirm Password must be at least 8 characters',
        })
        .max(64, {
            error: 'Confirm Password must be at most 64 characters',
        }),

    profilePicturePath: z
        .string()
        .trim()
        .nonempty({
            error: 'Profile picture path cannot be empty',
        })
        .optional(),

    language: z
        .string()
        .trim()
        .length(2, {
            error: 'Language must be a 2-character code',
        }),
};

const passwordMatch = {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
};

export const createUserSchema = z
    .object({
        ...createUserFields,
        role: z.enum([Role.CUSTOMER, Role.OWNER], {
            error: 'Invalid user role',
        }),
    })
    .strict()
    .refine(
        (data) => data.password === data.confirmPassword,
        passwordMatch,
    );

export const createUserByAdminSchema = z
    .object({
        ...createUserFields,
        role: z.enum(Role, {
            error: 'Invalid user role',
        }),
    })
    .strict()
    .refine(
        (data) => data.password === data.confirmPassword,
        passwordMatch,
    );

export const inviteUserSchema = z
    .object({
        email: z.email({
            error: 'Invalid email address',
        }),

        role: z
            .enum(Role, {
                error: 'Invalid invitation role',
            })
            .refine(
                (role) =>
                    role !== Role.SUPER_ADMIN &&
                    role !== Role.CUSTOMER,
                {
                    message: 'This role cannot be invited',
                },
            ),
    })
    .strict();

export const updateUserSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .nonempty({
                error: 'First Name cannot be empty',
            })
            .max(64, {
                error: 'First Name must be at most 64 characters',
            })
            .optional(),

        lastName: z
            .string()
            .trim()
            .nonempty({
                error: 'Last Name cannot be empty',
            })
            .max(64, {
                error: 'Last Name must be at most 64 characters',
            })
            .optional(),

        password: z
            .string()
            .trim()
            .min(8, {
                error: 'Password must be at least 8 characters',
            })
            .max(64, {
                error: 'Password must be at most 64 characters',
            })
            .optional(),

        confirmPassword: z
            .string()
            .trim()
            .min(8, {
                error: 'Confirm Password must be at least 8 characters',
            })
            .max(64, {
                error: 'Confirm Password must be at most 64 characters',
            })
            .optional(),

        profilePicturePath: z
            .string()
            .trim()
            .nonempty({
                error: 'Profile picture path cannot be empty',
            })
            .optional(),

        language: z
            .string()
            .trim()
            .length(2, {
                error: 'Language must be a 2-character code',
            })
            .optional(),
    })
    .strict()
    .refine(
        (data) =>
            !data.password && !data.confirmPassword
                ? true
                : data.password === data.confirmPassword,
        {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        },
    );

export const loginUserSchema = z
    .object({
        email: z.email({
            error: 'Invalid email address',
        }),

        password: z
            .string()
            .trim()
            .nonempty({
                error: 'Password is required',
            })
            .min(8, {
                error: 'Password must be at least 8 characters',
            })
            .max(64, {
                error: 'Password must be at most 64 characters',
            }),
    })
    .strict();

export const updateUserByAdminSchema = z
    .object({
        role: z
            .enum(Role, {
                error: 'Invalid user role',
            })
            .optional(),

        status: z
            .enum(ActivationStatus, {
                error: 'Invalid activation status',
            })
            .optional(),
    })
    .strict();

export const userFilterSchema = z
    .object({
        organizationUuid: z.uuid().optional(),
        role: z
            .enum(Role, {
                error: 'Invalid user role filter',
            })
            .optional(),

        status: z
            .enum(ActivationStatus, {
                error: 'Invalid activation status filter',
            })
            .optional(),
    })
    .strict();

export const queryUserSchema = querySchema
    .extend({
        search: z
            .string()
            .trim()
            .nonempty({
                error: 'Search cannot be empty',
            })
            .max(320, {
                error: 'Search must be at most 320 characters',
            })
            .optional(),

        filter: userFilterSchema.optional(),

        sortBy: z
            .enum(
                [SORT_BY_NAME, SORT_BY_CREATED_AT_UTC],
                {
                    error: 'Invalid sort field',
                },
            )
            .optional(),
    })
    .strict();