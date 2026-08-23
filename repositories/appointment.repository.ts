import {pool} from "../databases/postgre-connection"
import {
    Appointment,
    AppointmentOrganizationResponse,
    AppointmentUserResponse,
    CreateAppointmentByOrganization, CreateAppointmentByUser, OrganizationAppointment, QueryAppointmentByOrganization,
    QueryAppointmentByUser, UpdateAppointmentByUser, UserAppointment
} from "../models/appointment.model";

import {
    COLUMN_UUID,
    COLUMN_CREATED_AT_UTC,
    TABLE_NAME,
    ALIAS, ALIAS_COLUMN_CREATED_AT_UTC, SORT_BY_TITLE,
} from "../databases/contracts/appointment.contract";

import { SECONDARY_ALIAS, THIRD_ALIAS,
} from "../databases/contracts/user.contract";

import {QueryService} from "../models/service.model";
import {drizzleConnection} from "../databases/drizzle-connection";
import {workingHoursTable} from "../databases/drizzle-schemas/working-hours.db";
import {organizationTable} from "../databases/drizzle-schemas/organizations.db";
import {and, asc, between, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or} from "drizzle-orm";
import {appointmentTable} from "../databases/drizzle-schemas/appointment.db";
import {usersTable} from "../databases/drizzle-schemas/users.db";
import {alias} from "drizzle-orm/pg-core";
import {serviceTable} from "../databases/drizzle-schemas/service.db";
import {roomTable} from "../databases/drizzle-schemas/room.db";
import {PaymentStatus} from "../models/enums/payment-status";
import {Order} from "../models/enums/order";
import {specialDaysTable} from "../databases/drizzle-schemas/special-days.db";
import {SpecialDay, UpdateSpecialDay} from "../models/special-days.model";
import {drizzleFindIdByUuid} from "./organizaiton.repository";


const userTable=alias(usersTable,ALIAS);
const approvalUsersTable=alias(usersTable,SECONDARY_ALIAS);
const employeeTable=alias(usersTable,THIRD_ALIAS);

export async function findAllByUser(query:QueryAppointmentByUser,userUuid:string):Promise<AppointmentUserResponse[]>{
    const search=query.search?`%${query.search}%`: undefined
    const sortColumnsDefinition={
        title:appointmentTable.userTitle,
        scheduledStartTime:appointmentTable.scheduledStartAtUTC,
        scheduledEndTime:appointmentTable.scheduledEndAtUTC,
        paidAtUTC:appointmentTable.paidAtUTC,
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_TITLE];
    const sortOrder = query.order?.toUpperCase() as string;
    const fromDate=query.filter?.fromDate
    const toDate=query.filter?.toDate
    const serviceUuid=query.filter?.serviceUuid;
    const roomUuid=query.filter?.roomUuid;
    const employeeUuid=query.filter?.employeeUuid;
    const paymentMethod=query.filter?.paymentMethod;
    const paymentStatus=query.filter?.paymentStatus;
    const appointmentStatus=query.filter?.appointmentStatus;
    const organizationUuid=query.filter?.organizationUuid;
    return (await drizzleConnection
        .select({uuid: appointmentTable.uuid, userTitle: appointmentTable.userTitle, userNote: appointmentTable.userNote, createdAtUTC: appointmentTable.createdAtUTC, rejectionReason: appointmentTable.rejectionReason, scheduledStartAtUTC: appointmentTable.scheduledStartAtUTC, scheduledEndAtUTC: appointmentTable.scheduledEndAtUTC, actualStartAtUTC: appointmentTable.actualStartAtUTC, actualEndAtUTC: appointmentTable.actualEndAtUTC, userColour: appointmentTable.userColour, paymentMethod: appointmentTable.paymentMethod, paidAtUTC: appointmentTable.paidAtUTC, appointmentStatus: appointmentTable.appointmentStatus, organizationUuid: organizationTable.uuid, organizationName: organizationTable.name, organizationEmail: organizationTable.email, organizationPhoneNumber: organizationTable.phoneNumber, userUuid: userTable.uuid, userFirstName: userTable.firstName, userLastName: userTable.lastName, userEmail: userTable.email, userProfilePicturePath: userTable.profilePicturePath, employeeUuid: employeeTable.uuid, employeeFirstName: employeeTable.firstName, employeeLastName: employeeTable.lastName, employeeEmail: employeeTable.email, employeeProfilePicturePath: employeeTable.profilePicturePath, roomUuid: roomTable.uuid, roomName: roomTable.name, serviceUuid: serviceTable.uuid, serviceName: serviceTable.name, servicePrice: serviceTable.price, serviceDurationInMinutes:serviceTable.durationInMinutes,})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(
            and(
             eq(userTable.uuid,userUuid)
            ,search ? ilike(appointmentTable.userTitle,search):undefined
            ,fromDate ? gte(appointmentTable.scheduledStartAtUTC,fromDate):undefined
            ,toDate ? lte(appointmentTable.scheduledStartAtUTC,toDate):undefined
            ,organizationUuid ? eq(organizationTable.uuid,organizationUuid):undefined
            ,serviceUuid ? eq(serviceTable.uuid,serviceUuid):undefined
            ,roomUuid ? eq(roomTable.uuid,roomUuid):undefined
            ,employeeUuid ? eq(employeeTable.uuid,employeeUuid):undefined
            ,paymentMethod ? eq(appointmentTable.paymentMethod,paymentMethod):undefined
            ,paymentStatus===PaymentStatus.PAID? isNotNull(appointmentTable.paidAtUTC):
             paymentStatus===PaymentStatus.UNPAID?isNull(appointmentTable.paidAtUTC):undefined
            ,appointmentStatus? eq(appointmentTable.appointmentStatus,appointmentStatus):undefined))
        .orderBy(sortOrder===Order.ASC?asc(sortColumn):desc(sortColumn))
        .limit(query.limit)
        .offset(query.offset))
}
export async function countAllByUser(query:QueryAppointmentByUser,userUuid:string):Promise<number>{
    const search=query.search?`%${query.search}%`: undefined
    const fromDate=query.filter?.fromDate
    const toDate=query.filter?.toDate
    const serviceUuid=query.filter?.serviceUuid;
    const roomUuid=query.filter?.roomUuid;
    const employeeUuid=query.filter?.employeeUuid;
    const paymentMethod=query.filter?.paymentMethod;
    const paymentStatus=query.filter?.paymentStatus;
    const appointmentStatus=query.filter?.appointmentStatus;
    const organizationUuid=query.filter?.organizationUuid;
    return (await drizzleConnection
        .select({count:count(appointmentTable.id)})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(
            and(
                eq(userTable.uuid,userUuid)
                ,search ? ilike(appointmentTable.userTitle,search):undefined
                ,fromDate ? gte(appointmentTable.scheduledStartAtUTC,fromDate):undefined
                ,toDate ? lte(appointmentTable.scheduledStartAtUTC,toDate):undefined
                ,organizationUuid ? eq(organizationTable.uuid,organizationUuid):undefined
                ,serviceUuid ? eq(serviceTable.uuid,serviceUuid):undefined
                ,roomUuid ? eq(roomTable.uuid,roomUuid):undefined
                ,employeeUuid ? eq(employeeTable.uuid,employeeUuid):undefined
                ,paymentMethod ? eq(appointmentTable.paymentMethod,paymentMethod):undefined
                ,paymentStatus===PaymentStatus.PAID? isNotNull(appointmentTable.paidAtUTC):
                    paymentStatus===PaymentStatus.UNPAID?isNull(appointmentTable.paidAtUTC):undefined
                ,appointmentStatus? eq(appointmentTable.appointmentStatus,appointmentStatus):undefined)))[0].count
}


export async function findAllByOrganization(query:QueryAppointmentByOrganization,organizationUuid:string):Promise<AppointmentOrganizationResponse[]>{
    const search=query.search?`%${query.search}%`: undefined
    const sortColumnsDefinition={
        title:appointmentTable.organizationTitle,
        scheduledStartTime:appointmentTable.scheduledStartAtUTC,
        scheduledEndTime:appointmentTable.scheduledEndAtUTC,
        paidAtUTC:appointmentTable.paidAtUTC,
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_TITLE];
    const sortOrder = query.order?.toUpperCase() as string;
    const fromDate=query.filter?.fromDate
    const toDate=query.filter?.toDate
    const serviceUuid=query.filter?.serviceUuid;
    const roomUuid=query.filter?.roomUuid;
    const employeeUuid=query.filter?.employeeUuid;
    const paymentMethod=query.filter?.paymentMethod;
    const paymentStatus=query.filter?.paymentStatus;
    const appointmentStatus=query.filter?.appointmentStatus;
    const userUuid=query.filter?.userUuid;
    const approvalUserUuid=query.filter?.approvalUserUuid;
    return (await drizzleConnection
        .select({uuid: appointmentTable.uuid, organizationTitle: appointmentTable.organizationTitle, organizationNote: appointmentTable.organizationNote, createdAtUTC: appointmentTable.createdAtUTC, rejectionReason: appointmentTable.rejectionReason, scheduledStartAtUTC: appointmentTable.scheduledStartAtUTC, scheduledEndAtUTC: appointmentTable.scheduledEndAtUTC, actualStartAtUTC: appointmentTable.actualStartAtUTC, actualEndAtUTC: appointmentTable.actualEndAtUTC, organizationColour: appointmentTable.organizationColour, paymentMethod: appointmentTable.paymentMethod, paidAtUTC: appointmentTable.paidAtUTC, appointmentStatus: appointmentTable.appointmentStatus,userUuid: userTable.uuid, userFirstName: userTable.firstName, userLastName: userTable.lastName, userEmail: userTable.email, userProfilePicturePath: userTable.profilePicturePath, approvalUserUuid: approvalUsersTable.uuid, approvalUserFirstName: approvalUsersTable.firstName, approvalUserLastName: approvalUsersTable.lastName, approvalUserEmail: approvalUsersTable.email, approvalUserProfilePicturePath: approvalUsersTable.profilePicturePath, employeeUuid: employeeTable.uuid, employeeFirstName: employeeTable.firstName, employeeLastName: employeeTable.lastName, employeeEmail: employeeTable.email, employeeProfilePicturePath: employeeTable.profilePicturePath, roomUuid: roomTable.uuid, roomName: roomTable.name, serviceUuid: serviceTable.uuid, serviceName: serviceTable.name, servicePrice: serviceTable.price, serviceDurationInMinutes:serviceTable.durationInMinutes,})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(
            and(
                eq(organizationTable.uuid,organizationUuid)
                ,search ? ilike(appointmentTable.organizationTitle,search):undefined
                ,fromDate ? gte(appointmentTable.scheduledStartAtUTC,fromDate):undefined
                ,toDate ? lte(appointmentTable.scheduledStartAtUTC,toDate):undefined
                ,userUuid ? eq(userTable.uuid,userUuid):undefined
                ,approvalUserUuid ? eq(approvalUsersTable.uuid,approvalUserUuid):undefined
                ,serviceUuid ? eq(serviceTable.uuid,serviceUuid):undefined
                ,roomUuid ? eq(roomTable.uuid,roomUuid):undefined
                ,employeeUuid ? eq(employeeTable.uuid,employeeUuid):undefined
                ,paymentMethod ? eq(appointmentTable.paymentMethod,paymentMethod):undefined
                ,paymentStatus===PaymentStatus.PAID? isNotNull(appointmentTable.paidAtUTC):
                    paymentStatus===PaymentStatus.UNPAID?isNull(appointmentTable.paidAtUTC):undefined
                ,appointmentStatus? eq(appointmentTable.appointmentStatus,appointmentStatus):undefined))
        .orderBy(sortOrder===Order.ASC?asc(sortColumn):desc(sortColumn))
        .limit(query.limit)
        .offset(query.offset))
}
export async function countAllByOrganization(query:QueryAppointmentByOrganization,organizationUuid:string):Promise<number>{
    const search=query.search?`%${query.search}%`: undefined
    const fromDate=query.filter?.fromDate
    const toDate=query.filter?.toDate
    const serviceUuid=query.filter?.serviceUuid;
    const roomUuid=query.filter?.roomUuid;
    const employeeUuid=query.filter?.employeeUuid;
    const paymentMethod=query.filter?.paymentMethod;
    const paymentStatus=query.filter?.paymentStatus;
    const appointmentStatus=query.filter?.appointmentStatus;
    const userUuid=query.filter?.userUuid;
    const approvalUserUuid=query.filter?.approvalUserUuid;
    return (await drizzleConnection
        .select({count:count(appointmentTable.id)})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(
            and(
                eq(organizationTable.uuid,organizationUuid)
                ,search ? ilike(appointmentTable.organizationTitle,search):undefined
                ,fromDate ? gte(appointmentTable.scheduledStartAtUTC,fromDate):undefined
                ,toDate ? lte(appointmentTable.scheduledStartAtUTC,toDate):undefined
                ,userUuid ? eq(userTable.uuid,userUuid):undefined
                ,approvalUserUuid ? eq(approvalUsersTable.uuid,approvalUserUuid):undefined
                ,serviceUuid ? eq(serviceTable.uuid,serviceUuid):undefined
                ,roomUuid ? eq(roomTable.uuid,roomUuid):undefined
                ,employeeUuid ? eq(employeeTable.uuid,employeeUuid):undefined
                ,paymentMethod ? eq(appointmentTable.paymentMethod,paymentMethod):undefined
                ,paymentStatus===PaymentStatus.PAID? isNotNull(appointmentTable.paidAtUTC):
                    paymentStatus===PaymentStatus.UNPAID?isNull(appointmentTable.paidAtUTC):undefined
                ,appointmentStatus? eq(appointmentTable.appointmentStatus,appointmentStatus):undefined)))[0].count
}

export async function findUserAppointmentByUuid(appointmentUuid:string,userUuid:string):Promise<AppointmentUserResponse>{
    return (await drizzleConnection
        .select({uuid: appointmentTable.uuid, userTitle: appointmentTable.userTitle, userNote: appointmentTable.userNote, createdAtUTC: appointmentTable.createdAtUTC, rejectionReason: appointmentTable.rejectionReason, scheduledStartAtUTC: appointmentTable.scheduledStartAtUTC, scheduledEndAtUTC: appointmentTable.scheduledEndAtUTC, actualStartAtUTC: appointmentTable.actualStartAtUTC, actualEndAtUTC: appointmentTable.actualEndAtUTC, userColour: appointmentTable.userColour, paymentMethod: appointmentTable.paymentMethod, paidAtUTC: appointmentTable.paidAtUTC, appointmentStatus: appointmentTable.appointmentStatus, organizationUuid: organizationTable.uuid, organizationName: organizationTable.name, organizationEmail: organizationTable.email, organizationPhoneNumber: organizationTable.phoneNumber, userUuid: userTable.uuid, userFirstName: userTable.firstName, userLastName: userTable.lastName, userEmail: userTable.email, userProfilePicturePath: userTable.profilePicturePath, employeeUuid: employeeTable.uuid, employeeFirstName: employeeTable.firstName, employeeLastName: employeeTable.lastName, employeeEmail: employeeTable.email, employeeProfilePicturePath: employeeTable.profilePicturePath, roomUuid: roomTable.uuid, roomName: roomTable.name, serviceUuid: serviceTable.uuid, serviceName: serviceTable.name, servicePrice: serviceTable.price, serviceDurationInMinutes:serviceTable.durationInMinutes,})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(and(eq(appointmentTable.uuid,appointmentUuid),eq(userTable.uuid,userUuid))))[0]
}


export async function findOrganizationAppointmentByUuid(appointmentUuid:string,organizationUuid:string):Promise<AppointmentOrganizationResponse>{
    return (await drizzleConnection
        .select({uuid: appointmentTable.uuid, organizationTitle: appointmentTable.organizationTitle, organizationNote: appointmentTable.organizationNote, createdAtUTC: appointmentTable.createdAtUTC, rejectionReason: appointmentTable.rejectionReason, scheduledStartAtUTC: appointmentTable.scheduledStartAtUTC, scheduledEndAtUTC: appointmentTable.scheduledEndAtUTC, actualStartAtUTC: appointmentTable.actualStartAtUTC, actualEndAtUTC: appointmentTable.actualEndAtUTC, organizationColour: appointmentTable.organizationColour, paymentMethod: appointmentTable.paymentMethod, paidAtUTC: appointmentTable.paidAtUTC, appointmentStatus: appointmentTable.appointmentStatus,userUuid: userTable.uuid, userFirstName: userTable.firstName, userLastName: userTable.lastName, userEmail: userTable.email, userProfilePicturePath: userTable.profilePicturePath, approvalUserUuid: approvalUsersTable.uuid, approvalUserFirstName: approvalUsersTable.firstName, approvalUserLastName: approvalUsersTable.lastName, approvalUserEmail: approvalUsersTable.email, approvalUserProfilePicturePath: approvalUsersTable.profilePicturePath, employeeUuid: employeeTable.uuid, employeeFirstName: employeeTable.firstName, employeeLastName: employeeTable.lastName, employeeEmail: employeeTable.email, employeeProfilePicturePath: employeeTable.profilePicturePath, roomUuid: roomTable.uuid, roomName: roomTable.name, serviceUuid: serviceTable.uuid, serviceName: serviceTable.name, servicePrice: serviceTable.price, serviceDurationInMinutes:serviceTable.durationInMinutes,})
        .from(appointmentTable)
        .innerJoin(userTable,eq(userTable.id,appointmentTable.userId))
        .leftJoin(approvalUsersTable,eq(approvalUsersTable.id,appointmentTable.approvalUserId))
        .innerJoin(serviceTable,eq(serviceTable.id,appointmentTable.serviceId))
        .leftJoin(roomTable,eq(roomTable.id,appointmentTable.roomId))
        .innerJoin(organizationTable,eq(organizationTable.id,roomTable.organizationId))
        .innerJoin(employeeTable,eq(employeeTable.id,roomTable.userId))
        .where(and(eq(appointmentTable.uuid,appointmentUuid),eq(organizationTable.uuid,organizationUuid))))[0]
}

export async function createByUser(appointment: CreateAppointmentByUser):Promise<UserAppointment> {
    return (await drizzleConnection
        .insert(appointmentTable)
        .values({userTitle:appointment.userTitle,userNote:appointment.userNote,userColour:appointment.userColour,userId:appointment.userId,scheduledStartAtUTC:appointment.scheduledStartAtUTC,scheduledEndAtUTC:appointment.scheduledEndAtUTC,paymentMethod:appointment.paymentMethod,roomId:appointment.roomId,serviceId:appointment.serviceId})
        .returning({uuid:appointmentTable.uuid,userTitle:appointmentTable.userTitle,userNote:appointmentTable.userNote,userColour:appointmentTable.userColour,createdAtUTC:appointmentTable.createdAtUTC,scheduledStartAtUTC:appointmentTable.scheduledStartAtUTC,scheduledEndAtUTC:appointmentTable.scheduledEndAtUTC,actualStartAtUTC:appointmentTable.actualStartAtUTC,actualEndAtUTC:appointmentTable.actualEndAtUTC,rejectionReason:appointmentTable.rejectionReason,paymentMethod:appointmentTable.paymentMethod,paidAtUTC:appointmentTable.paidAtUTC,appointmentStatus:appointmentTable.appointmentStatus}))[0]
}

export async function createByOrganization(appointment: CreateAppointmentByOrganization):Promise<OrganizationAppointment> {
    return (await drizzleConnection
        .insert(appointmentTable)
        .values({organizationTitle:appointment.organizationTitle,organizationNote:appointment.organizationNote,organizationColour:appointment.organizationColour,userId:appointment.userId,scheduledStartAtUTC:appointment.scheduledStartAtUTC,scheduledEndAtUTC:appointment.scheduledEndAtUTC,paymentMethod:appointment.paymentMethod,roomId:appointment.roomId,serviceId:appointment.serviceId,approvalUserId:appointment.approvalUserId,})
        .returning({uuid:appointmentTable.uuid,organizationTitle:appointmentTable.organizationTitle,organizationNote:appointmentTable.organizationNote,organizationColour:appointmentTable.organizationColour,createdAtUTC:appointmentTable.createdAtUTC,scheduledStartAtUTC:appointmentTable.scheduledStartAtUTC,scheduledEndAtUTC:appointmentTable.scheduledEndAtUTC,actualStartAtUTC:appointmentTable.actualStartAtUTC,actualEndAtUTC:appointmentTable.actualEndAtUTC,rejectionReason:appointmentTable.rejectionReason,paymentMethod:appointmentTable.paymentMethod,paidAtUTC:appointmentTable.paidAtUTC,appointmentStatus:appointmentTable.appointmentStatus}))[0]
}


export async function updateByUser(appointment: UpdateAppointmentByUser):Promise<UserAppointment> {
    return (await drizzleConnection
        .update(specialDaysTable)
        .set({userTitle:appointment.userTitle,userNote:appointment.userNote,userColour:appointment.userColour,paymentMethod:appointment.paymentMethod})
        .where(and(eq(appointmentTable.uuid,appointment.uuid),eq(appointmentTable.userId,
            drizzleConnection.select({userId:userTable.id})
                .from(userTable).where(eq(usersTable.uuid,appointment.userUuid)))))
        .returning({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status}))[0]
}

export async function isTodayFound(organizationUuid:string,date:string){
    return (await drizzleConnection
        .select({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(specialDaysTable.organizationId,organizationTable.id))
        .where(and(eq(organizationTable.uuid,organizationUuid),eq(specialDaysTable.dayDate,date))))[0]
}