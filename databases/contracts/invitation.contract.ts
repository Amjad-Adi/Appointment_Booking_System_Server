import {ActivationStatus} from "../../models/enums/activation-status";
export const TABLE_NAME = "invitations";
export const COLUMN_ID = "id";
export const COLUMN_UUID = "uuid";
export const COLUMN_TITLE= "title";
export const COLUMN_BODY = "body";
export const COLUMN_SENDER_ID = "sender_id";
export const COLUMN_RECIPIENT_ID = "recipient_id";
export const COLUMN_CREATED_AT_UTC="created_at_utc";
export const COLUMN_EXPIRES_AT_UTC = "expires_at_utc";
export const COLUMN_INVITATION_STATUS="invitation_status";
export const ALIAS="i"
export const ALIAS_COLUMN_DELIVERY_STATUS=`"deliveryStatus"`;
export const ALIAS_COLUMN_CREATED_AT_UTC=`"createdAtUTC"`;
export const ALIAS_COLUMN_EXPIRES_AT_UTC = `"expiresAtUTC"`;
export const ALIAS_COLUMN_RECIPIENT_ID = `"recipientId"`;
export const ALIAS_COLUMN_SENDER_ID=`"senderId"`;