import {roleRoutes} from "./routes/role.routes";
import express from "express";
export let app = express();
app.use("roles",roleRoutes);