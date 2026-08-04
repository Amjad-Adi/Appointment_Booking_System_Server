import {CreateRole, Role, UpdateRole} from "../models/role"
import {pool} from "../databases/postgre-connection"
import {COLUMN_NAME, COLUMN_STATUS, COLUMN_UUID, TABLE_NAME} from "../databases/contract/role.contract"
import {QueryResult} from "pg";
import {ActivationStatus} from "../models/enums/model-activation-status";

export async function findAll():Promise<QueryResult<any>>{
    try{
        return await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_NAME}, ${COLUMN_STATUS}
             FROM ${TABLE_NAME}`)
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function findById(uuid:string):Promise<QueryResult<any>>{
    try {
        return await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_NAME}, ${COLUMN_STATUS}
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_UUID} = $1`, [uuid])
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function create(role: CreateRole):Promise<QueryResult<any>> {
    try{
        return await pool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME},${COLUMN_STATUS})
                        VALUES ($1,$2)
                        RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_STATUS}`,
                        [role.name,ActivationStatus.ACTIVE]);
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function update(role: UpdateRole, uuid:string):Promise<QueryResult<any>> {
    try{
        return await pool.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_NAME}=$1,
                 ${COLUMN_STATUS}=$2
             WHERE ${COLUMN_UUID} = $3
             RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_STATUS}`,
            [role.name, role.status, uuid]);
    }catch (e) {
    console.error(e)
        throw new Error()
    }
}