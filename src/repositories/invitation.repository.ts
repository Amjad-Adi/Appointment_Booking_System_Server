import {
    AcceptInvitation, CreateInvitation, Invitation, InvitationResponse, QueryInvitation,
    UpdateInvitationByOrganization } from "../models/invitation.model"
import {pool} from "../databases/postgres-connection"
import {
    TABLE_NAME,
    COLUMN_UUID,
    COLUMN_SENDER_ID,
    COLUMN_ORGANIZATION_ID,
    COLUMN_RECIPIENT_EMAIL,
    COLUMN_ROLE,
    COLUMN_TOKEN_HASH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_EXPIRES_AT_UTC,
    COLUMN_INVITATION_STATUS,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_EXPIRES_AT_UTC,
    ALIAS_COLUMN_INVITATION_STATUS,
    ALIAS_RECIPIENT_EMAIL,
    ALIAS_SENDER_UUID,
    ALIAS_SENDER_FIRST_NAME,
    ALIAS_SENDER_LAST_NAME,
    ALIAS_SENDER_EMAIL,
    ALIAS_SENDER_PROFILE_PICTURE_PATH,
    ALIAS_TOTAL_NUMBER_OF_INVITATIONS,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_EXPIRES_AT_UTC, SORT_BY_UPDATED_AT_UTC, COLUMN_UPDATED_AT_UTC
} from "../databases/contracts/invitation.contract"
import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH,
    ALIAS_COLUMN_ORGANIZATION_UUID,
    ALIAS_COLUMN_NAME as ORGANIZATION_ALIAS_COLUMN_NAME,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH
} from "../databases/contracts/organization.contract"
import {
    TABLE_NAME as USER_TABLE_NAME,
    ALIAS as USER_ALIAS,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_UUID as USER_COLUMN_UUID,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
    COLUMN_ORGANIZATION_ID as USER_COLUMN_ORGANIZATION_ID,
    COLUMN_PROFILE_PICTURE_PATH as USER_COLUMN_PROFILE_PICTURE_PATH
} from "../databases/contracts/user.contract"
import {Order} from "../models/enums/order";
import {InvitationStatus} from "../models/enums/invitation-status";
import { mapDatabaseError } from '../utils/map/map-database-error';
import { CreateUser, User } from '../models/user.model';
import {create as createUser} from "../repositories/user.repository"
export async function findAll(query:QueryInvitation):Promise<InvitationResponse[]>{
    const search=query.search?`%${query.search}%`: null
    const sortColumnsDefinition={
        [SORT_BY_CREATED_AT_UTC]:`${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_EXPIRES_AT_UTC]:`${ALIAS}.${COLUMN_EXPIRES_AT_UTC}`,
        [SORT_BY_UPDATED_AT_UTC]:`${ALIAS}.${COLUMN_UPDATED_AT_UTC}`
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_CREATED_AT_UTC]
    const sortOrder =query?.order?.toUpperCase() ?? Order.ASC;
    const {organizationUuid,role, status} = query.filter ?? {};
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL},${ALIAS}.${COLUMN_ROLE},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS},${USER_ALIAS}.${USER_COLUMN_UUID} AS ${ALIAS_SENDER_UUID},${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${ALIAS_SENDER_FIRST_NAME},${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${ALIAS_SENDER_LAST_NAME},${USER_ALIAS}.${USER_COLUMN_EMAIL} AS ${ALIAS_SENDER_EMAIL},${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_SENDER_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ALIAS_COLUMN_ORGANIZATION_UUID},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ORGANIZATION_ALIAS_COLUMN_NAME},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH} AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH}
         FROM ${TABLE_NAME} ${ALIAS}
         INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
         ON ${ALIAS}.${COLUMN_SENDER_ID}= ${USER_ALIAS}.${USER_COLUMN_ID}
         WHERE
         ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_RECIPIENT_EMAIL} ILIKE $1)
           AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_INVITATION_STATUS} = $2)
           AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE} = $3)
           AND ($4::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $3)
         ORDER BY ${sortColumn} ${sortOrder},${ALIAS}.${COLUMN_UUID}
         LIMIT $5
         OFFSET $6`,
        [search,status,role,organizationUuid,query.limit,query.offset])).rows
}

export async function countAll(query:QueryInvitation):Promise<number>{
    const search=query.search?`%${query.search}%`: null
    const {organizationUuid,role, status} = query.filter ?? {};
    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_INVITATIONS}
         FROM ${TABLE_NAME} ${ALIAS}
         INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE
         ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_RECIPIENT_EMAIL} ILIKE $1)
           AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_INVITATION_STATUS} = $2)
           AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE} = $3)
           AND ($4::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $3)`,
        [search,status,role,organizationUuid,query.limit,query.offset])).rows)
}

export async function findByTokenHash(tokenHash: string): Promise<InvitationResponse> {
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL},${ALIAS}.${COLUMN_ROLE},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS},${USER_ALIAS}.${USER_COLUMN_UUID} AS ${ALIAS_SENDER_UUID},${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${ALIAS_SENDER_FIRST_NAME},${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${ALIAS_SENDER_LAST_NAME},${USER_ALIAS}.${USER_COLUMN_EMAIL} AS ${ALIAS_SENDER_EMAIL},${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_SENDER_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ALIAS_COLUMN_ORGANIZATION_UUID},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ORGANIZATION_ALIAS_COLUMN_NAME},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH} AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH}
                FROM ${TABLE_NAME} ${ALIAS}
                INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
                ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
                WHERE ${ALIAS}.${COLUMN_TOKEN_HASH} = $1
                AND ${ALIAS}.${COLUMN_INVITATION_STATUS} = $2
                AND ${ALIAS}.${COLUMN_EXPIRES_AT_UTC} > NOW()`,
                [tokenHash, InvitationStatus.PENDING])).rows[0];
}

export async function findByUuid(invitationUuid:string,organizationUuid:string):Promise<InvitationResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL},${ALIAS}.${COLUMN_ROLE},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS},${USER_ALIAS}.${USER_COLUMN_UUID} AS ${ALIAS_SENDER_UUID},${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${ALIAS_SENDER_FIRST_NAME},${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${ALIAS_SENDER_LAST_NAME},${USER_ALIAS}.${USER_COLUMN_EMAIL} AS ${ALIAS_SENDER_EMAIL},${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_SENDER_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ALIAS_COLUMN_ORGANIZATION_UUID},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ORGANIZATION_ALIAS_COLUMN_NAME},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH} AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH}
         FROM ${TABLE_NAME} ${ALIAS}
         INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
         ON ${ALIAS}.${COLUMN_SENDER_ID}= ${USER_ALIAS}.${USER_COLUMN_ID}
         WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1
           AND ${ALIAS}.${COLUMN_UUID} = $2`,
        [organizationUuid,invitationUuid])).rows[0]
}

export async function create(invitation:CreateInvitation):Promise<Invitation>{
    try{
        //Verify verifyOrganizationOwnership happen Implicitly
    return (await pool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_ORGANIZATION_ID},${COLUMN_SENDER_ID},${COLUMN_RECIPIENT_EMAIL},${COLUMN_ROLE},${COLUMN_TOKEN_HASH},${COLUMN_EXPIRES_AT_UTC})
         SELECT ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID},${USER_ALIAS}.${USER_COLUMN_ID},$2,$3,$4,$5,$6
         FROM ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
         ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}=${USER_ALIAS}.${USER_COLUMN_ORGANIZATION_ID}
         WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID}=$1
         AND ${USER_ALIAS}.${USER_COLUMN_UUID}=$2
        RETURNING ${COLUMN_UUID},${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL},${COLUMN_ROLE},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS}`,
        [invitation.organizationUuid,invitation.senderUuid,invitation.recipientEmail,invitation.role,invitation.tokenHash,invitation.expiresAtUTC])).rows[0];
    }catch(error){
        mapDatabaseError(error)
    }
}

export async function update(invitation: UpdateInvitationByOrganization): Promise<Invitation> {
    try {
        return (await pool.query(
            `UPDATE ${TABLE_NAME}
             SET
                 ${COLUMN_EXPIRES_AT_UTC} = COALESCE($1, ${COLUMN_EXPIRES_AT_UTC}),
                 ${COLUMN_INVITATION_STATUS} = COALESCE($2, ${COLUMN_INVITATION_STATUS}),
                 ${COLUMN_UPDATED_AT_UTC} = NOW(),
             WHERE ${COLUMN_UUID} = $4
                AND ${COLUMN_INVITATION_STATUS} <> $3 
                AND ${COLUMN_ORGANIZATION_ID} = (
                SELECT ${ORGANIZATION_COLUMN_ID}
                FROM ${ORGANIZATION_TABLE_NAME}
                WHERE ${ORGANIZATION_COLUMN_UUID} = $5)
            RETURNING ${COLUMN_UUID}, ${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL}, ${COLUMN_ROLE}, ${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC}, ${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC}, ${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS}`,
            [invitation.expiresAtUTC, invitation.status, InvitationStatus.ACCEPTED, invitation.uuid, invitation.organizationUuid])).rows[0];
    } catch (error) {
        mapDatabaseError(error);
    }
}

export async function acceptInvitationByToken(acceptInvitation:AcceptInvitation): Promise<User> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN")
         const updatedInvitation:Invitation= (await client.query(
            `UPDATE ${TABLE_NAME}
             SET
                 ${COLUMN_INVITATION_STATUS} = $2,
                 ${COLUMN_TOKEN_HASH} = NULL,
                 ${COLUMN_UPDATED_AT_UTC} = NOW()
             WHERE ${COLUMN_TOKEN_HASH} = $1
               AND ${COLUMN_INVITATION_STATUS} = $3
               AND ${COLUMN_EXPIRES_AT_UTC} > NOW()
             RETURNING ${COLUMN_UUID}, ${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_RECIPIENT_EMAIL}, ${COLUMN_ROLE}, ${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC}, ${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC}, ${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_INVITATION_STATUS} AS ${ALIAS_COLUMN_INVITATION_STATUS}`,
            [acceptInvitation.tokenHash, InvitationStatus.ACCEPTED, InvitationStatus.PENDING])).rows[0];
        const user:CreateUser={
            firstName: acceptInvitation.firstName,
            lastName: acceptInvitation.lastName,
            email: updatedInvitation.recipientEmail,
            password: acceptInvitation.password,
            uid:acceptInvitation.uid,
            confirmPassword: acceptInvitation.confirmPassword,
            language: acceptInvitation.language,
            role:updatedInvitation.role,
        }
        const createdUser=await createUser(user, client)
        await client.query("COMMIT")
        return createdUser
    }catch (error) {
        await client.query("ROLLBACK")
        mapDatabaseError(error);
    }finally {
        client.release()
    }
}