import {PoolClient} from "pg";
import {
    TABLE_NAME, COLUMN_ID, COLUMN_NAME, COLUMN_LOCATION_ON_MAP, COLUMN_CREATED_AT_UTC, COLUMN_UPDATED_AT_UTC,
    COLUMN_TIMEZONE, ALIAS_COLUMN_CREATED_AT_UTC, ALIAS_COLUMN_UPDATED_AT_UTC
} from "../databases/contracts/location.contract"
import {CreateLocation, Location, UpdateLocation} from "../models/location.model";
import { pool } from '../databases/postgres-connection';

export async function create(location: CreateLocation, client?:PoolClient):Promise<Location> {
    const dbPool=(client)?? pool;
    const point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
    return(await dbPool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME}, ${COLUMN_TIMEZONE},${COLUMN_LOCATION_ON_MAP})
                        VALUES ($1,$2, ST_GeomFromText($3,4326))
                        RETURNING ${COLUMN_ID}, ${COLUMN_NAME},ST_X(${COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${COLUMN_CREATED_AT_UTC}, ${COLUMN_TIMEZONE}, ${COLUMN_CREATED_AT_UTC} as ${ALIAS_COLUMN_CREATED_AT_UTC}, ${COLUMN_UPDATED_AT_UTC} as ${ALIAS_COLUMN_UPDATED_AT_UTC}`,
                        [location.name,location.timezone,point])).rows[0]
}

export async function updateLocation(location: UpdateLocation, client?:PoolClient):Promise<Location> {
    const dbPool=(client)?? pool;
    let point: string|null =null
    if(location.locationOnMap!=null) {
        point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
    }
    return (await dbPool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
             ${COLUMN_TIMEZONE}=COALESCE($2,${COLUMN_TIMEZONE}),
             ${COLUMN_LOCATION_ON_MAP}=COALESCE($3,${COLUMN_LOCATION_ON_MAP}),
             ${COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${COLUMN_ID} = $4
         RETURNING ${COLUMN_ID}, ${COLUMN_NAME},ST_X(${COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${COLUMN_CREATED_AT_UTC}, ${COLUMN_TIMEZONE}, ${COLUMN_CREATED_AT_UTC} as ${ALIAS_COLUMN_CREATED_AT_UTC}, ${COLUMN_UPDATED_AT_UTC} as ${ALIAS_COLUMN_UPDATED_AT_UTC}`,
    [location.name,location.timezone,point,location.id])).rows[0];
}