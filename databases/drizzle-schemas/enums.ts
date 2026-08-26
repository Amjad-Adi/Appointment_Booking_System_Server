import {pgEnum} from "drizzle-orm/pg-core";
import {ActivationStatus} from "../../server/models/enums/activation-status";
import {Role} from "../../server/models/enums/roles";
import {RoomOccupancyStatus} from "../../server/models/enums/room-occupancy-status";
import {TimeBlockStatus} from "../../server/models/enums/time-block-status.js";
import {DayOfWeek} from "../../server/models/enums/day-of-week";
import {PaymentMethod} from "../../server/models/enums/payment-method.js";
import {AppointmentStatus} from "../../server/models/enums/appointment-status";
export const activationStatusEnum=pgEnum("status",Object.values(ActivationStatus) as [ActivationStatus, ...ActivationStatus[]]);
export const roleEnum=pgEnum("role",Object.values(Role) as [Role, ...Role[]])
export const occupancyStatusEnum=pgEnum("occupancy_status",Object.values(RoomOccupancyStatus) as [RoomOccupancyStatus, ...RoomOccupancyStatus[]])
export const timeBlockStatusEnum=pgEnum("request_status",Object.values(TimeBlockStatus) as [TimeBlockStatus, ...TimeBlockStatus[]])
export const dayOfWeekEnum=pgEnum("day_of_week",Object.values(DayOfWeek) as [DayOfWeek, ...DayOfWeek[]])
export const paymentMethodEnum=pgEnum("payment_method",Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]]);
export const appointmentStatusEnum=pgEnum("appointment_status",Object.values(AppointmentStatus) as [AppointmentStatus, ...AppointmentStatus[]]);
