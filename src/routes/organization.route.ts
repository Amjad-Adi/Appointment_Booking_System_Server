import express from "express";
import {validateBodyByRole, validateParameter, validateQuery} from "../middlewares/validaiton";
import {
    createOrganizationByAdminSchema,
    createOrganizationSchema,
    queryOrganizationSchema,
    updateOrganizationByAdminSchema,
    updateOrganizationSchema
} from "../middlewares/zod-schemas/organization.schema"
import { queryOrganizationCustomerSchema } from "../middlewares/zod-schemas/user.schema"
import {
    handleCreateOrganization,
    handleGetOrganizations,
    handleGetOrganization, handleUpdateOrganization
} from "../controllers/organization.controller";
import { authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {authorize} from "../middlewares/authorization/authorization";
import {
    CREATE_ORGANIZATION, ORGANIZATION_APPOINTMENT_MANAGEMENT, READ_ORGANIZATIONS,
    READ_ORGANIZATION_CUSTOMERS,
    UPDATE_ORGANIZATION,
} from "../permissions/permissions";
import { handleGetOrganizationCustomers } from "../controllers/user.controller";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import { organizationInvitationsRouter} from "./invitation.route";
import { organizationCustomerInvitationsRouter } from "./customer-invitation.route";
import { organizationReviewRouter } from "./review.route";
import { Role } from "../models/enums/roles";
import {roomRouter} from "./room.route";
import {workingHoursRouter} from "./working-hours-route";
import {organizationAppointmentRouter} from "./organization-appointment.route";
import {timeBlockRouter} from "./time-block.route";
import {specialDaysRouter} from "./special-day.route";
import {schedulingRouter} from "./scheduling.route";
import { handleSingleUpload } from '../config/multer';
import { parseJsonFields } from '../middlewares/parse-json-fields';
import { CLOUDINARY_PICTURE_PATH } from '../databases/contracts/organization.contract';
const updateRoleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
const createRoleSchemas={
    [Role.SUPER_ADMIN]:createOrganizationByAdminSchema,
    [Role.OWNER]:createOrganizationSchema,
};
export const organizationRouter=express.Router()
organizationRouter
    .route("/")
    .get(authenticateToken,authorize(READ_ORGANIZATIONS),validateQuery(queryOrganizationSchema), handleGetOrganizations)
    .post(authenticateToken, authorize(CREATE_ORGANIZATION),handleSingleUpload(CLOUDINARY_PICTURE_PATH),parseJsonFields('location'),validateBodyByRole(createRoleSchemas),handleCreateOrganization);
organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.use("/:organizationUuid/rooms",validateParameter(validateUuid,"organizationUuid"),roomRouter)
organizationRouter.use("/:organizationUuid/invitations",validateParameter(validateUuid,"organizationUuid"),organizationInvitationsRouter)
organizationRouter.use("/:organizationUuid/customer-invitations", validateParameter(validateUuid, "organizationUuid"), organizationCustomerInvitationsRouter)
organizationRouter.use("/:organizationUuid/reviews", validateParameter(validateUuid, "organizationUuid"), organizationReviewRouter)
organizationRouter.use("/:organizationUuid/working-hours",validateParameter(validateUuid,"organizationUuid"),workingHoursRouter)
organizationRouter.use("/:organizationUuid/appointments", validateParameter(validateUuid, "organizationUuid"), organizationAppointmentRouter);
organizationRouter.use("/:organizationUuid/time-blocks", validateParameter(validateUuid, "organizationUuid"), timeBlockRouter);
organizationRouter.use("/:organizationUuid/special-days", validateParameter(validateUuid, "organizationUuid"), specialDaysRouter);
organizationRouter.use("/:organizationUuid/scheduling", validateParameter(validateUuid, "organizationUuid"), schedulingRouter);

organizationRouter.get(
    "/:organizationUuid/customers",
    authenticateToken,
    authorize(READ_ORGANIZATION_CUSTOMERS),
    validateParameter(validateUuid, "organizationUuid"),
    validateQuery(queryOrganizationCustomerSchema),
    handleGetOrganizationCustomers,
);

organizationRouter.route("/:organizationUuid")
    .get(authenticateToken,validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)//parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(authenticateToken,authorize(UPDATE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"), handleSingleUpload(CLOUDINARY_PICTURE_PATH),parseJsonFields('location'),validateBodyByRole(updateRoleSchemas),handleUpdateOrganization)