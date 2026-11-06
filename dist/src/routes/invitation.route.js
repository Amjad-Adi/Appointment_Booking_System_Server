"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicInvitationsRouter = exports.organizationInvitationsRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const invitations_schema_js_1 = require("../middlewares/zod-schemas/invitations.schema.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const invitation_controller_js_1 = require("../controllers/invitation.controller.js");
const permissions_js_1 = require("../permissions/permissions.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
exports.organizationInvitationsRouter = express_1.default.Router({
    mergeParams: true,
});
exports.organizationInvitationsRouter
    .route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.READ_ORGANIZATION_INVITATIONS), (0, validaiton_js_1.validateQuery)(invitations_schema_js_1.queryInvitationSchema), invitation_controller_js_1.handleGetOrganizationInvitations)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.CREATE_ORGANIZATION_INVITATIONS), (0, validaiton_js_1.validateBody)(invitations_schema_js_1.createInvitationSchema), invitation_controller_js_1.handleCreateOrganizationInvitation);
exports.organizationInvitationsRouter
    .route("/:invitationUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.READ_ORGANIZATION_INVITATIONS), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "invitationUuid"), invitation_controller_js_1.handleGetOrganizationInvitation)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_ORGANIZATION_INVITATIONS), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "invitationUuid"), (0, validaiton_js_1.validateBody)(invitations_schema_js_1.updateInvitationSchema), invitation_controller_js_1.handleUpdateOrganizationInvitation);
exports.publicInvitationsRouter = express_1.default.Router();
exports.publicInvitationsRouter
    .route("/:token")
    .get(invitation_controller_js_1.handleGetPublicInvitation);
exports.publicInvitationsRouter
    .route("/:token/accept")
    .post(invitation_controller_js_1.handleAcceptInvitation);
