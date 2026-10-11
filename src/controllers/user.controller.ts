import {
    createUser,
    getNumberOfUsers,
    getUser,
    getUserPictureIdByUuid,
    getUsers,
    updateUser
} from '../services/user.service';
import { type Request, type Response } from 'express';
import { createFireBaseUser, deleteFireBaseUser, updateFireBaseUser, } from '../services/firebase-admin.service';
import { CreateUser, QueryUser, UpdateCurrentUser, UpdateCurrentUserPassword, UpdateUserByAdmin, User, UserResponse } from '../models/user.model';
import { QueryResponse } from '../models/query.model';
import { mapFirebaseError } from '../utils/map/map-firebase-error';
import { Role } from '../models/enums/roles';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary-service';
import { ForbiddenError } from '../errors/forbidden.error';
import { UploadApiResponse } from 'cloudinary';

export async function handleGetUsers(req:Request,res:Response){
    const query:QueryUser= req.validatedQuery as unknown as QueryUser;
    query.offset=(query?.page-1)*query?.limit
    const organizationUuid = req.user?.organizationUuid;
    const currentUserRole = req.user?.role as Role;
    if(currentUserRole!==Role.SUPER_ADMIN){
        authorizeUserAccess(currentUserRole, query.filter?.role);
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [users,totalUsers]=await Promise.all([getUsers(query),getNumberOfUsers(query)])
    const baseUrl=req.originalUrl?.split("?")[0]
    const responseResult:QueryResponse=new QueryResponse(users,totalUsers,baseUrl,query?.page,query?.limit)
    return res.status(200).json(responseResult)
}

export async function handleGetUser(req: Request, res: Response,) {
    const uuid:string=(req.params.userUuid) as any as string;
    const organizationUuid = req.user?.organizationUuid as string;
    const result:UserResponse=await getUser(uuid,organizationUuid)
    const currentUserRole = req.user?.role as Role;
    if(currentUserRole!==Role.SUPER_ADMIN){
        authorizeUserAccess(currentUserRole, result.role)
    }
    return res.status(200).json(result)
}

export async function handleGetCurrentUser(req:Request,res:Response){
        return res.status(200).json(req.user)
}

export async function handleCreateUser(req:Request,res:Response){
        let firebaseUid: string | undefined;
        let uploadedImage:UploadApiResponse|undefined;
    try{
        const file = req.file;
        const user: CreateUser = req.body;
        const userRecord = await createFireBaseUser(user.email, user.password);
        firebaseUid = userRecord.uid;
        user.uid = firebaseUid;
        if(file){
            uploadedImage=await uploadToCloudinary(file.buffer)
            user.profilePicturePath=uploadedImage?.secure_url
            user.profilePictureId=uploadedImage?.public_id
        }
        const result = await createUser(user);
        return res.status(201).json(result);
        }catch (err){
            if(uploadedImage){
                try {
                    await deleteFromCloudinary(uploadedImage.public_id);
                } catch (cleanupError) {
                    console.error("Failed to clean up uploaded user image", cleanupError);
                }
            }
            if(firebaseUid){
                await deleteFireBaseUser(firebaseUid);
            }
            throw err
        }
}

export async function handleUpdateCurrentUser(req: Request, res: Response,) {
    const user: UpdateCurrentUser = {
        ...req.body,
        uuid: req.user?.uuid as string,
        uid: req.user?.uid as string,
    };
    let previousPictureId: string|undefined;
    let uploadedImage:UploadApiResponse|undefined;
    try{
        const file=req?.file
        if(file){
            previousPictureId=await getUserPictureIdByUuid(user.uuid)
            uploadedImage=await uploadToCloudinary(file.buffer)
            user.profilePicturePath=uploadedImage.secure_url
            user.profilePictureId=uploadedImage.public_id
        }
        const result: User = await updateUser(user);
        if (uploadedImage && previousPictureId) {
            try {
                await deleteFromCloudinary(previousPictureId);
            } catch (cleanupError) {
                    console.error("Failed to delete previous user image", cleanupError);
            }
        }
        return res.status(200).json(result);
    }catch (err) {
        if (uploadedImage) {
            try {
                await deleteFromCloudinary(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded user image", cleanupError);
            }
        }
        throw err;
    }
}

export async function handleUpdateCurrentUserPassword(req: Request, res: Response) {
    const user: UpdateCurrentUserPassword = {
        ...req.body,
        uid: req.user?.uid as string,
    };
    try {
        await updateFireBaseUser(user.uid, user.password);
        return res.status(200).send();
    } catch (err) {
        mapFirebaseError(err)
    }
}

export async function handleUpdateUserByAdmin(req:Request,res:Response){
    const uuid:string=(req.params.userUuid) as any as string;
    const user:UpdateUserByAdmin=(req.body)
    user.uuid=uuid;
    const result:User=await updateUser(user)
    return res.status(200).json(result)
}

function authorizeUserAccess(currentUserRole: Role, targetRole: Role | undefined) {
    if (targetRole === undefined || (currentUserRole === Role.CRM && targetRole !== Role.WORKER) ||
        (currentUserRole === Role.MANAGER && targetRole !== Role.CRM && targetRole !== Role.WORKER) ||
        (currentUserRole === Role.OWNER && (targetRole === Role.CUSTOMER || targetRole === Role.SUPER_ADMIN))) {
        throw new ForbiddenError('You are not allowed to access these users information.');
    }
}