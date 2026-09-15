import {
    findAll,
    findByUuid,
    findByUuidAndOrganization,
    findByUuidAndUser,
    countAll,
    create,
    updateByUser,
    updateByOrganization,
    confirm,
    approve,
    reject,
    updateStatus,
    cancelByUser,
    pay,
} from "../repositories/appointment.repository.js";

import {
    findIdByUuid,
} from "../repositories/organizaiton.repository.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";

import {
    NotFoundError,
} from "../errors/not-found.error.js";

import {
    BadRequestError,
} from "../errors/bad-request.error.js";

import type {
    Appointment,
    AppointmentResponse,
    CreateAppointment,
    QueryAppointment,
    UpdateAppointmentByOrganization,
    UpdateAppointmentByUser,
    ConfirmAppointment,
    RejectAppointment,
    UpdateAppointmentStatus,
    PayAppointment,
} from "../models/appointment.model.js";

import {
    AppointmentStatus,
} from "../models/enums/appointment-status.js";

import {
    PaymentStatus,
} from "../models/enums/payment-status.js";

import {
    getServiceIdByUuid,
} from "./service.service.js";

import {
    getRoomIdByUuid,
} from "./room.service.js";


export async function getAppointments(
    query: QueryAppointment,
): Promise<AppointmentResponse[]> {
    return findAll(query);
}


export async function getNumberOfAppointments(
    query: QueryAppointment,
): Promise<number> {
    return countAll(query);
}


export async function getAppointment(
    appointmentUuid: string,organizationUuid:string|undefined,
): Promise<AppointmentResponse|undefined> {
    const result =
        findByUuid(appointmentUuid,organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Appointment");
    }

    return result;
}


export async function getOrganizationAppointment(
    appointmentUuid: string,
    organizationUuid: string,
): Promise<AppointmentResponse> {
    const organizationId =
        await findIdByUuid(organizationUuid);

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const result =
        await findByUuidAndOrganization(
            appointmentUuid,
            organizationId,
        );

    if (result === undefined) {
        throw new NotFoundError("Appointment");
    }

    return result;
}


export async function getUserAppointment(
    appointmentUuid: string,
    userUuid: string,
): Promise<AppointmentResponse> {
    const userId =
        await getUserIdByUuid(userUuid);

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const result =
        await findByUuidAndUser(
            appointmentUuid,
            userId,
        );

    if (result === undefined) {
        throw new NotFoundError("Appointment");
    }

    return result;
}


export async function createAppointmentService(
    appointment: CreateAppointment,
    userUuid: string,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(userUuid);

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const organizationId =
        await findIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const serviceId =
        await getServiceIdByUuid(
            appointment.serviceUuid,appointment.organizationUuid
        );

    if (serviceId === undefined) {
        throw new NotFoundError("Service");
    }

    const workerId =
        await getUserIdByUuid(
            appointment.workerUuid,
        );

    if (workerId === undefined) {
        throw new NotFoundError("Worker");
    }

    const roomId =
        await getRoomIdByUuid(
            appointment.roomUuid,
        );

    if (roomId === undefined) {
        throw new NotFoundError("Room");
    }

    appointment.userId = userId;
    appointment.organizationId = organizationId;
    appointment.serviceId = serviceId;
    appointment.workerId = workerId;
    appointment.roomId = roomId;

    if (
        new Date(
            appointment.scheduledStartTimeUTC,
        ) >=
        new Date(
            appointment.scheduledEndTimeUTC,
        )
    ) {
        throw new BadRequestError(
            "Appointment end time must be after start time",
        );
    }

    const result =
        await create(appointment);

    if (result === undefined) {
        throw new BadRequestError();
    }

    return result;
}


export async function updateAppointmentByUser(
    appointment: UpdateAppointmentByUser,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            appointment.userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndUser(
            appointment.uuid,
            userId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus ===
        AppointmentStatus.COMPLETED ||
        current.appointmentStatus ===
        AppointmentStatus.CANCELLED ||
        current.appointmentStatus ===
        AppointmentStatus.REJECTED
    ) {
        throw new BadRequestError(
            "This appointment cannot be updated",
        );
    }

    const result =
        await updateByUser(
            appointment.uuid,
            userId,
            {
                userNote:
                appointment.userNote,

                userColour:
                appointment.userColour,
            },
        );

    if (result === undefined) {
        throw new BadRequestError(
            "No appointment fields were provided",
        );
    }

    return result;
}


export async function updateAppointmentByOrganization(
    appointment: UpdateAppointmentByOrganization,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        appointment.userUuid,
        appointment.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const current =
        await findByUuidAndOrganization(
            appointment.uuid,
            organizationId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus ===
        AppointmentStatus.COMPLETED ||
        current.appointmentStatus ===
        AppointmentStatus.CANCELLED ||
        current.appointmentStatus ===
        AppointmentStatus.REJECTED
    ) {
        throw new BadRequestError(
            "This appointment cannot be updated",
        );
    }

    const result =
        await updateByOrganization(
            appointment.uuid,
            organizationId,
            {
                organizationNote:
                appointment.organizationNote,

                organizationColour:
                appointment.organizationColour,
            },
        );

    if (result === undefined) {
        throw new BadRequestError(
            "No appointment fields were provided",
        );
    }

    return result;
}


export async function confirmAppointmentService(
    appointment: ConfirmAppointment,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        appointment.userUuid,
        appointment.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const approvalUserId =
        await getUserIdByUuid(
            appointment.userUuid,
        );

    if (approvalUserId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndOrganization(
            appointment.uuid,
            organizationId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus !==
        AppointmentStatus.PENDING_USER_CONFIRMATION
    ) {
        throw new BadRequestError(
            "Appointment is not waiting for user confirmation",
        );
    }

    const result =
        await confirm(
            appointment.uuid,
            organizationId,
            approvalUserId,
            appointment.name,
            appointment.organizationColour,
            appointment.organizationNote,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be confirmed",
        );
    }

    return result;
}


export async function approveAppointmentService(
    appointmentUuid: string,
    organizationUuid: string,
    userUuid: string,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const approvalUserId =
        await getUserIdByUuid(userUuid);

    if (approvalUserId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndOrganization(
            appointmentUuid,
            organizationId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus !==
        AppointmentStatus.PENDING_ORGANIZATION_APPROVAL
    ) {
        throw new BadRequestError(
            "Appointment is not waiting for organization approval",
        );
    }

    const result =
        await approve(
            appointmentUuid,
            organizationId,
            approvalUserId,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be approved",
        );
    }

    return result;
}


export async function rejectAppointmentService(
    appointment: RejectAppointment,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        appointment.userUuid,
        appointment.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const approvalUserId =
        await getUserIdByUuid(
            appointment.userUuid,
        );

    if (approvalUserId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndOrganization(
            appointment.uuid,
            organizationId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus !==
        AppointmentStatus.PENDING_ORGANIZATION_APPROVAL
    ) {
        throw new BadRequestError(
            "Appointment is not waiting for organization approval",
        );
    }

    const result =
        await reject(
            appointment.uuid,
            organizationId,
            approvalUserId,
            appointment.rejectionReason,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be rejected",
        );
    }

    return result;
}


export async function updateAppointmentStatusService(
    appointment: UpdateAppointmentStatus,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        appointment.userUuid,
        appointment.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const current =
        await findByUuidAndOrganization(
            appointment.uuid,
            organizationId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    validateStatusTransition(
        current.appointmentStatus,
        appointment.appointmentStatus,
    );

    const result =
        await updateStatus(
            appointment.uuid,
            organizationId,
            appointment.appointmentStatus,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment status could not be updated",
        );
    }

    return result;
}


export async function cancelAppointmentService(
    appointmentUuid: string,
    userUuid: string,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(userUuid);

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndUser(
            appointmentUuid,
            userId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.appointmentStatus ===
        AppointmentStatus.COMPLETED ||
        current.appointmentStatus ===
        AppointmentStatus.CANCELLED ||
        current.appointmentStatus ===
        AppointmentStatus.REJECTED
    ) {
        throw new BadRequestError(
            "Appointment cannot be cancelled",
        );
    }

    const result =
        await cancelByUser(
            appointmentUuid,
            userId,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be cancelled",
        );
    }

    return result;
}


export async function payAppointmentService(
    appointment: PayAppointment,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            appointment.userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const current =
        await findByUuidAndUser(
            appointment.uuid,
            userId,
        );

    if (current === undefined) {
        throw new NotFoundError("Appointment");
    }

    if (
        current.paymentStatus ===
        PaymentStatus.PAID
    ) {
        throw new BadRequestError(
            "Appointment is already paid",
        );
    }

    if (
        current.appointmentStatus ===
        AppointmentStatus.CANCELLED ||
        current.appointmentStatus ===
        AppointmentStatus.REJECTED
    ) {
        throw new BadRequestError(
            "Cancelled or rejected appointments cannot be paid",
        );
    }

    const result =
        await pay(
            appointment.uuid,
            userId,
            appointment.paymentMethod,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be paid",
        );
    }

    return result;
}


function validateStatusTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
): void {
    const validTransitions: Record<
        AppointmentStatus,
        AppointmentStatus[]
    > = {
        [AppointmentStatus.PENDING_USER_CONFIRMATION]: [
            AppointmentStatus.CANCELLED,
        ],

        [AppointmentStatus.PENDING_ORGANIZATION_APPROVAL]: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.REJECTED,
        ],

        [AppointmentStatus.CONFIRMED]: [
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.NO_SHOW,
        ],

        [AppointmentStatus.IN_PROGRESS]: [
            AppointmentStatus.COMPLETED,
        ],

        [AppointmentStatus.COMPLETED]: [],

        [AppointmentStatus.REJECTED]: [],

        [AppointmentStatus.CANCELLED]: [],

        [AppointmentStatus.NO_SHOW]: [],
    };

    if (
        !validTransitions[currentStatus]?.includes(
            newStatus,
        )
    ) {
        throw new BadRequestError(
            `Cannot change appointment status from ${currentStatus} to ${newStatus}`,
        );
    }
}