"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const organization_schema_js_1 = require("../middlewares/zod-schemas/organization.schema.js");
const organization_controller_js_1 = require("../controllers/organization.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const permissions_js_1 = require("../permissions/permissions.js");
const service_route_js_1 = require("./service.route.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const invitation_route_1 = require("./invitation.route");
const roles_js_1 = require("../models/enums/roles.js");
const room_route_js_1 = require("./room.route.js");
const working_hours_route_1 = require("./working-hours-route");
const organization_appointment_route_1 = require("./organization-appointment.route");
const time_block_route_1 = require("./time-block.route");
const special_day_route_1 = require("./special-day.route");
const scheduling_route_1 = require("./scheduling.route");
const updateRoleSchemas = {
    [roles_js_1.Role.SUPER_ADMIN]: organization_schema_js_1.updateOrganizationByAdminSchema,
    [roles_js_1.Role.OWNER]: organization_schema_js_1.updateOrganizationSchema,
};
const createRoleSchemas = {
    [roles_js_1.Role.SUPER_ADMIN]: organization_schema_js_1.updateOrganizationByAdminSchema,
    [roles_js_1.Role.OWNER]: organization_schema_js_1.updateOrganizationSchema,
};
exports.organizationRouter = express_1.default.Router();
exports.organizationRouter
    .route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(organization_schema_js_1.queryOrganizationSchema), organization_controller_js_1.handleGetOrganizations)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.CREATE_ORGANIZATION), (0, validaiton_js_1.validateBodyByRole)(createRoleSchemas), organization_controller_js_1.handleCreateOrganization);
exports.organizationRouter.use("/:organizationUuid/services", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), service_route_js_1.serviceRouter);
exports.organizationRouter.use("/:organizationUuid/rooms", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), room_route_js_1.roomRouter);
exports.organizationRouter.use("/:organizationUuid/invitations", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), invitation_route_1.organizationInvitationsRouter);
exports.organizationRouter.use("/:organizationUuid/working-hours", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), working_hours_route_1.workingHoursRouter);
exports.organizationRouter.use("/:organizationUuid/appointments", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), organization_appointment_route_1.organizationAppointmentRouter);
exports.organizationRouter.use("/:organizationUuid/time-blocks", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), time_block_route_1.timeBlockRouter);
exports.organizationRouter.use("/:organizationUuid/special-days", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), special_day_route_1.specialDaysRouter);
exports.organizationRouter.use("/:organizationUuid/scheduling", (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), scheduling_route_1.schedulingRouter);
exports.organizationRouter.route("/:organizationUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), organization_controller_js_1.handleGetOrganization) //parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_ORGANIZATION), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "organizationUuid"), (0, validaiton_js_1.validateBodyByRole)(updateRoleSchemas), organization_controller_js_1.handleUpdateOrganization);
