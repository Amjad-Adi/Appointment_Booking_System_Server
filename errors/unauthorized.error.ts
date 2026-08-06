import {AppError} from "./app-error";
export class UnauthorizedError extends AppError {
    code:string;
    constructor() {
        super("Unauthorized", 401);
        this.code='UNAUTHORIZED';
    }
}