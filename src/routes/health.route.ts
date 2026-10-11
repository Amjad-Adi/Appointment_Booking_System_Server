import express from "express";
import { healthCheck } from '../controllers/health.contoller';

export const healthRoute = express.Router();
healthRoute.route("/")
    .get(healthCheck);