import type {
    Request,
    Response,
} from "express";

import {
    getAppointments,
    getNumberOfAppointments,
    getAppointment,
    getOrganizationAppointment,
    getUserAppointment,
    createAppointmentService,
    updateAppointmentByOrganizationService,
    updateAppointmentByUserService,
    confirmAppointmentService,
    approveAppointmentService,
    rejectAppointmentService,
    updateAppointmentStatusService,
    cancelAppointmentByUserService,
    payAppointmentService,
} from "../services/appointment.service.js";

import type {
    QueryAppointment,
    CreateAppointment,
    UpdateAppointmentByUser,
    UpdateAppointmentByOrganization,
    ConfirmAppointment,
    RejectAppointment,
    UpdateAppointmentStatus,
    PayAppointment,
} from "../models/appointment.model.js";

import {
    QueryResponse,
} from "../models/query.model.js";


export async function handleGetAppointments(
    req: Request,
    res: Response,
) {
    const query =
        req.validatedQuery as unknown as QueryAppointment;

    query.offset =
        (query.page - 1) * query.limit;

    const organizationUuid =
        req.user?.organizationUuid;

    if (organizationUuid) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }

    const [
        appointments,
        totalNumberOfAppointments,
    ] = await Promise.all([
        getAppointments(query),
        getNumberOfAppointments(query),
    ]);

    const baseUrl =
        req.originalUrl?.split("?")[0];

    const responseResult =
        new QueryResponse(
            appointments,
            totalNumberOfAppointments,
            baseUrl,
            query.page,
            query.limit,
        );

    return res
        .status(200)
        .json(responseResult);
}


export async function handleGetOrganizationAppointments(
    req: Request,
    res: Response,
) {
    const organizationUuid =
        req.params.organizationUuid as string;

    const query =
        req.validatedQuery as unknown as QueryAppointment;

    query.offset =
        (query.page - 1) * query.limit;

    query.filter = {
        ...query.filter,
        organizationUuid,
    };

    const [
        appointments,
        totalNumberOfAppointments,
    ] = await Promise.all([
        getAppointments(query),
        getNumberOfAppointments(query),
    ]);

    const baseUrl =
        req.originalUrl?.split("?")[0];

    const responseResult =
        new QueryResponse(
            appointments,
            totalNumberOfAppointments,
            baseUrl,
            query.page,
            query.limit,
        );

    return res
        .status(200)
        .json(responseResult);
}


export async function handleGetAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.user?.organizationUuid;

    const result =
        await getAppointment(
            appointmentUuid,
            organizationUuid,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleGetOrganizationAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const result =
        await getOrganizationAppointment(
            appointmentUuid,
            organizationUuid,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleGetUserAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await getUserAppointment(
            appointmentUuid,
            userUuid,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleCreateAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as CreateAppointment;

    const userUuid =
        req.user?.uuid as string;

    appointment.organizationUuid =
        req.user?.organizationUuid as string;

    const result =
        await createAppointmentService(
            appointment,
            userUuid,
        );

    return res
        .status(201)
        .json(result);
}


export async function handleUpdateAppointmentByUser(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentByUser;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await updateAppointmentByUserService(
            appointmentUuid,
            userUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleUpdateAppointmentByOrganization(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentByOrganization;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const result =
        await updateAppointmentByOrganizationService(
            appointmentUuid,
            organizationUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleConfirmAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as ConfirmAppointment;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const approvalUserUuid =
        req.user?.uuid as string;

    const result =
        await confirmAppointmentService(
            appointmentUuid,
            organizationUuid,
            approvalUserUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleApproveAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const approvalUserUuid =
        req.user?.uuid as string;

    const result =
        await approveAppointmentService(
            appointmentUuid,
            organizationUuid,
            approvalUserUuid,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleRejectAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as RejectAppointment;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const approvalUserUuid =
        req.user?.uuid as string;

    const result =
        await rejectAppointmentService(
            appointmentUuid,
            organizationUuid,
            approvalUserUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleUpdateAppointmentStatus(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentStatus;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const result =
        await updateAppointmentStatusService(
            appointmentUuid,
            organizationUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}


export async function handleCancelAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await cancelAppointmentByUserService(
            appointmentUuid,
            userUuid,
        );

    return res
        .status(200)
        .json(result);
}


export async function handlePayAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as PayAppointment;

    const appointmentUuid =
        req.params.appointmentUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await payAppointmentService(
            appointmentUuid,
            userUuid,
            appointment,
        );

    return res
        .status(200)
        .json(result);
}