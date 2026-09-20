import {AppError} from "./app-error.js";
export class BadRequestError extends AppError {
    code:string;
    constructor(message:string="Bad Request") {
        super(message, 400);
        this.code='BAD_REQUEST';
    }
}