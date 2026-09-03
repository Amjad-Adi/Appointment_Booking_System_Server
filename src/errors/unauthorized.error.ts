import {AppError} from "./app-error.js";
export class UnauthorizedError extends AppError {
    code:string;
    constructor(message:string) {
        super(message, 404);
        this.code='UNAUTHORIZED';
    }
}