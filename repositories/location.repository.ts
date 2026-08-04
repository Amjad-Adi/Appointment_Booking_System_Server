import {PoolClient, QueryResult} from "pg";
import {TABLE_NAME,COLUMN_ID, COLUMN_UUID ,COLUMN_NAME,COLUMN_LOCATION_ON_MAP,ALIAS_LONGITUDE,ALIAS_LATITUDE,COLUMN_CREATED_AT_UTC,COLUMN_UPDATED_AT_UTC} from "../databases/contract/location.contract"
import {CreateLocation,LocationResponse,Location} from "../models/location";
import {UpdateOrganization} from "../models/organization";
export async function create(location: CreateLocation, client:PoolClient):Promise<QueryResult<Location>> {
    try{
        const point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
        return await client.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME}, ${COLUMN_LOCATION_ON_MAP},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC})
                            VALUES ($1, ST_GeomFromText($2,4326),$3,$4)
                            RETURNING ${COLUMN_ID}, ${COLUMN_UUID}, ${COLUMN_NAME},ST_X(${COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC}`,
            [location.name,point,location.createdATUTC,location.updatedAtUTC])
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}