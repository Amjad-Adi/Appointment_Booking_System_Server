import {AppError} from "./app-error.js";
export class BadRequestError extends AppError {
    code:string;
    constructor() {
        super("Bad Request", 400);
        this.code='BAD_REQUEST';
    }
}