import {pgEnum} from "drizzle-orm/pg-core";
import {ActivationStatus} from "../../models/enums/activation-status";
import {Role} from "../../models/enums/roles";
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status";
import {DayOfWeek} from "../../models/enums/day-of-week";


export const activationStatusEnum=pgEnum("status",Object.values(ActivationStatus) as [ActivationStatus, ...ActivationStatus[]]);
export const roleEnum=pgEnum("role",Object.values(Role) as [Role, ...Role[]])
export const occupancyStatusEnum=pgEnum("occupancy_status",Object.values(RoomOccupancyStatus) as [RoomOccupancyStatus, ...RoomOccupancyStatus[]])
export const dayOfWeekEnum=pgEnum("day_of_week",Object.values(DayOfWeek) as [DayOfWeek, ...DayOfWeek[]])

