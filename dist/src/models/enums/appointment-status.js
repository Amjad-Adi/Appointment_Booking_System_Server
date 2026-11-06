"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatus = void 0;
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING_USER_CONFIRMATION"] = "PENDING_USER_CONFIRMATION";
    AppointmentStatus["PENDING_ORGANIZATION_APPROVAL"] = "PENDING_ORGANIZATION_APPROVAL";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["REJECTED"] = "REJECTED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
