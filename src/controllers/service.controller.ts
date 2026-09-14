import { type Request, type Response } from "express";

import {
    getService,
    getServices,
    createService,
    updateService,
    getNumberOfServices,
} from "../services/service.service.js";

import {
    CreateService,
    QueryService,
    Service,
    ServiceResponse,
    UpdateService,
} from "../models/service.model.js";

import { QueryResponse } from "../models/query.model.js";
export async function handleGetServices(req: Request, res: Response,) {
    const query: QueryService = req.validatedQuery as unknown as QueryService;
    query.offset = (query.page - 1) * query.limit;
    const [services, totalServices] = await Promise.all([
        getServices(query),
        getNumberOfServices(query),
    ]);
    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult: QueryResponse = new QueryResponse(services, totalServices, baseUrl, query.page, query.limit,)
    return res.status(200).json(responseResult);
}

export async function handleGetService(req: Request, res: Response,) {
    const serviceUuid = req.params.serviceUuid as string;
    const result: ServiceResponse = await getService(serviceUuid);
    return res.status(200).json(result);
}

export async function handleCreateOrganizationService(req: Request, res: Response,){
    const service: CreateService = req.body;
    service.organizationUuid = req.params.organizationUuid as string;
    const userUuid = req.user.uuid as string;
    const result: Service = await createService(service, userUuid);
    return res.status(201).json(result);
}

export async function handleUpdateOrganizationService(req: Request, res: Response,) {
    const service: UpdateService = req.body;
    service.uuid = req.params.serviceUuid as string;
    service.userUuid = req.user.uuid as string;
    service.organizationUuid = req.params.organizationUuid as string;
    const result: Service = await updateService(service);
    return res.status(200).json(result);
}