import { getOrganization } from "./organization.service";
import { getService } from "./service.service";
import { getRooms } from "./room.service";
import { getWorkingHours } from "./working-hours.services";
import { getSpecialDays } from "./special-days.service";
import { getUsers, getUser } from "./user.service";
import { findBlockingIntervals } from "../repositories/scheduling.repository";
import type { SchedulingInterval, SchedulingOption, SchedulingRequest, SchedulingResponse } from "../models/scheduling.model";
import { AppointmentTimeType } from "../models/enums/appointment-time-type";
import { ActivationStatus } from "../models/enums/activation-status";
import { DayOfWeek } from "../models/enums/day-of-week";
import { Role } from "../models/enums/roles";

const OPTIONS_PER_WORKER = 3;
const SEARCH_DAYS = 30;
const PAGE_LIMIT = 1000;
const MINUTE_MS = 60 * 1000;

const DAY_NAMES: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
];

interface TimestampInterval {
    start: number;
    end: number;
}

interface Candidate {
    start: number;
    end: number;
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(timeZone: string, includeTime: boolean): Intl.DateTimeFormat {
    const cache = includeTime ? dateTimeFormatters : dateFormatters;
    let formatter = cache.get(timeZone);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit",
            ...(includeTime && { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", }), });
        cache.set(timeZone, formatter);
    }
    return formatter;
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
    const parts = getDateFormatter(timeZone, true).formatToParts(date);
    const values: Record<string, number> = {};
    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = Number(part.value);
        }
    }
    const asUTC = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second,);
    return asUTC - date.getTime();
}

function organizationLocalToUTC(localDateTime: string, timeZone: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(localDateTime);
    if (!match) {
        throw new Error(`Invalid local date/time: ${localDateTime}`);
    }
    const [, year, month, day, hours, minutes, seconds = "0"] = match;
    const naiveUTC = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds),);
    const firstOffset = getTimeZoneOffset(new Date(naiveUTC), timeZone);
    const firstGuess = new Date(naiveUTC - firstOffset);
    const secondOffset = getTimeZoneOffset(firstGuess, timeZone);
    return new Date(naiveUTC - secondOffset);
}

function getLocalDate(date: Date, timeZone: string): string {
    const parts = getDateFormatter(timeZone, false).formatToParts(date);
    const values: Record<string, string> = {};
    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }
    return `${values.year}-${values.month}-${values.day}`;
}

function addCalendarDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T12:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

function getDayOfWeek(dateString: string): DayOfWeek {
    return DAY_NAMES[new Date(`${dateString}T12:00:00.000Z`).getUTCDay()];
}

function getWorkingDateTime(dateString: string, time: string, timeZone: string): Date {
    const normalizedTime = time.length >= 8 ? time.slice(0, 8) : time;
    return organizationLocalToUTC(`${dateString}T${normalizedTime}`, timeZone);
}

function mergeIntervals(intervals: SchedulingInterval[]): TimestampInterval[] {
    if (intervals.length === 0) {
        return [];
    }
    const sorted = intervals
        .map(interval => ({ start: interval.startAtUTC.getTime(), end: interval.endAtUTC.getTime() }))
        .filter(interval => interval.end > interval.start)
        .sort((a, b) => a.start - b.start);
    if (sorted.length === 0) {
        return [];
    }
    const merged: TimestampInterval[] = [{ start: sorted[0].start, end: sorted[0].end, }];
    for (let i = 1; i < sorted.length; i++) {
        const interval = sorted[i];
        const last = merged[merged.length - 1];
        if (interval.start <= last.end) {
            last.end = Math.max(last.end, interval.end);
        }
        else {
            merged.push({ start: interval.start, end: interval.end, });
        }
    }
    return merged;
}

function findAvailableCandidates(workingStart: number, workingEnd: number, durationInMinutes: number, blockingIntervals: SchedulingInterval[],preferredStart: number,): Candidate[] {
    const duration = durationInMinutes * MINUTE_MS;
    if (duration <= 0 || workingEnd - workingStart < duration) {
        return [];
    }
    const mergedIntervals = mergeIntervals(blockingIntervals);
    const candidates: Candidate[] = [];
    const seenStarts = new Set<number>();
    const addCandidate = (start: number, freeEnd: number) => {
        const end = start + duration;
        if (start < workingStart || end > freeEnd || end > workingEnd) {
            return;
        }
        if (seenStarts.has(start)) {
            return;
        }
        seenStarts.add(start);
        candidates.push({ start, end });
    };
    const inspectFreeInterval = (freeStart: number, freeEnd: number) => {
        if (freeEnd - freeStart < duration) {
            return;
        }
        addCandidate(freeStart, freeEnd);
        const nearestStart = Math.max(freeStart, Math.min(preferredStart, freeEnd - duration),);
        addCandidate(nearestStart, freeEnd);
    };

    let freeStart = workingStart;
    for (const interval of mergedIntervals) {
        if (interval.end <= freeStart) {
            continue;
        }
        if (interval.start >= workingEnd) {
            break;
        }
        const blockStart = Math.max(interval.start, workingStart);
        const blockEnd = Math.min(interval.end, workingEnd);
        inspectFreeInterval(freeStart, blockStart);
        freeStart = Math.max(freeStart, blockEnd);
        if (freeStart >= workingEnd) {
            break;
        }
    }
    inspectFreeInterval(freeStart, workingEnd);
    candidates.sort((a, b) => {
        const distanceA = Math.abs(a.start - preferredStart);
        const distanceB = Math.abs(b.start - preferredStart);
        return distanceA - distanceB || a.start - b.start;
    });
    return candidates;
}

function compareOptions(a: SchedulingOption, b: SchedulingOption, preferredStart: number): number {
    const startA = Date.parse(a.scheduledStartAtUTC);
    const startB = Date.parse(b.scheduledStartAtUTC);
    return Math.abs(startA - preferredStart) - Math.abs(startB - preferredStart) || startA - startB;
}

export async function getAvailableTimes(request: SchedulingRequest): Promise<SchedulingResponse> {
    const organizationUuid=request.organizationUuid;
    const fromAtUTC = request.fromAtUTC ? new Date(request.fromAtUTC) : new Date();
    if (Number.isNaN(fromAtUTC.getTime())) {
        throw new Error("Invalid fromAtUTC");
    }
    const organization = await getOrganization(organizationUuid);
    const organizationTimeZone = organization.location.timezone;
    if (!organizationTimeZone) {
        throw new Error("Organization timezone is required for scheduling");
    }
    const service = await getService(request.serviceUuid, organizationUuid);
    if (service.durationInMinutes <= 0) {
        throw new Error("Service duration must be greater than zero");
    }
    const firstDateString = getLocalDate(fromAtUTC, organizationTimeZone);
    const lastDateString = addCalendarDays(firstDateString, SEARCH_DAYS - 1);
    const workersPromise = request.timeType === AppointmentTimeType.WORKER
        ? getUser(request.workerUuid as string, organization.uuid).then(worker => [worker]) : getUsers({
            filter: {
                organizationUuid,
                role: Role.WORKER,
                status: ActivationStatus.ACTIVE,
            },
            page: 1,
            limit: PAGE_LIMIT,
        });
    const roomsPromise = getRooms({
        filter: {
            organizationUuid,
            status: ActivationStatus.ACTIVE,
        },
        page: 1,
        limit: PAGE_LIMIT,
    });
    const specialDaysPromise = getSpecialDays({
        page: 1,
        limit: PAGE_LIMIT,
        filter: {
            organizationUuid,
            status: ActivationStatus.ACTIVE,
            fromDate: firstDateString,
            toDate: lastDateString,
        },
    });
    const workingHoursPromise = Promise.all(
        DAY_NAMES.map(dayOfWeek => getWorkingHours({
            filter: {
                organizationUuid,
                dayOfWeek,
            },
            page: 1,
            limit: PAGE_LIMIT,
        })),
    );
    const [workers, organizationRooms, specialDays, workingHoursByDay] = await Promise.all([workersPromise, roomsPromise, specialDaysPromise, workingHoursPromise,]);
    if (workers.length === 0 || organizationRooms.length === 0) {
        return { workers: [] };
    }
    const specialDates = new Set(
        specialDays.map(day => day.dayDate),
    );
    const workingHoursMap = new Map<DayOfWeek, typeof workingHoursByDay[number][number]>();
    for (let i = 0; i < DAY_NAMES.length; i++) {
        const hours = workingHoursByDay[i][0];
        if (hours?.startTime && hours?.endTime) {
            workingHoursMap.set(DAY_NAMES[i], hours);
        }
    }
    const roomsByWorker = new Map<string, typeof organizationRooms>();
    for (const room of organizationRooms) {
        if (!room.userUuid) {
            continue;
        }
        const rooms = roomsByWorker.get(room.userUuid);
        if (rooms) {
            rooms.push(room);
        }
        else {
            roomsByWorker.set(room.userUuid, [room]);
        }
    }
    const workingPeriods: { dateString: string; start: number; end: number; }[] = [];
    for (let dayOffset = 0; dayOffset < SEARCH_DAYS; dayOffset++) {
        const dateString = addCalendarDays(firstDateString, dayOffset);
        if (specialDates.has(dateString)) {
            continue;
        }
        const dayOfWeek = getDayOfWeek(dateString);
        const hours = workingHoursMap.get(dayOfWeek);
        if (!hours) {
            continue;
        }
        const start = getWorkingDateTime(dateString, hours.startTime as string, organizationTimeZone,).getTime();
        const end = getWorkingDateTime(dateString, hours.endTime as string, organizationTimeZone,).getTime();
        if (start >= end) {
            continue;
        }
        workingPeriods.push({ dateString, start, end, });
    }
    if (workingPeriods.length === 0) {
        return { workers: [] };
    }
    const searchStart = Math.min(...workingPeriods.map(period => period.start));
    const searchEnd = Math.max(...workingPeriods.map(period => period.end));
    const workerRooms = workers.flatMap(worker => (roomsByWorker.get(worker.uuid) ?? []).map(room => ({ worker, room })),);
    const blockingIntervals = new Map<string, SchedulingInterval[]>();
    await Promise.all(
        workerRooms.map(async ({ worker, room }) => {
            const intervals = await findBlockingIntervals(organizationUuid, worker.uuid, room.uuid, request.userUuid, new Date(searchStart).toISOString(), new Date(searchEnd).toISOString())
            blockingIntervals.set(`${worker.uuid}:${room.uuid}`, intervals,)}));
    const workerOptions = new Map<string, SchedulingOption[]>();
    for (const worker of workers) {
        workerOptions.set(worker.uuid, []);
    }
    const preferredStart = fromAtUTC.getTime();
    for (const period of workingPeriods) {
        for (const worker of workers) {
            const currentWorkerOptions = workerOptions.get(worker.uuid)!;
            const rooms = roomsByWorker.get(worker.uuid);
            if (!rooms?.length) {
                continue;
            }
            for (const room of rooms) {
                const intervals = blockingIntervals.get(`${worker.uuid}:${room.uuid}`,) ?? [];
                const dayIntervals = intervals.filter(interval => interval.startAtUTC.getTime() < period.end && interval.endAtUTC.getTime() > period.start);
                const candidates = findAvailableCandidates(period.start, period.end, service.durationInMinutes, dayIntervals, preferredStart,);
                for (const candidate of candidates) {
                    const startISO = new Date(candidate.start).toISOString();
                    if (currentWorkerOptions.some(option => option.scheduledStartAtUTC === startISO,)) {
                        continue;
                    }
                    const option: SchedulingOption = {
                        organization: {
                            uuid: organization.uuid,
                            name: organization.name,
                        },
                        service: {
                            uuid: service.uuid,
                            name: service.name,
                            durationInMinutes: service.durationInMinutes,
                        },
                        room: {
                            uuid: room.uuid,
                            name: room.name,
                        },
                        scheduledStartAtUTC: startISO,
                        scheduledEndAtUTC: new Date(candidate.end).toISOString(),
                    };
                    currentWorkerOptions.push(option);
                }
            }
        }
        for (const worker of workers) {
            const options = workerOptions.get(worker.uuid)!;
            options.sort((a, b) => compareOptions(a, b, preferredStart));
            if (options.length > OPTIONS_PER_WORKER) {
                options.length = OPTIONS_PER_WORKER;
            }
        }
        if (workers.every(worker => workerOptions.get(worker.uuid)!.length >= OPTIONS_PER_WORKER)) {
            break;
        }
    }
    const groupedWorkers = workers
        .map(worker => ({
            worker: {
                uuid: worker.uuid,
                firstName: worker.firstName,
                lastName: worker.lastName,
                profilePicturePath: worker.profilePicturePath,
            },
            options: workerOptions.get(worker.uuid) ?? [],
        })).filter(group => group.options.length > 0);
    return { workers: groupedWorkers };
}
