"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = exports.publicRoomRoute = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const room_controller_js_1 = require("../controllers/room.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const permissions_js_1 = require("../permissions/permissions.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const room_schema_js_1 = require("../middlewares/zod-schemas/room.schema.js");
exports.publicRoomRoute = express_1.default.Router();
exports.publicRoomRoute.route('/');
exports.publicRoomRoute.route('/:roomUuid');
exports.roomRouter = express_1.default.Router({
    mergeParams: true,
});
exports.roomRouter.route('/')
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(room_schema_js_1.queryRoomSchema), room_controller_js_1.handleGetOrganizationRooms)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.CREATE_ROOM), (0, validaiton_js_1.validateBody)(room_schema_js_1.createRoomSchema), room_controller_js_1.handleCreateOrganizationRoom);
exports.roomRouter.route('/:roomUuid')
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, 'roomUuid'), room_controller_js_1.handleGetOrganizationRoom)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_ROOM), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, 'roomUuid'), (0, validaiton_js_1.validateBody)(room_schema_js_1.updateRoomSchema), room_controller_js_1.handleUpdateOrganizationRoom);
