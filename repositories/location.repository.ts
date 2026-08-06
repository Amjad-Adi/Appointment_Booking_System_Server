import {PoolClient, QueryResult} from "pg";
import {TABLE_NAME,COLUMN_ID, COLUMN_UUID ,COLUMN_NAME,COLUMN_LOCATION_ON_MAP,COLUMN_CREATED_AT_UTC,COLUMN_UPDATED_AT_UTC} from "../databases/contracts/location.contract"
import {CreateLocation, Location, UpdateLocation} from "../models/location";
export async function create(location: CreateLocation, client:PoolClient):Promise<QueryResult<Location>> {
    try{
        const point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
        return await client.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME}, ${COLUMN_LOCATION_ON_MAP})
                            VALUES ($1, ST_GeomFromText($2,4326))
                            RETURNING ${COLUMN_ID}, ${COLUMN_UUID}, ${COLUMN_NAME},ST_X(${COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${COLUMN_CREATED_AT_UTC}`,
            [location.name,point])
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}
export async function updateLocation(location: UpdateLocation,uuid:string, client:PoolClient):Promise<QueryResult<Location>> {
    try{
        let point: string|null =null
        if(location.locationOnMap!=null) {
            point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
        }
        return await client.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
                 ${COLUMN_LOCATION_ON_MAP}=COALESCE($2,${COLUMN_LOCATION_ON_MAP}),
                 ${COLUMN_UPDATED_AT_UTC}=now()
             WHERE ${COLUMN_UUID} = $3`,
            [location.name,point,uuid]);
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}