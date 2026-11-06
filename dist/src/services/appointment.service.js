"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAppointments = getUserAppointments;
exports.getOrganizationAppointments = getOrganizationAppointments;
exports.getNumberOfAppointments = getNumberOfAppointments;
exports.getOrganizationAppointment = getOrganizationAppointment;
exports.getUserAppointment = getUserAppointment;
exports.createAppointmentService = createAppointmentService;
exports.createOrganizationAppointmentService = createOrganizationAppointmentService;
exports.updateAppointmentByUserService = updateAppointmentByUserService;
exports.updateAppointmentByOrganizationService = updateAppointmentByOrganizationService;
exports.confirmAppointmentService = confirmAppointmentService;
exports.approveAppointmentService = approveAppointmentService;
exports.rejectAppointmentService = rejectAppointmentService;
exports.updateAppointmentStatusService = updateAppointmentStatusService;
exports.cancelAppointmentByUserService = cancelAppointmentByUserService;
exports.payAppointmentService = payAppointmentService;
const appointment_repository_js_1 = require("../repositories/appointment.repository.js");
const organization_service_js_1 = require("./organization.service.js");
const user_service_js_1 = require("./user.service.js");
const service_service_js_1 = require("./service.service.js");
const room_service_js_1 = require("./room.service.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
/*
 * USER / CUSTOMER appointments.
 */
async function getUserAppointments(query) {
    return (0, appointment_repository_js_1.findAllUser)(query);
}
/*
 * ORGANIZATION appointments.
 */
async function getOrganizationAppointments(query) {
    return (0, appointment_repository_js_1.findAllOrganization)(query);
}
/*
 * Appointment count.
 */
async function getNumberOfAppointments(query) {
    return (0, appointment_repository_js_1.countAll)(query);
}
/*
 * ORGANIZATION appointment.
 */
async function getOrganizationAppointment(appointmentUuid, organizationUuid) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, appointment_repository_js_1.findByUuidAndOrganization)(appointmentUuid, organizationId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * USER / CUSTOMER appointment.
 */
async function getUserAppointment(appointmentUuid, userUuid) {
    const userId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.findByUuidAndUser)(appointmentUuid, userId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * CUSTOMER / USER creates an appointment.
 *
 * The service resolves:
 * - user ID
 * - organization ID
 * - service ID
 * - worker ID
 * - room ID
 * - scheduled end time
 */
async function createAppointmentService(appointment, userUuid) {
    const userId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(appointment.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const service = await (0, service_service_js_1.getService)(appointment.serviceUuid, appointment.organizationUuid);
    const serviceId = await (0, service_service_js_1.getServiceIdByUuid)(appointment.serviceUuid, appointment.organizationUuid);
    if (serviceId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    const workerId = await (0, user_service_js_1.getUserIdByUuid)(appointment.workerUuid);
    if (workerId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Worker");
    }
    const roomId = await (0, room_service_js_1.getRoomIdByUserUuid)(appointment.workerUuid, appointment.organizationUuid);
    if (roomId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Room");
    }
    const scheduledStartAtUTC = new Date(appointment.scheduledStartAtUTC);
    if (Number.isNaN(scheduledStartAtUTC.getTime())) {
        throw new bad_request_error_js_1.BadRequestError("Invalid appointment start time");
    }
    const scheduledEndAtUTC = new Date(scheduledStartAtUTC.getTime() +
        service.durationInMinutes *
            60 *
            1000);
    if (scheduledStartAtUTC >=
        scheduledEndAtUTC) {
        throw new bad_request_error_js_1.BadRequestError("Appointment end time must be after start time");
    }
    const createData = {
        ...appointment,
        userId,
        organizationId,
        serviceId,
        workerId,
        roomId,
        scheduledStartAtUTC,
        scheduledEndAtUTC,
    };
    const result = await (0, appointment_repository_js_1.createByUser)(createData);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError("Appointment could not be created");
    }
    return result;
}
/*
 * ORGANIZATION creates an appointment for a customer.
 */
async function createOrganizationAppointmentService(appointment, organizationUserUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(organizationUserUuid, appointment.organizationUuid);
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(appointment.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const customerId = await (0, user_service_js_1.getUserIdByUuid)(appointment.userUuid);
    if (customerId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const service = await (0, service_service_js_1.getService)(appointment.serviceUuid, appointment.organizationUuid);
    const serviceId = await (0, service_service_js_1.getServiceIdByUuid)(appointment.serviceUuid, appointment.organizationUuid);
    if (serviceId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    const workerId = await (0, user_service_js_1.getUserIdByUuid)(appointment.workerUuid);
    if (workerId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Worker");
    }
    const roomId = await (0, room_service_js_1.getRoomIdByUserUuid)(appointment.workerUuid, appointment.organizationUuid);
    if (roomId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Room");
    }
    const scheduledStartAtUTC = new Date(appointment.scheduledStartAtUTC);
    if (Number.isNaN(scheduledStartAtUTC.getTime())) {
        throw new bad_request_error_js_1.BadRequestError("Invalid appointment start time");
    }
    const scheduledEndAtUTC = new Date(scheduledStartAtUTC.getTime() +
        service.durationInMinutes *
            60 *
            1000);
    if (scheduledStartAtUTC >=
        scheduledEndAtUTC) {
        throw new bad_request_error_js_1.BadRequestError("Appointment end time must be after start time");
    }
    const createData = {
        ...appointment,
        organizationId,
        userId: customerId,
        serviceId,
        workerId,
        roomId,
        scheduledStartAtUTC,
        scheduledEndAtUTC,
    };
    const result = await (0, appointment_repository_js_1.createByOrganization)(createData);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError("Appointment could not be created");
    }
    return result;
}
/*
 * USER updates appointment.
 */
async function updateAppointmentByUserService(appointmentUuid, userUuid, appointment) {
    const userId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.updateByUser)(appointmentUuid, userId, appointment);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * ORGANIZATION updates appointment.
 */
async function updateAppointmentByOrganizationService(appointmentUuid, organizationUuid, appointment) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, appointment_repository_js_1.updateByOrganization)(appointmentUuid, organizationId, appointment);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * Confirm appointment.
 */
async function confirmAppointmentService(appointmentUuid, organizationUuid, approvalUserUuid, appointment) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const approvalUserId = await (0, user_service_js_1.getUserIdByUuid)(approvalUserUuid);
    if (approvalUserId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.confirm)(appointmentUuid, organizationId, approvalUserId, appointment.organizationColour, appointment.organizationNote);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * Approve appointment.
 */
async function approveAppointmentService(appointmentUuid, organizationUuid, approvalUserUuid) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const approvalUserId = await (0, user_service_js_1.getUserIdByUuid)(approvalUserUuid);
    if (approvalUserId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.approve)(appointmentUuid, organizationId, approvalUserId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * Reject appointment.
 */
async function rejectAppointmentService(appointmentUuid, organizationUuid, approvalUserUuid, appointment) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const approvalUserId = await (0, user_service_js_1.getUserIdByUuid)(approvalUserUuid);
    if (approvalUserId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.reject)(appointmentUuid, organizationId, approvalUserId, appointment.rejectionReason);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * Organization updates appointment status.
 */
async function updateAppointmentStatusService(appointmentUuid, organizationUuid, appointment) {
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, appointment_repository_js_1.updateStatus)(appointmentUuid, organizationId, appointment.appointmentStatus);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * USER cancels appointment.
 */
async function cancelAppointmentByUserService(appointmentUuid, userUuid) {
    const userId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.cancelByUser)(appointmentUuid, userId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
/*
 * USER pays appointment.
 */
async function payAppointmentService(appointmentUuid, userUuid, appointment) {
    const userId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    const result = await (0, appointment_repository_js_1.pay)(appointmentUuid, userId, appointment.paymentMethod);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Appointment");
    }
    return result;
}
