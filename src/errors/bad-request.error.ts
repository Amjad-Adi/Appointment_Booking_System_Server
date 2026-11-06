import {AppError} from "./app-error";
export class BadRequestError extends AppError {
    code:string;
    constructor(message:string="Bad Request", fieldErrors?:Record<string, string>) {
        super(message, 400);
        this.code='BAD_REQUEST';
        this.fieldErrors=fieldErrors;
    }
}
