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
import { BadRequestError } from "../errors/bad-request.error";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import { Role } from "../models/enums/roles";
import { verifyOrganizationAccess } from "../middlewares/authorization/authorization";

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

    await verifyOrganizationAccess(req, organizationUuid);

    query.offset = (query.page - 1) * query.limit;
    query.filter = {
        ...query.filter,
        organizationUuid,
        ...(req.user?.role === Role.WORKER && { workerUuid: req.user.uuid }),
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
    await verifyOrganizationAccess(req, req.params.organizationUuid as string);

    const result = await getOrganizationAppointment(
        req.params.appointmentUuid as string,
        req.params.organizationUuid as string,
    );

    if (req.user?.role === Role.WORKER && result.workerUuid !== req.user.uuid) {
        throw new NotFoundError("Appointment not found");
    }

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
        organizationUuid: req.body.organizationUuid ?? (req.user?.organizationUuid as string),
    } as CreateAppointment;

    if (!appointment.organizationUuid) {
        throw new BadRequestError("Organization is required");
    }

    const result = await createAppointmentService(appointment, req.user?.uuid as string);

    return res.status(201).json(result);
}

export async function handleCreateOrganizationAppointment(req: Request, res: Response) {
    if (req.user?.role === Role.WORKER) {
        throw new ForbiddenError("Workers cannot create organization appointments");
    }

    const organizationUuid = req.params.organizationUuid as string;
    await verifyOrganizationAccess(req, organizationUuid);

    const appointment = {
        ...req.body,
        organizationUuid,
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
    if (req.user?.role === Role.WORKER) {
        throw new ForbiddenError("Workers cannot update organization appointments");
    }

    await verifyOrganizationAccess(req, req.params.organizationUuid as string);

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
