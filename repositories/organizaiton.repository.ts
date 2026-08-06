import {CreateUser, UpdateUser,UpdateUserByAdmin} from "../models/user"
import {pool} from "../databases/postgre-connection"
import { COLUMN_UUID, COLUMN_NAME, COLUMN_EMAIL, COLUMN_PHONE_NUMBER, COLUMN_BIO, COLUMN_LOCATION_ID, COLUMN_PROFILE_PICTURE_PATH, COLUMN_CREATED_AT_UTC, COLUMN_UPDATED_AT_UTC, COLUMN_STATUS, TABLE_NAME, ALIAS, ALIAS_COLUMN_PHONE_NUMBER, ALIAS_COLUMN_PROFILE_PICTURE_PATH, ALIAS_COLUMN_CREATED_AT_UTC,ALIAS_COLUMN_UPDATED_AT_UTC,} from "../databases/contracts/organization.contract"
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
    ALIAS_COLUMN_UUID as LOCATION_ALIAS_COLUMN_UUID,
    ALIAS_COLUMN_NAME as LOCATION_ALIAS_COLUMN_NAME,
    COLUMN_UUID as LOCATION_COLUMN_UUID,
} from "../databases/contracts/location.contract"
import {QueryResult} from "pg";
import {create as createLocation, updateLocation} from "./location.repository"
import {CreateLocation, LocationResponse, Location, UpdateLocation} from "../models/location"
import {CreateOrganization, UpdateOrganization, UpdateOrganizationByAdmin, OrganizationRow, Organization} from "../models/organization";
export async function findAll():Promise<QueryResult<OrganizationRow>>{
    try{
        return await pool.query(
            `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_UUID} AS ${LOCATION_ALIAS_COLUMN_UUID},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}`)
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function findById(uuid:string):Promise<QueryResult<OrganizationRow>>{
    try {
        return await pool.query(
            `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PHONE_NUMBER} AS ${ALIAS_COLUMN_PHONE_NUMBER},${ALIAS}.${COLUMN_BIO},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${LOCATION_ALIAS}.${LOCATION_COLUMN_UUID} AS ${LOCATION_ALIAS_COLUMN_UUID},${LOCATION_ALIAS}.${LOCATION_COLUMN_NAME} AS ${LOCATION_ALIAS_COLUMN_NAME},ST_X(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LONGITUDE} ,ST_Y(${LOCATION_ALIAS}.${COLUMN_LOCATION_ON_MAP}) AS ${ALIAS_LATITUDE},${LOCATION_ALIAS}.${LOCATION_COLUMN_CREATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_CREATED_AT_UTC},${LOCATION_ALIAS}.${LOCATION_COLUMN_UPDATED_AT_UTC} AS ${LOCATION_ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             LEFT JOIN ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}
             WHERE ${ALIAS}.${COLUMN_UUID} = $1`,
             [uuid])
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function isEmailFound(email:string):Promise<boolean>{
    try {
        return (await pool.query(
            `SELECT 1
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_EMAIL} = $1`,
             [email])).rowCount!=0
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}


export async function create(organization: CreateOrganization):Promise<QueryResult<Organization>> {
    const client = await pool.connect();
    try{
        await client.query("BEGIN")
        let location=organization.location
        let locationId:number|null=null
        if(!(location==null)) {
            let locationData= await createLocation(location,client)
            locationId=locationData.rows[0].id
        }
       let result= await client.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_LOCATION_ID},${COLUMN_PROFILE_PICTURE_PATH})
                        VALUES ($1,$2,$3,$4,$5,$6)
                        RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_LOCATION_ID},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
                        [organization.name, organization.email,organization.phoneNumber,organization.bio,locationId,organization.profilePicturePath]);
        await client.query("COMMIT")
        return result
    } catch (e) {
        console.error(e)
        await client.query("ROLLBACK")
        throw new Error()
    }finally {
        client.release()
    }
}

export async function update(organization: UpdateOrganization, uuid:string):Promise<QueryResult<Organization>> {
    const client = await pool.connect();
    try{
        await client.query("BEGIN")
        let location:UpdateLocation=organization.location as UpdateLocation
        let locationUUID:string=(await pool.query(
            `SELECT ${LOCATION_ALIAS}.${LOCATION_COLUMN_UUID}
             FROM ${LOCATION_TABLE_NAME} ${LOCATION_ALIAS}
             JOIN ${TABLE_NAME} ${ALIAS} ON ${ALIAS}.${COLUMN_LOCATION_ID}=${LOCATION_ALIAS}.${LOCATION_COLUMN_ID}`)).rows[0].uuid
        await updateLocation(location,locationUUID,client)
        let result= await client.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
                 ${COLUMN_BIO}=COALESCE($2,${COLUMN_BIO}),
                 ${COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${COLUMN_PROFILE_PICTURE_PATH}),
                 ${COLUMN_UPDATED_AT_UTC}=now()
             WHERE ${COLUMN_UUID} = $4
             RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_LOCATION_ID},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
             [organization.name,organization.bio, organization.profilePicturePath,uuid]);
        await client.query("COMMIT")
        return result
    }catch (e) {
        console.error(e)
        await client.query("ROLLBACK")
        throw new Error()
    }finally {
        client.release()
    }
}


export async function updateByAdmin(user: UpdateOrganizationByAdmin, uuid:string):Promise<QueryResult<Organization>> {
    try{
        return await pool.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_UPDATED_AT_UTC}=now(),
                 ${COLUMN_STATUS}=COALESCE($2,${COLUMN_STATUS})
             WHERE ${COLUMN_UUID} = $3
             RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_EMAIL},${COLUMN_PHONE_NUMBER},${COLUMN_BIO},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_LOCATION_ID},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
             [user.status, uuid]);
    }catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function isPhoneNumberFound(phoneNumber: string): Promise<boolean> {
    try {
        return (await pool.query(
            `SELECT 1
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_PHONE_NUMBER} = $1`,
            [phoneNumber])).rowCount!=0
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}