import {
    findAllOrganization,
    findAllUser,
    countAll,
    findByUuidAndOrganization,
    findByUuidAndUser,
    createByUser,
    createByOrganization,
    updateByUser,
    updateByOrganization,
    cancelByUser,
} from "../repositories/appointment.repository";
import { getService } from "./service.service";
import { getRoomIdByUserUuid } from "./room.service";
import { getAvailableTimes } from "./scheduling.service";
import type {
    QueryAppointment,
    CreateAppointment,
    CreateOrganizationAppointment,
    UpdateAppointmentByUser,
    UpdateAppointmentByOrganization,
} from "../models/appointment.model";
import { AppointmentTimeType } from "../models/enums/appointment-time-type";
import { AppointmentStatus } from "../models/enums/appointment-status";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";
import { verifyOrganizationOwnership } from "../middlewares/authorization/authorization";

export async function getUserAppointments(query: QueryAppointment) {
    return findAllUser(query);
}

export async function getOrganizationAppointments(query: QueryAppointment) {
    return findAllOrganization(query);
}

export async function getNumberOfAppointments(query: QueryAppointment, scope: "user" | "organization" = "organization") {
    return countAll(query, scope);
}

export async function getOrganizationAppointment(appointmentUuid: string, organizationUuid: string) {
    const appointment = await findByUuidAndOrganization(appointmentUuid, organizationUuid);

    if (!appointment) {
        throw new NotFoundError("Appointment not found");
    }

    return appointment;
}

export async function getUserAppointment(appointmentUuid: string, userUuid: string) {
    const appointment = await findByUuidAndUser(appointmentUuid, userUuid);

    if (!appointment) {
        throw new NotFoundError("Appointment not found");
    }

    return appointment;
}

async function validateRequestedSlot(
    organizationUuid: string,
    userUuid: string,
    serviceUuid: string,
    workerUuid: string,
    timeType: AppointmentTimeType,
    scheduledStartAtUTC: string,
) {
    const startAtUTC = new Date(scheduledStartAtUTC);

    if (Number.isNaN(startAtUTC.getTime())) {
        throw new BadRequestError("Invalid appointment start time");
    }

    const availableTimes = await getAvailableTimes({
        organizationUuid,
        userUuid,
        serviceUuid,
        workerUuid,
        timeType,
        fromAtUTC: startAtUTC.toISOString(),
    });

    const isAvailable = availableTimes.workers.some(
        ({ worker, options }) =>
            worker.uuid === workerUuid &&
            options.some((option) => Date.parse(option.scheduledStartAtUTC) === startAtUTC.getTime()),
    );

    if (!isAvailable) {
        throw new BadRequestError("The requested appointment time is unavailable");
    }
}

export async function createAppointmentService(appointment: CreateAppointment, userUuid: string) {
    const [service, roomId] = await Promise.all([
        getService(appointment.serviceUuid, appointment.organizationUuid),
        getRoomIdByUserUuid(appointment.workerUuid, appointment.organizationUuid),
    ]);

    if (!service) {
        throw new NotFoundError("Service not found");
    }

    if (!roomId) {
        throw new NotFoundError("Room not found");
    }

    await validateRequestedSlot(
        appointment.organizationUuid,
        userUuid,
        appointment.serviceUuid,
        appointment.workerUuid,
        appointment.timeType,
        appointment.scheduledStartAtUTC,
    );

    const scheduledStartAtUTC = new Date(appointment.scheduledStartAtUTC);
    const scheduledEndAtUTC = new Date(scheduledStartAtUTC.getTime() + service.durationInMinutes * 60_000);

    const {
        scheduledStartAtUTC: _scheduledStartAtUTC,
        ...appointmentValues
    } = appointment;

    const result = await createByUser({
        ...appointmentValues,
        userUuid,
        roomId,
        scheduledStartAtUTC,
        scheduledEndAtUTC,
    });

    if (!result) {
        throw new BadRequestError("Unable to create appointment");
    }

    return result;
}

export async function createOrganizationAppointmentService(appointment: CreateOrganizationAppointment, organizationUserUuid: string) {
    await verifyOrganizationOwnership(organizationUserUuid, appointment.organizationUuid);

    const [service, roomId] = await Promise.all([
        getService(appointment.serviceUuid, appointment.organizationUuid),
        getRoomIdByUserUuid(appointment.workerUuid, appointment.organizationUuid),
    ]);

    if (!service) {
        throw new NotFoundError("Service not found");
    }

    if (!roomId) {
        throw new NotFoundError("Room not found");
    }

    await validateRequestedSlot(
        appointment.organizationUuid,
        appointment.userUuid,
        appointment.serviceUuid,
        appointment.workerUuid,
        AppointmentTimeType.WORKER,
        appointment.scheduledStartAtUTC,
    );

    const scheduledStartAtUTC = new Date(appointment.scheduledStartAtUTC);
    const scheduledEndAtUTC = new Date(scheduledStartAtUTC.getTime() + service.durationInMinutes * 60_000);

    const {
        scheduledStartAtUTC: _scheduledStartAtUTC,
        ...appointmentValues
    } = appointment;

    const result = await createByOrganization({
        ...appointmentValues,
        roomId,
        scheduledStartAtUTC,
        scheduledEndAtUTC,
    });

    if (!result) {
        throw new BadRequestError("Unable to create appointment");
    }

    return result;
}

export async function updateAppointmentByUserService(
    appointmentUuid: string,
    userUuid: string,
    appointment: UpdateAppointmentByUser,
) {
    const result = await updateByUser(appointmentUuid, userUuid, {
        userTitle: appointment.userTitle,
        userNote: appointment.userNote,
        userColour: appointment.userColour,
    });

    if (!result) {
        throw new NotFoundError("Appointment not found");
    }

    return result;
}

export async function updateAppointmentByOrganizationService(
    appointmentUuid: string,
    organizationUuid: string,
    userUuid: string,
    appointment: UpdateAppointmentByOrganization,
) {
    await verifyOrganizationOwnership(userUuid, organizationUuid);

    const currentAppointment = await findByUuidAndOrganization(appointmentUuid, organizationUuid);

    if (!currentAppointment) {
        throw new NotFoundError("Appointment not found");
    }

    const nextStatus = appointment.appointmentStatus;
    let expectedStatus: AppointmentStatus | undefined;
    let approvalUserUuid: string | undefined;

    if (nextStatus !== undefined) {
        if (
            nextStatus === AppointmentStatus.PENDING_ORGANIZATION_APPROVAL &&
            currentAppointment.appointmentStatus === AppointmentStatus.PENDING_USER_CONFIRMATION
        ) {
            expectedStatus = AppointmentStatus.PENDING_USER_CONFIRMATION;
        } else if (
            nextStatus === AppointmentStatus.CONFIRMED &&
            currentAppointment.appointmentStatus === AppointmentStatus.PENDING_ORGANIZATION_APPROVAL
        ) {
            expectedStatus = AppointmentStatus.PENDING_ORGANIZATION_APPROVAL;
            approvalUserUuid = userUuid;
        } else if (
            nextStatus === AppointmentStatus.REJECTED &&
            currentAppointment.appointmentStatus === AppointmentStatus.PENDING_ORGANIZATION_APPROVAL
        ) {
            expectedStatus = AppointmentStatus.PENDING_ORGANIZATION_APPROVAL;
            approvalUserUuid = userUuid;
        } else {
            throw new BadRequestError("The appointment status does not allow this transition");
        }
    }

    if (nextStatus === AppointmentStatus.REJECTED && !appointment.rejectionReason?.trim()) {
        throw new BadRequestError("A rejection reason is required");
    }

    if (appointment.rejectionReason !== undefined && nextStatus !== AppointmentStatus.REJECTED) {
        throw new BadRequestError("A rejection reason can only be provided when rejecting an appointment");
    }

    if (
        nextStatus === AppointmentStatus.CONFIRMED &&
        !appointment.organizationTitle?.trim() &&
        !currentAppointment.organizationTitle?.trim()
    ) {
        throw new BadRequestError("An organization title is required before confirming the appointment");
    }

    const result = await updateByOrganization(
        appointmentUuid,
        organizationUuid,
        {
            organizationTitle: appointment.organizationTitle,
            organizationNote: appointment.organizationNote,
            organizationColour: appointment.organizationColour,
            appointmentStatus: nextStatus,
            rejectionReason: appointment.rejectionReason,
            paymentMethod: appointment.paymentMethod,
            paymentStatus: appointment.paymentStatus,
        },
        approvalUserUuid,
        expectedStatus,
    );

    if (!result) {
        if (expectedStatus) {
            throw new BadRequestError("The appointment was changed or is no longer eligible for this transition");
        }

        throw new NotFoundError("Appointment not found");
    }

    return result;
}

export async function cancelAppointmentByUserService(appointmentUuid: string, userUuid: string) {
    const result = await cancelByUser(appointmentUuid, userUuid);

    if (!result) {
        throw new NotFoundError("Appointment not found or cannot be cancelled");
    }

    return result;
}