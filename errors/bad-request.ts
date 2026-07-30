import {AppError} from "./app-error";
export class BadRequest extends AppError {
    code:string;
    constructor() {
        super("Bad Request", 400);
        this.code='BAD_REQUEST';
    }
}