import {AppError} from "./app-error";
export class UnprocessableContent extends AppError {
    code:string;
    constructor() {
        super("Unprocessable Content", 422);
        this.code='UNPROCESSABLE_CONTENT';
    }
}