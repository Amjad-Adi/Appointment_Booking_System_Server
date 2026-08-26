import {
    findAll,
    findByUuid,
    create,
    update,
    updateByAdmin,
    isEmailFound,
    findByUid, findIdByUuid, findUidByUuid, findById, countAll
} from "../../repositories/user.repository"
import {CreateUser, UserResponse, UpdateUserByAdmin, UpdateUser, User, QueryUser} from "../../models/user.model";
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {findUserOrganizationByEmail, findUserOrganizationByUuid} from "../../repositories/organizaiton.repository";
import {ForbiddenError} from "../../errors/forbidden.error";
import {getUserOrganization} from "./organization.service";
export async function getUsers(query:QueryUser):Promise<UserResponse[]>{
    return (await findAll(query))
}

export async function getNumberOfUsers(query:QueryUser):Promise<number>{
    return (await countAll(query))
}

export async function getUser(uuid:string):Promise<UserResponse>{
    const result:UserResponse= await findByUuid(uuid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserByFireBaseUid(uid:string):Promise<UserResponse>{
    const result:UserResponse= await findByUid(uid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserById(id:number):Promise<UserResponse>{
    const result:UserResponse= await findById(id)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function createUser(user:CreateUser):Promise<User>{
    if(await isEmailFound(user.email)===true) {
        throw new ConflictError()
    }
    const result:User= await create(user)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateUser(user:UpdateUser):Promise<User>{
    const result:User= await update(user)
    if(result===undefined){
        throw new NotFoundError("user")
    }
    return result;
}

export async function updateUserByAdmin(user:UpdateUserByAdmin):Promise<User>{
    const result:User= await updateByAdmin(user)
    if(result===undefined){
        throw new NotFoundError("user")
    }
    return result;
}


export async function isUserWorkingByUuid(userUuid:string):Promise<boolean>{
    return (await findUserOrganizationByUuid(userUuid)) !== undefined
}


export async function isUserWorkingByEmail(userEmail:string):Promise<boolean>{
    return (await findUserOrganizationByEmail(userEmail)) !== undefined
}

export async function getUserIdByUuid(uuid:string):Promise<number>{
    let result:number= await findIdByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}


export async function getUserUidByUuid(uuid:string):Promise<string>{
    let result:string= await findUidByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}


export async function AuthorizeOrganizationUser(userUuid:string, organizationUuid:string):Promise<boolean>{
    if((await getUserOrganization(userUuid))?.uuid!==organizationUuid){
        throw new ForbiddenError()
    }
    return true;
}