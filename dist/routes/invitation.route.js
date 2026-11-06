"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.invitationRouter = express_1.default.Router();
// invitationRouter.route("/")
//     .get()
//     .post(authenticateUser,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateService)
//
// invitationRouter.route("/:uuid")
//     .get(validateParameter(validateUuid),handleGetService)
//     .patch(authenticateUser,authorizeOrganizationManager,authorize(WRITE_SERVICE),validateParameter(validateUuid),validateBody(updateServiceSchema),handleUpdateService)
