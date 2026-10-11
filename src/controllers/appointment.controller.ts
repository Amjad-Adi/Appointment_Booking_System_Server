import type { Request, Response } from "express";
import {
    getUserAppointments,
    getOrganizationAppointments,
    getNumberOfAppointments,
    getOrganizationAppointment,
    getUserAppointment,
    createAppointmentService,
    createOrganizationAppointmentService,
    updateAppointmentByOrganizationService,
    updateAppointmentByUserService,
    cancelAppointmentByUserService,
} from "../services/appointment.service";
import type {
    QueryAppointment,
    CreateAppointment,
    CreateOrganizationAppointment,
    UpdateAppointmentByUser,
    UpdateAppointmentByOrganization,
} from "../models/appointment.model";
import { QueryResponse } from "../models/query.model";

export async function handleGetAppointments(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryAppointment;

    query.offset = (query.page - 1) * query.limit;
    query.filter = {
        ...query.filter,
        userUuid: req.user?.uuid as string,
    };

    const [appointments, totalNumberOfAppointments] = await Promise.all([
        getUserAppointments(query),
        getNumberOfAppointments(query, "user"),
    ]);

    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult = new QueryResponse(appointments, totalNumberOfAppointments, baseUrl, query.page, query.limit);

    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationAppointments(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    const query = req.validatedQuery as unknown as QueryAppointment;

    query.offset = (query.page - 1) * query.limit;
    query.filter = {
        ...query.filter,
        organizationUuid,
    };

    const [appointments, totalNumberOfAppointments] = await Promise.all([
        getOrganizationAppointments(query),
        getNumberOfAppointments(query, "organization"),
    ]);

    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult = new QueryResponse(appointments, totalNumberOfAppointments, baseUrl, query.page, query.limit);

    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationAppointment(req: Request, res: Response) {
    const result = await getOrganizationAppointment(
        req.params.appointmentUuid as string,
        req.params.organizationUuid as string,
    );

    return res.status(200).json(result);
}

export async function handleGetUserAppointment(req: Request, res: Response) {
    const result = await getUserAppointment(
        req.params.appointmentUuid as string,
        req.user?.uuid as string,
    );

    return res.status(200).json(result);
}

export async function handleCreateAppointment(req: Request, res: Response) {
    const appointment = {
        ...req.body,
        organizationUuid: req.user?.organizationUuid as string,
    } as CreateAppointment;

    const result = await createAppointmentService(appointment, req.user?.uuid as string);

    return res.status(201).json(result);
}

export async function handleCreateOrganizationAppointment(req: Request, res: Response) {
    const appointment = {
        ...req.body,
        organizationUuid: req.params.organizationUuid as string,
    } as CreateOrganizationAppointment;

    const result = await createOrganizationAppointmentService(appointment, req.user?.uuid as string);

    return res.status(201).json(result);
}

export async function handleUpdateAppointmentByUser(req: Request, res: Response) {
    const result = await updateAppointmentByUserService(
        req.params.appointmentUuid as string,
        req.user?.uuid as string,
        req.body as UpdateAppointmentByUser,
    );

    return res.status(200).json(result);
}

export async function handleUpdateAppointmentByOrganization(req: Request, res: Response) {
    const result = await updateAppointmentByOrganizationService(
        req.params.appointmentUuid as string,
        req.params.organizationUuid as string,
        req.user?.uuid as string,
        req.body as UpdateAppointmentByOrganization,
    );
    return res.status(200).json(result);
}

export async function handleCancelAppointment(req: Request, res: Response) {
    const result = await cancelAppointmentByUserService(req.params.appointmentUuid as string, req.user?.uuid as string,);
    return res.status(200).json(result);
}
