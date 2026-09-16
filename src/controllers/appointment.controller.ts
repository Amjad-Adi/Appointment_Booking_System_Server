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
    updateAppointmentByUser,
    updateAppointmentByOrganization,
    confirmAppointmentService,
    approveAppointmentService,
    rejectAppointmentService,
    updateAppointmentStatusService,
    cancelAppointmentService,
    payAppointmentService,
} from "../services/appointment.service";

import type {
    QueryAppointment,
    CreateAppointment,
    UpdateAppointmentByUser,
    UpdateAppointmentByOrganization,
    ConfirmAppointment,
    RejectAppointment,
    UpdateAppointmentStatus,
    PayAppointment,
} from "../models/appointment.model";

import {
    QueryResponse,
} from "../models/query.model.js";


export async function handleGetAppointments(
    req: Request,
    res: Response,
) {
    const query = req.validatedQuery as unknown as QueryAppointment;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid=req.user?.organizationUuid;
    if(organizationUuid!==null){
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [appointments, totalNumberOfAppointments,] = await Promise.all([getAppointments(query), getNumberOfAppointments(query),]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(appointments, totalNumberOfAppointments, baseUrl, query.page, query.limit,);
    return res.status(200).json(responseResult);
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

    const responseResult = new QueryResponse(
        appointments,
        totalNumberOfAppointments,
        baseUrl,
        query.page,
        query.limit,
    );

    return res.status(200).json(responseResult);
}


export async function handleGetAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;
    const organizationUuid=req.user?.organizationUuid;

    const result = await getAppointment(
            appointmentUuid,organizationUuid);

    return res.status(200).json(result);
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

    return res.status(200).json(result);
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

    return res.status(200).json(result);
}


export async function handleCreateAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as CreateAppointment;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await createAppointmentService(
            appointment,
            userUuid,
        );

    return res.status(201).json(result);
}


export async function handleUpdateAppointmentByUser(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentByUser;

    appointment.uuid = req.params.appointmentUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await updateAppointmentByUser(
            appointment,
        );

    return res.status(200).json(result);
}


export async function handleUpdateAppointmentByOrganization(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentByOrganization;

    appointment.uuid =
        req.params.appointmentUuid as string;

    appointment.organizationUuid =
        req.params.organizationUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await updateAppointmentByOrganization(
            appointment,
        );

    return res.status(200).json(result);
}


export async function handleConfirmAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as ConfirmAppointment;

    appointment.uuid =
        req.params.appointmentUuid as string;

    appointment.organizationUuid =
        req.params.organizationUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await confirmAppointmentService(
            appointment,
        );

    return res.status(200).json(result);
}


export async function handleApproveAppointment(
    req: Request,
    res: Response,
) {
    const appointmentUuid =
        req.params.appointmentUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await approveAppointmentService(
            appointmentUuid,
            organizationUuid,
            userUuid,
        );

    return res.status(200).json(result);
}


export async function handleRejectAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as RejectAppointment;

    appointment.uuid =
        req.params.appointmentUuid as string;

    appointment.organizationUuid =
        req.params.organizationUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await rejectAppointmentService(
            appointment,
        );

    return res.status(200).json(result);
}


export async function handleUpdateAppointmentStatus(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as UpdateAppointmentStatus;

    appointment.uuid =
        req.params.appointmentUuid as string;

    appointment.organizationUuid =
        req.params.organizationUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await updateAppointmentStatusService(
            appointment,
        );

    return res.status(200).json(result);
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
        await cancelAppointmentService(
            appointmentUuid,
            userUuid,
        );

    return res.status(200).json(result);
}


export async function handlePayAppointment(
    req: Request,
    res: Response,
) {
    const appointment =
        req.body as PayAppointment;

    appointment.uuid =
        req.params.appointmentUuid as string;

    appointment.userUuid =
        req.user?.uuid as string;

    const result =
        await payAppointmentService(
            appointment,
        );

    return res.status(200).json(result);
}