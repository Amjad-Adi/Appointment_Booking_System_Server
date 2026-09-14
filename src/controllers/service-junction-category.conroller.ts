import {
  createServiceJunctionCategories,
  updateServiceJunctionCategories,
} from "../services/service-junction-category.service.js";
import { type Request, type Response } from "express";

export async function handleCreateServiceJunctionCategories(req: Request, res: Response) {
  const organizationUuid = req.params.organizationUuid as string;
  const serviceUuid = req.params.serviceUuid as string;
  const userUuid = req.user.uuid as string;
  const serviceCategoryUuids: string[] = req.body.serviceCategoryUuids;
  await createServiceJunctionCategories(serviceUuid, serviceCategoryUuids, organizationUuid, userUuid);
  return res.status(201).send();
}

export async function handleUpdateServiceJunctionCategories(
    req: Request,
    res: Response
) {
  const organizationUuid = req.params.organizationUuid as string;
  const serviceUuid = req.params.serviceUuid as string;
  const userUuid = req.user.uuid as string;
  const serviceCategoryUuids: string[] = req.body.serviceCategoryUuids;
  await updateServiceJunctionCategories(
      serviceUuid,
      serviceCategoryUuids,
      organizationUuid,
      userUuid
  );
  return res.status(200).send();
}