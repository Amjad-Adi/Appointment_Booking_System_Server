"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryUserSchema = exports.userFilterSchema = exports.updateUserByAdminSchema = exports.loginUserSchema = exports.updateUserSchema = exports.inviteUserSchema = exports.createUserByAdminSchema = exports.createUserSchema = exports.DEFAULT_LANGUAGE = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const roles_js_1 = require("../../models/enums/roles.js");
const user_contract_js_1 = require("../../databases/contracts/user.contract.js");
const query_schema_js_1 = require("./query.schema.js");
exports.DEFAULT_LANGUAGE = 'en';
const createUserFields = {
    firstName: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'First Name is required',
    })
        .max(64, {
        error: 'First Name must be at most 64 characters',
    }),
    lastName: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'Last Name is required',
    })
        .max(64, {
        error: 'Last Name must be at most 64 characters',
    }),
    email: zod_1.z.email({
        error: 'Invalid email address',
    }),
    password: zod_1.z
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
    confirmPassword: zod_1.z
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
    profilePicturePath: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'Profile picture path cannot be empty',
    })
        .optional(),
    language: zod_1.z
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
exports.createUserSchema = zod_1.z
    .object({
    ...createUserFields,
    role: zod_1.z.enum([roles_js_1.Role.CUSTOMER, roles_js_1.Role.OWNER], {
        error: 'Invalid user role',
    }),
})
    .strict()
    .refine((data) => data.password === data.confirmPassword, passwordMatch);
exports.createUserByAdminSchema = zod_1.z
    .object({
    ...createUserFields,
    role: zod_1.z.enum(roles_js_1.Role, {
        error: 'Invalid user role',
    }),
})
    .strict()
    .refine((data) => data.password === data.confirmPassword, passwordMatch);
exports.inviteUserSchema = zod_1.z
    .object({
    email: zod_1.z.email({
        error: 'Invalid email address',
    }),
    role: zod_1.z
        .enum(roles_js_1.Role, {
        error: 'Invalid invitation role',
    })
        .refine((role) => role !== roles_js_1.Role.SUPER_ADMIN &&
        role !== roles_js_1.Role.CUSTOMER, {
        message: 'This role cannot be invited',
    }),
})
    .strict();
exports.updateUserSchema = zod_1.z
    .object({
    firstName: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'First Name cannot be empty',
    })
        .max(64, {
        error: 'First Name must be at most 64 characters',
    })
        .optional(),
    lastName: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'Last Name cannot be empty',
    })
        .max(64, {
        error: 'Last Name must be at most 64 characters',
    })
        .optional(),
    password: zod_1.z
        .string()
        .trim()
        .min(8, {
        error: 'Password must be at least 8 characters',
    })
        .max(64, {
        error: 'Password must be at most 64 characters',
    })
        .optional(),
    confirmPassword: zod_1.z
        .string()
        .trim()
        .min(8, {
        error: 'Confirm Password must be at least 8 characters',
    })
        .max(64, {
        error: 'Confirm Password must be at most 64 characters',
    })
        .optional(),
    profilePicturePath: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'Profile picture path cannot be empty',
    })
        .optional(),
    language: zod_1.z
        .string()
        .trim()
        .length(2, {
        error: 'Language must be a 2-character code',
    })
        .optional(),
})
    .strict()
    .refine((data) => !data.password && !data.confirmPassword
    ? true
    : data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.loginUserSchema = zod_1.z
    .object({
    email: zod_1.z.email({
        error: 'Invalid email address',
    }),
    password: zod_1.z
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
exports.updateUserByAdminSchema = zod_1.z
    .object({
    role: zod_1.z
        .enum(roles_js_1.Role, {
        error: 'Invalid user role',
    })
        .optional(),
    status: zod_1.z
        .enum(activation_status_js_1.ActivationStatus, {
        error: 'Invalid activation status',
    })
        .optional(),
})
    .strict();
exports.userFilterSchema = zod_1.z
    .object({
    organizationUuid: zod_1.z.uuid().optional(),
    role: zod_1.z
        .enum(roles_js_1.Role, {
        error: 'Invalid user role filter',
    })
        .optional(),
    status: zod_1.z
        .enum(activation_status_js_1.ActivationStatus, {
        error: 'Invalid activation status filter',
    })
        .optional(),
})
    .strict();
exports.queryUserSchema = query_schema_js_1.querySchema
    .extend({
    search: zod_1.z
        .string()
        .trim()
        .nonempty({
        error: 'Search cannot be empty',
    })
        .max(320, {
        error: 'Search must be at most 320 characters',
    })
        .optional(),
    filter: exports.userFilterSchema.optional(),
    sortBy: zod_1.z
        .enum([user_contract_js_1.SORT_BY_NAME, user_contract_js_1.SORT_BY_CREATED_AT_UTC], {
        error: 'Invalid sort field',
    })
        .optional(),
})
    .strict();
