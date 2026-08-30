import {AppError} from "./app-error.js";
export class UnauthorizedError extends AppError {
    code:string;
    constructor() {
        super("Unauthorized", 401);
        this.code='UNAUTHORIZED';
    }
}