import express from "express";
import {validateBody, validateParameter, validateQuery} from "../middlewares/validaiton";
import { updateUserSchema, updateUserByAdminSchema, queryUserSchema, updateUserPasswordSchema, createUserSchema } from "../middlewares/zod-schemas/user.schema"
import { handleGetUser, handleCreateUser, handleGetUsers, handleGetCurrentUser, handleUpdateCurrentUserPassword,
    handleUpdateUserByAdmin,
    handleUpdateCurrentUser
} from "../controllers/user.controller";
import {authorize} from "../middlewares/authorization/authorization";
import { READ_USERS, CREATE_USER, UPDATE_USER_AS_ADMIN, } from "../permissions/permissions";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import { CLOUDINARY_PROFILE_PICTURE_PATH } from '../databases/contracts/user.contract';
import { handleSingleUpload } from '../config/multer';

export const userRouter=express.Router()
userRouter.route("/")
    .get(authenticateToken,authorize(READ_USERS),validateQuery(queryUserSchema),handleGetUsers)
    .post(authenticateToken, authorize(CREATE_USER),validateBody(createUserSchema),handleCreateUser)

userRouter.route("/me")
    .get(authenticateToken,handleGetCurrentUser)
    .patch(authenticateToken,validateBody(updateUserSchema), handleSingleUpload(CLOUDINARY_PROFILE_PICTURE_PATH),handleUpdateCurrentUser)

userRouter.route("me/password")
    .patch(authenticateToken,validateParameter(validateUuid,"userUuid"),validateBody(updateUserPasswordSchema),handleUpdateCurrentUserPassword)

userRouter.route("/:userUuid")
    .get(authenticateToken,authorize(READ_USERS),validateParameter(validateUuid,"userUuid"),handleGetUser)
    .patch(authenticateToken,authorize(UPDATE_USER_AS_ADMIN),validateParameter(validateUuid,"userUuid"),validateBody(updateUserByAdminSchema),handleUpdateUserByAdmin)