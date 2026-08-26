import {pool} from "../databases/postgre-connection"
import {
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_EMAIL,
    COLUMN_PHONE_NUMBER,
    COLUMN_BIO,
    COLUMN_LOCATION_ID,
    COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_STATUS,
    TABLE_NAME,
    ALIAS,
    ALIAS_COLUMN_PHONE_NUMBER,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC, COLUMN_ID,
} from "../databases/contracts/organization.contract"
import {
    TABLE_NAME as LOCATION_TABLE_NAME,
    ALIAS as LOCATION_ALIAS,
    COLUMN_ID as LOCATION_COLUMN_ID,
    COLUMN_LOCATION_ON_MAP,
    ALIAS_LONGITUDE,
    ALIAS_LATITUDE,
    COLUMN_NAME as LOCATION_COLUMN_NAME,
    COLUMN_UPDATED_AT_UTC as LOCATION_COLUMN_UPDATED_AT_UTC,
    COLUMN_CREATED_AT_UTC as LOCATION_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_CREATED_AT_UTC as LOCATION_ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC as LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_COLUMN_NAME as LOCATION_ALIAS_COLUMN_NAME,
} from "../databases/contracts/location.contract"
import {
    TABLE_NAME as USER_TABLE_NAME,
    ALIAS as USER_ALIAS,
    COLUMN_ORGANIZATION_ID as USER_COLUMN_ORGANIZATION_ID,
    COLUMN_UUID as USER_COLUMN_UUID,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
} from "../databases/contracts/user.contract"
import {create as createLocation, updateLocation} from "./location.repository"
import {Location, UpdateLocation} from "../models/location.model"
import {CreateOrganization, UpdateOrganization, UpdateOrganizationByAdmin, OrganizationRow, Organization} from "../models/organization.model";
import {setUserOrganizationId} from "./user.repository";
import {drizzleConnection} from "../databases/drizzle-connection";
import {organizationTable} from "../databases/drizzle-schemas/organizations.db";
import {eq} from "drizzle-orm";
export async function findAll():Promise<OrganizationRow[]>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}`)).rows;
}

export async function findByUuid(uuid:string):Promise<OrganizationRow>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_UUID} = $1`,
         [uuid])).rows[0]
}

export async function findIdByUuid(uuid:string):Promise<number>{
    return (await pool.query(
        `SELECT ${COLUMN_ID}
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_UUID} = $1`,
        [uuid])).rows[0]?.id
}

export async function findUserOrganizationByUuid(userUuid:string):Promise<OrganizationRow>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS} ON ${ALIAS}.${COLUMN_ID}=${USER_ALIAS}.${USER_COLUMN_ORGANIZATION_ID}
         LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}
         WHERE ${USER_ALIAS}.${USER_COLUMN_UUID} = $1`,
        [userUuid])).rows[0];
}


export async function findUserOrganizationByEmail(userEmail:string):Promise<OrganizationRow>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS} ON ${ALIAS}.${COLUMN_ID}=${USER_ALIAS}.${USER_COLUMN_ORGANIZATION_ID}
         LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}
         WHERE ${USER_ALIAS}.${USER_COLUMN_EMAIL} = $1`,
        [userEmail])).rows[0];
}

export async function isEmailFound(email:string):Promise<boolean>{
    return (await pool.query(
        `SELECT 1
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_EMAIL} = $1`,
         [email])).rowCount!=0
}


export async function create(organization: CreateOrganization):Promise<Organization> {
    const client = await pool.connect();
    try{
        await client.query("BEGIN")
        const location=organization.location
        let locationId:number|null=null
        if(!(location==null)) {
            const locationData:Location= await createLocation(location,client)
            locationId=locationData.id
        }
        const result= await client.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_LOCATION_ID},${COLUMN_PROFILE_PICTURE_PATH})
                        VALUES ($1,$2,$3,$4,$5,$6)
                        RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_LOCATION_ID},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
                        [organization.name, organization.email,organization.phoneNumber,organization.bio,locationId,organization.profilePicturePath]);
        const organizationId=await findIdByUuid(result.rows[0].uuid);
        await setUserOrganizationId(organizationId,organization.organizationOwnerUuid,client)
        await client.query("COMMIT")
        return result.rows[0];
    } catch (e) {
        await client.query("ROLLBACK")
        throw e;
    }finally {
        client.release()
    }
}

export async function update(organization: UpdateOrganization):Promise<Organization> {
    const client = await pool.connect();
    try{
        await client.query("BEGIN")
        const location:UpdateLocation=organization.location as UpdateLocation
        if(location!==undefined) {
            location.id = (await pool.query(
                `SELECT ${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}
                 FROM ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS}
                JOIN ${TABLE_NAME} ${ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID} = ${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}`)).rows[0].uuid
            await updateLocation(location, client)
        }
        const result= await client.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
                 ${COLUMN_BIO}=COALESCE($2,${COLUMN_BIO}),
                 ${COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${COLUMN_PROFILE_PICTURE_PATH}),
                 ${COLUMN_UPDATED_AT_UTC}=now(),
                 ${COLUMN_STATUS}=COALESCE($4,${COLUMN_STATUS})
             WHERE ${COLUMN_UUID} = $5
             RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_LOCATION_ID},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
             [organization.name,organization.bio, organization.profilePicturePath,organization.status,organization.uuid]);
        await client.query("COMMIT")
        return result.rows[0]
    }catch (e) {
        await client.query("ROLLBACK")
        throw e;
    }finally {
        client.release()
    }
}


export async function updateByAdmin(organization: UpdateOrganizationByAdmin):Promise<Organization> {
    return(await pool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_UPDATED_AT_UTC}=now(),
             ${COLUMN_STATUS}=COALESCE($1,${COLUMN_STATUS})
         WHERE ${COLUMN_UUID} = $2
         RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_LOCATION_ID},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
         [organization.status, organization.uuid])).rows[0];
}

export async function isPhoneNumberFound(phoneNumber: string): Promise<boolean> {
    return (await pool.query(
        `SELECT 1
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_PHONE_NUMBER} = $1`,
        [phoneNumber])).rowCount!=0
}


export function drizzleFindIdByUuid(uuid:string){
    return drizzleConnection
        .select({id:organizationTable.id})
        .from(organizationTable)
        .where(eq(organizationTable.uuid,uuid))
}
