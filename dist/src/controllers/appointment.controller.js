"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetAppointments = handleGetAppointments;
exports.handleGetOrganizationAppointments = handleGetOrganizationAppointments;
exports.handleGetOrganizationAppointment = handleGetOrganizationAppointment;
exports.handleGetUserAppointment = handleGetUserAppointment;
exports.handleCreateAppointment = handleCreateAppointment;
exports.handleCreateOrganizationAppointment = handleCreateOrganizationAppointment;
exports.handleUpdateAppointmentByUser = handleUpdateAppointmentByUser;
exports.handleUpdateAppointmentByOrganization = handleUpdateAppointmentByOrganization;
exports.handleConfirmAppointment = handleConfirmAppointment;
exports.handleApproveAppointment = handleApproveAppointment;
exports.handleRejectAppointment = handleRejectAppointment;
exports.handleUpdateAppointmentStatus = handleUpdateAppointmentStatus;
exports.handleCancelAppointment = handleCancelAppointment;
exports.handlePayAppointment = handlePayAppointment;
const appointment_service_js_1 = require("../services/appointment.service.js");
const query_model_js_1 = require("../models/query.model.js");
/*
 * USER / CUSTOMER appointments.
 */
async function handleGetAppointments(req, res) {
    const query = req.validatedQuery;
    query.offset =
        (query.page - 1) *
            query.limit;
    query.filter = {
        ...query.filter,
        userUuid: req.user?.uuid,
    };
    const [appointments, totalNumberOfAppointments,] = await Promise.all([
        (0, appointment_service_js_1.getUserAppointments)(query),
        (0, appointment_service_js_1.getNumberOfAppointments)(query),
    ]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(appointments, totalNumberOfAppointments, baseUrl, query.page, query.limit);
    return res
        .status(200)
        .json(responseResult);
}
/*
 * ORGANIZATION appointments.
 */
async function handleGetOrganizationAppointments(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const query = req.validatedQuery;
    query.offset =
        (query.page - 1) *
            query.limit;
    query.filter = {
        ...query.filter,
        organizationUuid,
    };
    const [appointments, totalNumberOfAppointments,] = await Promise.all([
        (0, appointment_service_js_1.getOrganizationAppointments)(query),
        (0, appointment_service_js_1.getNumberOfAppointments)(query),
    ]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(appointments, totalNumberOfAppointments, baseUrl, query.page, query.limit);
    return res
        .status(200)
        .json(responseResult);
}
/*
 * ORGANIZATION appointment.
 */
async function handleGetOrganizationAppointment(req, res) {
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const result = await (0, appointment_service_js_1.getOrganizationAppointment)(appointmentUuid, organizationUuid);
    return res
        .status(200)
        .json(result);
}
/*
 * USER / CUSTOMER appointment.
 */
async function handleGetUserAppointment(req, res) {
    const appointmentUuid = req.params.appointmentUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.getUserAppointment)(appointmentUuid, userUuid);
    return res
        .status(200)
        .json(result);
}
/*
 * CUSTOMER / USER creates an appointment.
 */
async function handleCreateAppointment(req, res) {
    const appointment = req.body;
    const userUuid = req.user?.uuid;
    appointment.organizationUuid =
        req.user?.organizationUuid;
    const result = await (0, appointment_service_js_1.createAppointmentService)(appointment, userUuid);
    return res
        .status(201)
        .json(result);
}
/*
 * ORGANIZATION creates an appointment.
 */
async function handleCreateOrganizationAppointment(req, res) {
    const appointment = req.body;
    const organizationUuid = req.params.organizationUuid;
    appointment.organizationUuid =
        organizationUuid;
    const organizationUserUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.createOrganizationAppointmentService)(appointment, organizationUserUuid);
    return res
        .status(201)
        .json(result);
}
/*
 * USER updates appointment.
 */
async function handleUpdateAppointmentByUser(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.updateAppointmentByUserService)(appointmentUuid, userUuid, appointment);
    return res
        .status(200)
        .json(result);
}
/*
 * ORGANIZATION updates appointment.
 */
async function handleUpdateAppointmentByOrganization(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const result = await (0, appointment_service_js_1.updateAppointmentByOrganizationService)(appointmentUuid, organizationUuid, appointment);
    return res
        .status(200)
        .json(result);
}
/*
 * Confirm appointment.
 */
async function handleConfirmAppointment(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const approvalUserUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.confirmAppointmentService)(appointmentUuid, organizationUuid, approvalUserUuid, appointment);
    return res
        .status(200)
        .json(result);
}
/*
 * Approve appointment.
 */
async function handleApproveAppointment(req, res) {
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const approvalUserUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.approveAppointmentService)(appointmentUuid, organizationUuid, approvalUserUuid);
    return res
        .status(200)
        .json(result);
}
/*
 * Reject appointment.
 */
async function handleRejectAppointment(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const approvalUserUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.rejectAppointmentService)(appointmentUuid, organizationUuid, approvalUserUuid, appointment);
    return res
        .status(200)
        .json(result);
}
/*
 * Update appointment status.
 */
async function handleUpdateAppointmentStatus(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const organizationUuid = req.params.organizationUuid;
    const result = await (0, appointment_service_js_1.updateAppointmentStatusService)(appointmentUuid, organizationUuid, appointment);
    return res
        .status(200)
        .json(result);
}
/*
 * USER cancels appointment.
 */
async function handleCancelAppointment(req, res) {
    const appointmentUuid = req.params.appointmentUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.cancelAppointmentByUserService)(appointmentUuid, userUuid);
    return res
        .status(200)
        .json(result);
}
/*
 * USER pays appointment.
 */
async function handlePayAppointment(req, res) {
    const appointment = req.body;
    const appointmentUuid = req.params.appointmentUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, appointment_service_js_1.payAppointmentService)(appointmentUuid, userUuid, appointment);
    return res
        .status(200)
        .json(result);
}
