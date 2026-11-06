import {AppError} from "./app-error";
export class ConflictError extends AppError {
    code:string;
    constructor(message="Conflict") {
        super(message, 409);
        this.code='CONFLICT';
    }
}