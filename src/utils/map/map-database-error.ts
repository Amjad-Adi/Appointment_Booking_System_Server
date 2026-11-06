import { AppError } from '../../errors/app-error';
import { BadRequestError } from '../../errors/bad-request.error';
import { ConflictError } from '../../errors/conflict.error';

interface PostgresError {
    code?: string;
    constraint?: string;
}

export interface DatabaseErrorInfo {
    statusCode: number;
    code: string;
    message: string;
}

const UNIQUE_CONSTRAINTS: Record<string, string> = {
    users_email_key: 'Email already exists',
    users_profile_picture_id_unique: 'This profile picture is already used by another user',
    organizations_email_key: 'Organization email already exists',
    organizations_phone_number_key: 'Organization phone number already exists',
    organization_profile_picture_id_unique: 'This profile picture is already used by another organization',
    services_organization_id_name_key: 'Service name already exists in this organization',
    services_picture_id_unique: 'This picture is already used by another service',
    service_categories_name_key: 'Service category name already exists',
    rooms_organization_id_name_key: 'Room name already exists in this organization',
    special_days_organization_id_day_date_key: 'A special day already exists for this date',
    working_hours_organization_id_day_of_week_key: 'Working hours for this day already exist',
    invitations_unique_organization_id_pending_email_role: 'A pending invitation for this email and role already exists',
    reviews_appointment_unique: 'A review already exists for this appointment',
    idx_customer_invitations_pending_unique: 'A pending customer invitation already exists for this user',
    customer_favourite_service_pkey: 'This service is already in your favourites',
    user_settings_user_id_key: 'Settings already exist for this user',
};

const EXCLUSION_CONSTRAINTS: Record<string, string> = {
    time_block_no_overlap: 'This time block overlaps with an existing approved time block',
    appointments_room_no_overlap: 'The room is already booked during this time',
    appointments_worker_no_overlap: 'The worker is already booked during this time',
};

const CHECK_CONSTRAINTS: Record<string, string> = {
    organizations_status_check: 'Organization status must be either ACTIVE or INACTIVE',
    services_status_check: 'Service status must be either ACTIVE or INACTIVE',
    users_role_check: 'The selected user role is not valid',
    users_status_check: 'User status must be either ACTIVE or INACTIVE',
    service_categories_status_check: 'Service category status must be either ACTIVE or INACTIVE',
    rooms_status_check: 'Room status must be either ACTIVE or INACTIVE',
    rooms_occupancy_status_check: 'Room occupancy status must be either OCCUPIED or AVAILABLE',
    time_block_request_status_check: 'The selected time block status is not valid',
    special_days_status_check: 'Special day status must be either ACTIVE or INACTIVE',
    working_hours_day_of_week_check: 'Day of week must be between 0 and 6',
    invitations_role_check: 'The selected invitation role is not valid',
    invitations_invitation_status_check: 'The selected invitation status is not valid',
    appointments_appointment_status_check: 'The selected appointment status is not valid',
    appointments_payment_method_check: 'The selected payment method is not valid',
    appointments_payment_status_check: 'The selected payment status is not valid',
    appointments_scheduled_time_check: 'The appointment end time must be after its start time',
    appointments_actual_time_check: 'The actual end time must be after the actual start time',
    appointments_paid_at_check: 'A payment date can only be set when the appointment is paid',
    reviews_rating_check: 'Rating must be between 1 and 5',
    customer_invitations_status_check: 'The selected customer invitation status is not valid',
    customer_invitations_expiry_check: 'The invitation expiry must be after the invitation was created',
    customer_invitations_responded_at_check: 'A response date is required only when the invitation is accepted or rejected',
    user_settings_theme_check: 'Theme must be LIGHT, DARK or SYSTEM',
};

const POSTGRES_ERRORS: Record<string, DatabaseErrorInfo> = {
    '23503': {
        statusCode: 409,
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'This action refers to a record that no longer exists',
    },
    '23502': {
        statusCode: 400,
        code: 'NOT_NULL_VIOLATION',
        message: 'A required field is missing',
    },
    '22P02': {
        statusCode: 400,
        code: 'INVALID_TEXT_REPRESENTATION',
        message: 'One of the provided values has an invalid format',
    },
    '22007': {
        statusCode: 400,
        code: 'INVALID_DATETIME_FORMAT',
        message: 'One of the provided dates has an invalid format',
    },
    '22003': {
        statusCode: 400,
        code: 'NUMERIC_VALUE_OUT_OF_RANGE',
        message: 'One of the provided numbers is out of the allowed range',
    },
    '40001': {
        statusCode: 409,
        code: 'SERIALIZATION_FAILURE',
        message: 'The record was changed by another request. Please try again',
    },
    '40P01': {
        statusCode: 409,
        code: 'DEADLOCK_DETECTED',
        message: 'The request conflicted with another request. Please try again',
    },
};

function isPostgresError(error: unknown): error is PostgresError {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export function getConstraintMessage(error: { constraint?: string }): string | undefined {
    if (!error.constraint) return undefined;

    return UNIQUE_CONSTRAINTS[error.constraint]
        ?? EXCLUSION_CONSTRAINTS[error.constraint]
        ?? CHECK_CONSTRAINTS[error.constraint];
}

export function getUniqueConstraintMessage(error: { constraint?: string }): string {
    return (error.constraint && UNIQUE_CONSTRAINTS[error.constraint])
        ?? 'A record with these values already exists';
}

export function resolveDatabaseError(error: unknown): DatabaseErrorInfo | undefined {
    if (!isPostgresError(error)) return undefined;

    const constraintMessage = getConstraintMessage(error);

    if (error.code === '23505') {
        return {
            statusCode: 409,
            code: 'DUPLICATE_RECORD',
            message: getUniqueConstraintMessage(error),
        };
    }

    if (error.code === '23P01') {
        return {
            statusCode: 409,
            code: 'SCHEDULE_CONFLICT',
            message: constraintMessage ?? 'This time range conflicts with an existing record',
        };
    }

    if (error.code === '23514') {
        return {
            statusCode: 400,
            code: 'CONSTRAINT_VIOLATION',
            message: constraintMessage ?? 'One of the provided values is not allowed',
        };
    }

    const fallback = error.code ? POSTGRES_ERRORS[error.code] : undefined;
    if (fallback) {
        return { ...fallback, message: fallback.message };
    }

    return undefined;
}

export function mapDatabaseError(error: unknown): never {
    const info = resolveDatabaseError(error);

    if (info) {
        const mapped: AppError = info.statusCode === 409
            ? new ConflictError(info.message)
            : new BadRequestError(info.message);
        mapped.code = info.code;
        throw mapped;
    }

    throw error;
}
