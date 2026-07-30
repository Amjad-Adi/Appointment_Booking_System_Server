import {AppError} from "./app-error";
export class Conflict extends AppError {
    code:string;
    constructor() {
        super("Conflict", 409);
        this.code='CONFLICT';
    }
}