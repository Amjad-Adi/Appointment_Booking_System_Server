"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetAvailableTimes = handleGetAvailableTimes;
const scheduling_service_1 = require("../services/scheduling.service");
const user_service_1 = require("../services/user.service");
async function handleGetAvailableTimes(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const userId = await (0, user_service_1.getUserIdByUuid)(userUuid);
    const result = await (0, scheduling_service_1.getAvailableTimes)(organizationUuid, { ...req.body, userId, });
    return res.status(200).json(result);
}
