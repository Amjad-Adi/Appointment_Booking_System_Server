import {ConflictError} from "../errors/conflict.error";
import {BadRequestErorr} from "../errors/bad-request.erorr";
import {NotFoundError} from "../errors/not-found.error";
import {ForbiddenError} from "../errors/forbidden.error";
import {UnauthorizedError} from "../errors/unauthorized.error";

export function mapFirebaseError(error: unknown){
    if (!(error instanceof Error) || !("code" in error)) {
        throw error;
    }
    switch (error.code) {
        case "auth/email-already-exists":
        case "auth/phone-number-already-exists":
        case "auth/uid-already-exists":
            throw new ConflictError();

        case "auth/invalid-email":
        case "auth/missing-uid":
        case "auth/missing-oauth-client-secret":
        case "auth/missing-ios-bundle-id":
        case "auth/unauthorized-continue-uri":
            throw new BadRequestErorr();

        case "auth/user-not-found":
            throw new NotFoundError("User");

        case "auth/user-disabled":
            throw new ForbiddenError();

        case "auth/id-token-expired":
        case "auth/id-token-revoked":
            throw new UnauthorizedError();

        default:
            throw error;
    }
}