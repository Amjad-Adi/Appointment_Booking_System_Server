import {AppError} from "./app-error.js";
export class ConflictError extends AppError {
    code:string;
    constructor() {
        super("Conflict", 409);
        this.code='CONFLICT';
    }
}