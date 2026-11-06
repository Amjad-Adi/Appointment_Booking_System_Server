"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.updateLocation = updateLocation;
const location_contract_js_1 = require("../databases/contracts/location.contract.js");
async function create(location, client) {
    const point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
    return (await client.query(`INSERT INTO ${location_contract_js_1.TABLE_NAME}(${location_contract_js_1.COLUMN_NAME}, ${location_contract_js_1.COLUMN_TIMEZONE},${location_contract_js_1.COLUMN_LOCATION_ON_MAP})
                        VALUES ($1,$2, ST_GeomFromText($3,4326))
                        RETURNING ${location_contract_js_1.COLUMN_ID}, ${location_contract_js_1.COLUMN_NAME},ST_X(${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${location_contract_js_1.COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${location_contract_js_1.COLUMN_CREATED_AT_UTC}, ${location_contract_js_1.COLUMN_TIMEZONE}, ${location_contract_js_1.COLUMN_CREATED_AT_UTC} as ${location_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC}, ${location_contract_js_1.COLUMN_UPDATED_AT_UTC} as ${location_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}`, [location.name, location.timezone, point])).rows[0];
}
async function updateLocation(location, client) {
    let point = null;
    if (location.locationOnMap != null) {
        point = `POINT(${location.locationOnMap[0]} ${location.locationOnMap[1]})`;
    }
    console.log(location);
    return (await client.query(`UPDATE ${location_contract_js_1.TABLE_NAME}
         SET ${location_contract_js_1.COLUMN_NAME}=COALESCE($1,${location_contract_js_1.COLUMN_NAME}),
             ${location_contract_js_1.COLUMN_TIMEZONE}=COALESCE($2,${location_contract_js_1.COLUMN_TIMEZONE}),
             ${location_contract_js_1.COLUMN_LOCATION_ON_MAP}=COALESCE($3,${location_contract_js_1.COLUMN_LOCATION_ON_MAP}),
             ${location_contract_js_1.COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${location_contract_js_1.COLUMN_ID} = $4
         RETURNING ${location_contract_js_1.COLUMN_ID}, ${location_contract_js_1.COLUMN_NAME},ST_X(${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) as ALIAS_LONGITUDE,ST_Y(${location_contract_js_1.COLUMN_LOCATION_ON_MAP})  as ALIAS_LATITUDE,${location_contract_js_1.COLUMN_CREATED_AT_UTC}, ${location_contract_js_1.COLUMN_TIMEZONE}, ${location_contract_js_1.COLUMN_CREATED_AT_UTC} as ${location_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC}, ${location_contract_js_1.COLUMN_UPDATED_AT_UTC} as ${location_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}`, [location.name, location.timezone, point, location.id])).rows[0];
}
