"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_APPOINTMENT_STATUSES = void 0;
const appointment_status_js_1 = require("./enums/appointment-status.js");
exports.ACTIVE_APPOINTMENT_STATUSES = [
    appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION,
    appointment_status_js_1.AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
    appointment_status_js_1.AppointmentStatus.CONFIRMED,
    appointment_status_js_1.AppointmentStatus.IN_PROGRESS,
];
