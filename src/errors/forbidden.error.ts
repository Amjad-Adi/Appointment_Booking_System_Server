import {AppError} from "./app-error";
export class ForbiddenError extends AppError {
    code:string;
    constructor(message="Forbidden") {
        super(message, 403);
        this.code='FORBIDDEN';
    }
}