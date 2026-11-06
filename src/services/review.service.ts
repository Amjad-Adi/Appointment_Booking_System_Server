import {
    countAll,
    create,
    findAll,
    findReviewableAppointment,
    remove,
    update,
} from '../repositories/review.repository';
import { BadRequestError } from '../errors/bad-request.error';
import { ConflictError } from '../errors/conflict.error';
import { NotFoundError } from '../errors/not-found.error';
import { AppointmentStatus } from '../models/enums/appointment-status';
import {
    CreateReview,
    QueryReview,
    Review,
    ReviewResponse,
    UpdateReview,
} from '../models/review.model';

export async function getReviews(query: QueryReview): Promise<ReviewResponse[]> {
    return findAll(query);
}

export async function getNumberOfReviews(query: QueryReview): Promise<number> {
    return countAll(query);
}

export async function createReview(review: CreateReview): Promise<Review> {
    const appointment = await findReviewableAppointment(review.userUuid, review.appointmentUuid);

    if (appointment === undefined) {
        throw new NotFoundError('Appointment');
    }

    if (appointment.appointmentStatus !== AppointmentStatus.COMPLETED) {
        throw new BadRequestError('Only completed appointments can be reviewed');
    }

    /*
     * A completed appointment is terminal, but guard against legacy records
     * completed early: reviews are only accepted once the scheduled end has
     * passed, i.e. the appointment has fully finished.
     */
    if (Date.now() < new Date(appointment.scheduledEndAtUTC).getTime()) {
        throw new BadRequestError(
            'The appointment cannot be reviewed before its scheduled end time',
        );
    }

    if (appointment.reviewUuid) {
        throw new ConflictError('This appointment has already been reviewed');
    }

    const result = await create(review);

    if (result === undefined) {
        throw new NotFoundError('Appointment');
    }

    return result;
}

export async function updateReview(review: UpdateReview): Promise<Review> {
    const result = await update(review);

    if (result === undefined) {
        throw new NotFoundError('Review');
    }

    return result;
}

export async function deleteReview(uuid: string, userUuid: string): Promise<void> {
    if (!(await remove(uuid, userUuid))) {
        throw new NotFoundError('Review');
    }
}
