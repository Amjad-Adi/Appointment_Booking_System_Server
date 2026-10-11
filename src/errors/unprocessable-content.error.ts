import {AppError} from "./app-error";
export class UnprocessableContentError extends AppError {
    code:string;
    constructor() {
        super("Unprocessable Content", 422);
        this.code='UNPROCESSABLE_CONTENT';
    }
}