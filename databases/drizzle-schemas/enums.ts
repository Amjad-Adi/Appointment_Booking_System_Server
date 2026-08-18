import {pgEnum} from "drizzle-orm/pg-core";
import {ActivationStatus} from "../../models/enums/activation-status";
import {Role} from "../../models/enums/roles";
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status";
import {TimeBlockStatus} from "../../models/enums/time-block-status";

export const activationStatusEnum=pgEnum("status",Object.values(ActivationStatus) as [ActivationStatus, ...ActivationStatus[]]);
export const roleEnum=pgEnum("role",Object.values(Role) as [Role, ...Role[]])
export const occupancyStatusEnum=pgEnum("occupancy_status",Object.values(RoomOccupancyStatus) as [RoomOccupancyStatus, ...RoomOccupancyStatus[]])
export const timeBlockStatusEnum=pgEnum("request_status",Object.values(TimeBlockStatus) as [TimeBlockStatus, ...TimeBlockStatus[]])
