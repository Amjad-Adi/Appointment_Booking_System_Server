import {AppError} from "./app-error.js";
export class UnauthorizedError extends AppError {
    code:string;
<<<<<<< Updated upstream
    constructor() {
        super("Unauthorized", 401);
=======
    constructor(message:string="UNAUTHORIZED") {
        super(message, 401);
>>>>>>> Stashed changes
        this.code='UNAUTHORIZED';
    }
}