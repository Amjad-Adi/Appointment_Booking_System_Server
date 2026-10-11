import {
  createServiceJunctionCategories,
  updateServiceJunctionCategories,
} from "../services/service-junction-category.service";
import { type Request, type Response } from "express";
import { CreateServiceJunctionCategory, UpdateServiceJunctionCategory } from '../models/service-junction-category.model';

export async function handleCreateServiceJunctionCategories(req: Request, res: Response) {
  const organizationUuid = req.params?.organizationUuid as string;
  const serviceUuid = req.params.serviceUuid as string;
  const userUuid = req.user?.uuid as string;
  const serviceJunctionCategory ={...req.body ,organizationUuid,serviceUuid,userUuid} as CreateServiceJunctionCategory;
  await createServiceJunctionCategories(serviceJunctionCategory);
  return res.status(201).send();
}

export async function handleUpdateServiceJunctionCategories(req: Request, res: Response) {
  const organizationUuid = req.params.organizationUuid as string;
  const serviceUuid = req.params.serviceUuid as string;
  const userUuid = req.user?.uuid as string;
  const serviceJunctionCategory ={...req.body ,organizationUuid,serviceUuid,userUuid} as UpdateServiceJunctionCategory;
  await updateServiceJunctionCategories(serviceJunctionCategory)
  return res.status(200).send();
}