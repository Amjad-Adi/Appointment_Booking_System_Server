import {
    findAll,
    findByUuid,
    findByUuidAndOrganization,
    findByUuidAndUser,
    countAll,
    createByUser,
    createByOrganization,
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
    getOrganizationIdByUuid,
} from "./organization.service.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";

import {
    getService,
    getServiceIdByUuid,
} from "./service.service.js";

import {
    getRoomIdByUserUuid,
} from "./room.service.js";

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
    CreateOrganizationAppointment,
    QueryAppointment,
    UpdateAppointmentByOrganization,
    UpdateAppointmentByUser,
    ConfirmAppointment,
    RejectAppointment,
    UpdateAppointmentStatus,
    PayAppointment,
} from "../models/appointment.model.js";


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
    appointmentUuid: string,
    organizationUuid: string | undefined,
): Promise<AppointmentResponse> {
    const result =
        await findByUuid(
            appointmentUuid,
            organizationUuid,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function getOrganizationAppointment(
    appointmentUuid: string,
    organizationUuid: string,
): Promise<AppointmentResponse> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const result =
        await findByUuidAndOrganization(
            appointmentUuid,
            organizationId,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function getUserAppointment(
    appointmentUuid: string,
    userUuid: string,
): Promise<AppointmentResponse> {
    const userId =
        await getUserIdByUuid(
            userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await findByUuidAndUser(
            appointmentUuid,
            userId,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


/*
 * CUSTOMER / USER creates an appointment.
 *
 * The request data comes from createAppointmentSchema.
 *
 * The service resolves:
 * - user ID
 * - organization ID
 * - service ID
 * - worker ID
 * - room ID
 * - scheduled end time
 *
 * The resolved CreateAppointment model is then
 * passed to createByUser().
 */
export async function createAppointmentService(
    appointment: CreateAppointment,
    userUuid: string,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const organizationId =
        await getOrganizationIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const service =
        await getService(
            appointment.serviceUuid,
            appointment.organizationUuid,
        );

    const serviceId =
        await getServiceIdByUuid(
            appointment.serviceUuid,
            appointment.organizationUuid,
        );

    if (serviceId === undefined) {
        throw new NotFoundError(
            "Service",
        );
    }

    const workerId =
        await getUserIdByUuid(
            appointment.workerUuid,
        );

    if (workerId === undefined) {
        throw new NotFoundError(
            "Worker",
        );
    }

    const roomId =
        await getRoomIdByUserUuid(
            appointment.workerUuid,
            appointment.organizationUuid,
        );

    if (roomId === undefined) {
        throw new NotFoundError(
            "Room",
        );
    }

    const scheduledStartAtUTC =
        new Date(
            appointment.scheduledStartAtUTC,
        );

    if (
        Number.isNaN(
            scheduledStartAtUTC.getTime(),
        )
    ) {
        throw new BadRequestError(
            "Invalid appointment start time",
        );
    }

    const scheduledEndAtUTC =
        new Date(
            scheduledStartAtUTC.getTime() +
            service.durationInMinutes *
            60 *
            1000,
        );

    if (
        scheduledStartAtUTC >=
        scheduledEndAtUTC
    ) {
        throw new BadRequestError(
            "Appointment end time must be after start time",
        );
    }

    const createData: CreateAppointment = {
        ...appointment,

        userId,
        organizationId,
        serviceId,
        workerId,
        roomId,

        scheduledStartAtUTC,
        scheduledEndAtUTC,
    };

    const result =
        await createByUser(
            createData,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be created",
        );
    }

    return result;
}


/*
 * ORGANIZATION creates an appointment for a customer.
 *
 * The request data comes from
 * createOrganizationAppointmentSchema.
 *
 * The service resolves:
 * - customer ID
 * - organization ID
 * - service ID
 * - worker ID
 * - room ID
 * - scheduled end time
 *
 * The resolved CreateOrganizationAppointment model
 * is then passed to createByOrganization().
 */
export async function createOrganizationAppointmentService(
    appointment: CreateOrganizationAppointment,
    organizationUserUuid: string,
): Promise<Appointment> {
    await AuthorizeOrganizationUser(
        organizationUserUuid,
        appointment.organizationUuid,
    );

    const organizationId =
        await getOrganizationIdByUuid(
            appointment.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const customerId =
        await getUserIdByUuid(
            appointment.userUuid,
        );

    if (customerId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const service =
        await getService(
            appointment.serviceUuid,
            appointment.organizationUuid,
        );

    const serviceId =
        await getServiceIdByUuid(
            appointment.serviceUuid,
            appointment.organizationUuid,
        );

    if (serviceId === undefined) {
        throw new NotFoundError(
            "Service",
        );
    }

    const workerId =
        await getUserIdByUuid(
            appointment.workerUuid,
        );

    if (workerId === undefined) {
        throw new NotFoundError(
            "Worker",
        );
    }

    const roomId =
        await getRoomIdByUserUuid(
            appointment.workerUuid,
            appointment.organizationUuid,
        );

    if (roomId === undefined) {
        throw new NotFoundError(
            "Room",
        );
    }

    const scheduledStartAtUTC =
        new Date(
            appointment.scheduledStartAtUTC,
        );

    if (
        Number.isNaN(
            scheduledStartAtUTC.getTime(),
        )
    ) {
        throw new BadRequestError(
            "Invalid appointment start time",
        );
    }

    const scheduledEndAtUTC =
        new Date(
            scheduledStartAtUTC.getTime() +
            service.durationInMinutes *
            60 *
            1000,
        );

    if (
        scheduledStartAtUTC >=
        scheduledEndAtUTC
    ) {
        throw new BadRequestError(
            "Appointment end time must be after start time",
        );
    }

    const createData: CreateOrganizationAppointment = {
        ...appointment,

        organizationId,
        userId: customerId,
        serviceId,
        workerId,
        roomId,

        scheduledStartAtUTC,
        scheduledEndAtUTC,
    };

    const result =
        await createByOrganization(
            createData,
        );

    if (result === undefined) {
        throw new BadRequestError(
            "Appointment could not be created",
        );
    }

    return result;
}


export async function updateAppointmentByUserService(
    appointmentUuid: string,
    userUuid: string,
    appointment: UpdateAppointmentByUser,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await updateByUser(
            appointmentUuid,
            userId,
            appointment,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function updateAppointmentByOrganizationService(
    appointmentUuid: string,
    organizationUuid: string,
    appointment: UpdateAppointmentByOrganization,
): Promise<Appointment> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const result =
        await updateByOrganization(
            appointmentUuid,
            organizationId,
            appointment,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function confirmAppointmentService(
    appointmentUuid: string,
    organizationUuid: string,
    approvalUserUuid: string,
    appointment: ConfirmAppointment,
): Promise<Appointment> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const approvalUserId =
        await getUserIdByUuid(
            approvalUserUuid,
        );

    if (approvalUserId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await confirm(
            appointmentUuid,
            organizationId,
            approvalUserId,
            appointment.name,
            appointment.organizationColour,
            appointment.organizationNote,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function approveAppointmentService(
    appointmentUuid: string,
    organizationUuid: string,
    approvalUserUuid: string,
): Promise<Appointment> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const approvalUserId =
        await getUserIdByUuid(
            approvalUserUuid,
        );

    if (approvalUserId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await approve(
            appointmentUuid,
            organizationId,
            approvalUserId,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function rejectAppointmentService(
    appointmentUuid: string,
    organizationUuid: string,
    approvalUserUuid: string,
    appointment: RejectAppointment,
): Promise<Appointment> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const approvalUserId =
        await getUserIdByUuid(
            approvalUserUuid,
        );

    if (approvalUserId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await reject(
            appointmentUuid,
            organizationId,
            approvalUserId,
            appointment.rejectionReason,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function updateAppointmentStatusService(
    appointmentUuid: string,
    organizationUuid: string,
    appointment: UpdateAppointmentStatus,
): Promise<Appointment> {
    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const result =
        await updateStatus(
            appointmentUuid,
            organizationId,
            appointment.appointmentStatus,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function cancelAppointmentByUserService(
    appointmentUuid: string,
    userUuid: string,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await cancelByUser(
            appointmentUuid,
            userId,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}


export async function payAppointmentService(
    appointmentUuid: string,
    userUuid: string,
    appointment: PayAppointment,
): Promise<Appointment> {
    const userId =
        await getUserIdByUuid(
            userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError(
            "User",
        );
    }

    const result =
        await pay(
            appointmentUuid,
            userId,
            appointment.paymentMethod,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Appointment",
        );
    }

    return result;
}