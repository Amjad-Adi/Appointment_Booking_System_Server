"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceJunctionCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const parameters_schema_1 = require("../middlewares/zod-schemas/parameters.schema");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const authorization_1 = require("../middlewares/authorization/authorization");
const permissions_1 = require("../permissions/permissions");
const service_junction_category_conroller_1 = require("../controllers/service-junction-category.conroller");
const service_category_junction_schema_1 = require("../middlewares/zod-schemas/service-category-junction.schema");
exports.serviceJunctionCategoryRouter = express_1.default.Router({
    mergeParams: true
});
exports.serviceJunctionCategoryRouter.route("/")
    .post(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.CREATE_SERVICE), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), (0, validaiton_1.validateBody)(service_category_junction_schema_1.createServiceJunctionCategorySchema), service_junction_category_conroller_1.handleCreateServiceJunctionCategories)
    .patch(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.UPDATE_SERVICE), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), (0, validaiton_1.validateBody)(service_category_junction_schema_1.updateServiceJunctionCategorySchema), service_junction_category_conroller_1.handleUpdateServiceJunctionCategories);
