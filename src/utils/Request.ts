import type { UserResponse } from "../models/user.model";

declare module "express-serve-static-core"{
interface Request{
            user?:UserResponse&{jti:string,exp:Date,uid:string};
            validatedQuery?:Query
        }
}
export{}