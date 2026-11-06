"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationAppointmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const appointment_controller_js_1 = require("../controllers/appointment.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const validaiton_js_1 = require("../middlewares/validaiton.js");
const appointment_schema_js_1 = require("../middlewares/zod-schemas/appointment.schema.js");
const permissions_js_1 = require("../permissions/permissions.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
exports.organizationAppointmentRouter = express_1.default.Router({
    mergeParams: true,
});
exports.organizationAppointmentRouter.get("/", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateQuery)(appointment_schema_js_1.queryAppointmentSchema), appointment_controller_js_1.handleGetOrganizationAppointments);
exports.organizationAppointmentRouter.get("/:appointmentUuid", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), appointment_controller_js_1.handleGetOrganizationAppointment);
exports.organizationAppointmentRouter.post("/", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.createOrganizationAppointmentSchema), appointment_controller_js_1.handleCreateOrganizationAppointment);
exports.organizationAppointmentRouter.patch("/:appointmentUuid", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.updateAppointmentSchemaByOrganization), appointment_controller_js_1.handleUpdateAppointmentByOrganization);
exports.organizationAppointmentRouter.patch("/:appointmentUuid/confirm", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.confirmAppointmentSchema), appointment_controller_js_1.handleConfirmAppointment);
exports.organizationAppointmentRouter.patch("/:appointmentUuid/approve", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), appointment_controller_js_1.handleApproveAppointment);
exports.organizationAppointmentRouter.patch("/:appointmentUuid/reject", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.rejectAppointmentSchemaBy), appointment_controller_js_1.handleRejectAppointment);
exports.organizationAppointmentRouter.patch("/:appointmentUuid/status", jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "appointmentUuid"), (0, validaiton_js_1.validateBody)(appointment_schema_js_1.updateAppointmentSchemaStatus), appointment_controller_js_1.handleUpdateAppointmentStatus);
