import {ActivationStatus} from "../../models/enums/model-activation-status";

export const TABLE_NAME = "services";
export const COLUMN_ID = "id";
export const COLUMN_UUID = "uuid";
export const COLUMN_NAME = "name";
export const COLUMN_DESCRIPTION = "description";
export const COLUMN_PRICE = "price";
export const COLUMN_DURATION_IN_MINUTES = "duration_in_minutes";
export const COLUMN_ORGANIZATION_ID = "organization_id";
export const COLUMN_PICTURE_PATH = "picture_path";
export const COLUMN_CREATED_AT_UTC="created_at_utc";
export const COLUMN_UPDATED_AT_UTC = "updated_at_utc";
export const COLUMN_STATUS="status";
export const ALIAS="s"
export const ALIAS_COLUMN_DURATION_IN_MINUTES=`"durationInMinutes"`;
export const ALIAS_COLUMN_CREATED_AT_UTC=`"createdAtUTC"`;
export const ALIAS_COLUMN_UPDATED_AT_UTC = `"updatedAtUTC"`;
export const ALIAS_COLUMN_PICTURE_PATH = "servicePicturePath";
export const ALIAS_COLUMN_ORGANIZATION_ID="organization_Id";