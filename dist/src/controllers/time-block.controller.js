"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizationTimeBlocks = handleGetOrganizationTimeBlocks;
exports.handleGetOrganizationTimeBlock = handleGetOrganizationTimeBlock;
exports.handleCreateOrganizationTimeBlock = handleCreateOrganizationTimeBlock;
exports.handleUpdateOrganizationTimeBlock = handleUpdateOrganizationTimeBlock;
const time_block_service_js_1 = require("../services/time-block.service.js");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetOrganizationTimeBlocks(req, res) {
    const query = req.validatedQuery;
    query.offset =
        (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid;
    if (organizationUuid != null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [timeBlocks, totalTimeBlocks] = await Promise.all([
        (0, time_block_service_js_1.getTimeBlocks)(query),
        (0, time_block_service_js_1.getNumberOfTimeBlocks)(query),
    ]);
    const totalNumberOfTimeBlocks = await (0, time_block_service_js_1.getNumberOfTimeBlocks)(query);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(timeBlocks, totalNumberOfTimeBlocks, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetOrganizationTimeBlock(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const timeBlockUuid = req.params.timeBlockUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, time_block_service_js_1.getTimeBlock)(timeBlockUuid, organizationUuid, userUuid);
    return res.status(200).json(result);
}
async function handleCreateOrganizationTimeBlock(req, res) {
    const timeBlock = req.body;
    timeBlock.organizationUuid =
        req.params.organizationUuid;
    timeBlock.requestUserUuid =
        req.user?.uuid;
    const result = await (0, time_block_service_js_1.createTimeBlock)(timeBlock);
    return res.status(201).json(result);
}
async function handleUpdateOrganizationTimeBlock(req, res) {
    const timeBlock = req.body;
    timeBlock.uuid =
        req.params.timeBlockUuid;
    timeBlock.organizationUuid =
        req.params.organizationUuid;
    timeBlock.respondUserUuid =
        req.user?.uuid;
    const result = await (0, time_block_service_js_1.updateTimeBlock)(timeBlock);
    return res.status(200).json(result);
}
