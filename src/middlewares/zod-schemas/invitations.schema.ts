import { z } from "zod";

import { Role } from "../../models/enums/roles.js";
import { InvitationStatus } from "../../models/enums/invitation-status.js";

import { querySchema } from "./query.schema.js";

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_EXPIRES_AT_UTC,
} from "../../databases/contracts/invitation.contract.js";

export const createInvitationSchema = z
    .object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email({
                error: "Invalid email address",
            }),

        role: z.enum(
            [
                Role.OWNER,
                Role.MANAGER,
                Role.CRM,
                Role.WORKER,
            ],
            {
                error: "Invalid invitation role",
            },
        ),

        expiresAtUTC: z
            .string()
            .trim()
            .min(1, {
                error: "Invitation expiration is required",
            }),
    })
    .strict();

export const updateInvitationSchema = z
    .object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email({
                error: "Invalid email address",
            })
            .optional(),

        role: z
            .enum(
                [
                    Role.OWNER,
                    Role.MANAGER,
                    Role.CRM,
                    Role.WORKER,
                ],
                {
                    error: "Invalid invitation role",
                },
            )
            .optional(),

        expiresAtUTC: z
            .string()
            .trim()
            .min(1, {
                error: "Invitation expiration is required",
            })
            .optional(),

        status: z
            .enum([
                InvitationStatus.CANCELLED,
                InvitationStatus.EXPIRED,
            ])
            .optional(),
    })
    .strict();

export const invitationFilterSchema = z
    .object({
        organizationUuid: z
            .uuid()
            .optional(),

        status: z
            .enum(InvitationStatus)
            .optional(),
    })
    .strict();

export const queryInvitationSchema =
    querySchema
        .extend({
            search: z
                .string()
                .trim()
                .max(320)
                .optional(),

            filter:
                invitationFilterSchema
                    .optional(),

            sortBy: z
                .enum([
                    SORT_BY_CREATED_AT_UTC,
                    SORT_BY_EXPIRES_AT_UTC,
                ])
                .optional(),
        })
        .strict();