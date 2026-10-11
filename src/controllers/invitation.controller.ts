import { getInvitations, getNumberOfInvitations, createInvitation, getInvitation, updateInvitationByOrganization, acceptInvitationByUser} from "../services/invitation.service";
import { getOrganization, } from "../services/organization.service";
import { type Request, type Response, } from "express";
import { AcceptInvitation, CreateInvitation, QueryInvitation, UpdateInvitationByOrganization } from "../models/invitation.model";
import { QueryResponse, } from "../models/query.model";
import { sendInvitationEmail, } from "../services/invitation-email";
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { generateHashToken } from '../utils/hash';
import { UploadApiResponse } from 'cloudinary';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary-service';
import { createFireBaseUser, deleteFireBaseUser } from '../services/firebase-admin.service';
import { findByTokenHash } from '../repositories/invitation.repository';
import { NotFoundError } from '../errors/not-found.error';

export async function handleGetOrganizationInvitations(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryInvitation;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid as string;
    const userUuid=req.user?.uuid as string;
    await verifyOrganizationOwnership(userUuid,organizationUuid);
    query.filter = {
            ...query.filter,
            organizationUuid,
    };
    const [invitations, totalNumberOfInvitations] = await Promise.all([getInvitations(query), getNumberOfInvitations(query)]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(invitations, totalNumberOfInvitations, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationInvitation(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    const invitationUuid = req.params.invitationUuid as string;
    const userUuid = req.user?.uuid as string;
    const result = await getInvitation(invitationUuid,organizationUuid, userUuid);
    return res.status(200).json(result);
}

export async function handleCreateOrganizationInvitation(req: Request, res: Response) {
    const invitation:CreateInvitation = req.body;
    invitation.organizationUuid  = req.params.organizationUuid as string;
    invitation.senderUuid = req.user?.uuid as string;
    const { invitationResult, rawToken } = await createInvitation(invitation);
    const organization = await getOrganization(invitation.organizationUuid as string);
    await sendInvitationEmail(organization.name, invitationResult.recipientEmail, rawToken);
    return res.status(201).json(invitation);
}

export async function handleUpdateOrganizationInvitation(req: Request, res: Response) {
    const invitation:UpdateInvitationByOrganization = req.body
    invitation.organizationUuid= req.params.organizationUuid as string;
    invitation.uuid = req.params.invitationUuid as string;
    invitation.userUuid= req.user?.uuid as string;
    const result = await updateInvitationByOrganization(invitation);
    return res.status(200).json(result);
}

export async function handleAcceptUserInvitation(req:Request,res:Response){
    let firebaseUid: string | undefined;
    let uploadedImage:UploadApiResponse|undefined;
        const file = req.file;
        const acceptInvitation: AcceptInvitation = req.body;
        acceptInvitation.tokenHash = generateHashToken(req.params.token as string);
        const invitation = await findByTokenHash(acceptInvitation.tokenHash);
        if(!invitation){
            throw new NotFoundError();
        }
    try{
        const userRecord = await createFireBaseUser(invitation.recipientEmail, acceptInvitation.password);
        firebaseUid = userRecord.uid;
        acceptInvitation.uid = firebaseUid;
        if(file){
            uploadedImage=await uploadToCloudinary(file.buffer)
            acceptInvitation.profilePicturePath=uploadedImage?.secure_url
            acceptInvitation.profilePictureId=uploadedImage?.public_id
        }
        const result = await acceptInvitationByUser(acceptInvitation);
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