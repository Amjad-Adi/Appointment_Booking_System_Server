import { ConflictError } from '../../errors/conflict.error';

const uniqueConstraints = {
    users_email_key: 'Email already exists',
    working_hours_organization_id_day_of_week_key: 'Working hours for this day already exist',
    service_categories_name_key: 'Service category name already exists',
    organizations_email_key: 'Organization email already exists',
    time_block_no_overlap: 'Time block overlaps with an existing approved time block',
    special_days_organization_id_day_date_key: 'A special day already exists for this date',
    services_organization_id_name_key: 'Service name already exists in this organization',
    rooms_organization_id_name_key: 'Room name already exists in this organization',
    organizations_phone_number_key: 'Organization phone number already exists',
    appointments_room_no_overlap: 'Room is already booked during this time',
    appointments_worker_no_overlap: 'Worker is already booked during this time',
    invitations_unique_organization_id_pending_email_role: 'A pending invitation for this email and role already exists'
}

export function mapDatabaseError(error: unknown): never {
    if (isUniqueViolation(error)) {
        const message = getUniqueConstraintMessage(error);
        throw new ConflictError(message);
    }
    throw error;
}

function isUniqueViolation(error: unknown): error is { code: '23505'; constraint?: string;} {
    return (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505');
}

function getUniqueConstraintMessage(error: { constraint?: string }): string {
    if (error.constraint && error.constraint in uniqueConstraints) {
        return uniqueConstraints[error.constraint as keyof typeof uniqueConstraints];
    }
    return 'A record with these values already exists';
}
