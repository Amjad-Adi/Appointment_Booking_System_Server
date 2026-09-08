import {AppError} from "./app-error.js";
export class TooManyRequests extends AppError {
    code:string;
    constructor() {
        super("Too Many Requests", 429);
        this.code='TOO MANY REQUESTS';
    }
}