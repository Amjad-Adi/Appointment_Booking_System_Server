import {AppError} from "./app-error.js";
export class ForbiddenError extends AppError {
    code:string;
    constructor() {
        super("Forbidden", 403);
        this.code='FORBIDDEN';
    }
}