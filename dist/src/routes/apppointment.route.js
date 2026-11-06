"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const appointment_controller_js_1 = require("../controllers/appointment.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const validaiton_js_1 = require("../middlewares/validaiton.js");
const appointment_schema_js_1 = require("../middlewares/zod-schemas/appointment.schema.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
exports.appointmentRouter = express_1.default.Router();
exports.appointmentRouter.get("/me", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(appointment_schema_js_1.queryAppointmentSchema), appointment_controller_js_1.handleGetAppointments);
exports.appointmentRouter.get("/:appointmentUuid", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), appointment_controller_js_1.handleGetUserAppointment);
exports.appointmentRouter.post("/", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateBody)(appointment_schema_js_1.createAppointmentSchema), appointment_controller_js_1.handleCreateAppointment);
exports.appointmentRouter.patch("/:appointmentUuid", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.updateAppointmentSchemaByUser), appointment_controller_js_1.handleUpdateAppointmentByUser);
exports.appointmentRouter.patch("/:appointmentUuid/cancel", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), appointment_controller_js_1.handleCancelAppointment);
exports.appointmentRouter.patch("/:appointmentUuid/pay", jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.payAppointmentSchema), appointment_controller_js_1.handlePayAppointment);
