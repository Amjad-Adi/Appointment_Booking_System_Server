import { pool } from '../databases/postgres-connection';

import {
    ALIAS as USER_SETTINGS_ALIAS,
    ALIAS_COLUMN_APPOINTMENT_REMINDERS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_EMAIL_NOTIFICATIONS,
    ALIAS_COLUMN_LANGUAGE,
    ALIAS_COLUMN_MARKETING_EMAILS,
    ALIAS_COLUMN_THEME,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    COLUMN_APPOINTMENT_REMINDERS,
    COLUMN_CREATED_AT_UTC,
    COLUMN_EMAIL_NOTIFICATIONS,
    COLUMN_LANGUAGE,
    COLUMN_MARKETING_EMAILS,
    COLUMN_THEME,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_USER_ID,
    TABLE_NAME as USER_SETTINGS_TABLE_NAME,
} from '../databases/contracts/user-settings.contract';

import {
    ALIAS as USER_ALIAS,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_LANGUAGE as USER_COLUMN_LANGUAGE,
    COLUMN_UUID as USER_COLUMN_UUID,
    TABLE_NAME as USER_TABLE_NAME,
} from '../databases/contracts/user.contract';

import { UpdateUserSettings, UserSettings } from '../models/user-settings.model';
import { mapDatabaseError } from '../utils/map/map-database-error';

const SELECT_COLUMNS = `${USER_SETTINGS_ALIAS}.${COLUMN_LANGUAGE} AS ${ALIAS_COLUMN_LANGUAGE},
    ${USER_SETTINGS_ALIAS}.${COLUMN_THEME} AS ${ALIAS_COLUMN_THEME},
    ${USER_SETTINGS_ALIAS}.${COLUMN_EMAIL_NOTIFICATIONS} AS ${ALIAS_COLUMN_EMAIL_NOTIFICATIONS},
    ${USER_SETTINGS_ALIAS}.${COLUMN_APPOINTMENT_REMINDERS} AS ${ALIAS_COLUMN_APPOINTMENT_REMINDERS},
    ${USER_SETTINGS_ALIAS}.${COLUMN_MARKETING_EMAILS} AS ${ALIAS_COLUMN_MARKETING_EMAILS},
    ${USER_SETTINGS_ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},
    ${USER_SETTINGS_ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}`;

const ENSURE_SETTINGS_ROW = `INSERT INTO ${USER_SETTINGS_TABLE_NAME} (${COLUMN_USER_ID})
    SELECT ${USER_COLUMN_ID}
    FROM ${USER_TABLE_NAME}
    WHERE ${USER_COLUMN_UUID} = $1
    ON CONFLICT (${COLUMN_USER_ID}) DO NOTHING`;

export async function findByUserUuid(userUuid: string): Promise<UserSettings | undefined> {
    // The INSERT and the SELECT must be separate statements: a data-modifying CTE is
    // not visible to the statement that reads the table in the same snapshot.
    await pool.query(ENSURE_SETTINGS_ROW, [userUuid]);

    return (await pool.query(
        `SELECT ${SELECT_COLUMNS}
         FROM ${USER_SETTINGS_TABLE_NAME} ${USER_SETTINGS_ALIAS}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
             ON ${USER_ALIAS}.${USER_COLUMN_ID} = ${USER_SETTINGS_ALIAS}.${COLUMN_USER_ID}
         WHERE ${USER_ALIAS}.${USER_COLUMN_UUID} = $1`,
        [userUuid],
    )).rows[0];
}

export async function update(userUuid: string, settings: UpdateUserSettings): Promise<UserSettings | undefined> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(ENSURE_SETTINGS_ROW, [userUuid]);

        /*
         * The user table is resolved with a subquery instead of a FROM join:
         * both tables have a "language" column and joins make the unqualified
         * references in SET ambiguous.
         */
        const result = await client.query(
            `UPDATE ${USER_SETTINGS_TABLE_NAME} ${USER_SETTINGS_ALIAS}
             SET ${COLUMN_LANGUAGE} = COALESCE($2, ${USER_SETTINGS_ALIAS}.${COLUMN_LANGUAGE}),
                 ${COLUMN_THEME} = COALESCE($3, ${USER_SETTINGS_ALIAS}.${COLUMN_THEME}),
                 ${COLUMN_EMAIL_NOTIFICATIONS} = COALESCE($4, ${USER_SETTINGS_ALIAS}.${COLUMN_EMAIL_NOTIFICATIONS}),
                 ${COLUMN_APPOINTMENT_REMINDERS} = COALESCE($5, ${USER_SETTINGS_ALIAS}.${COLUMN_APPOINTMENT_REMINDERS}),
                 ${COLUMN_MARKETING_EMAILS} = COALESCE($6, ${USER_SETTINGS_ALIAS}.${COLUMN_MARKETING_EMAILS}),
                 ${COLUMN_UPDATED_AT_UTC} = NOW()
             WHERE ${USER_SETTINGS_ALIAS}.${COLUMN_USER_ID} = (
                 SELECT ${USER_COLUMN_ID}
                 FROM ${USER_TABLE_NAME}
                 WHERE ${USER_COLUMN_UUID} = $1
             )
             RETURNING ${SELECT_COLUMNS}`,
            [
                userUuid,
                settings.language ?? null,
                settings.theme ?? null,
                settings.emailNotifications ?? null,
                settings.appointmentReminders ?? null,
                settings.marketingEmails ?? null,
            ],
        );

        if (settings.language !== undefined) {
            await client.query(
                `UPDATE ${USER_TABLE_NAME}
                 SET ${USER_COLUMN_LANGUAGE} = $1
                 WHERE ${USER_COLUMN_UUID} = $2`,
                [settings.language, userUuid],
            );
        }

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        mapDatabaseError(error);
    } finally {
        client.release();
    }
}
