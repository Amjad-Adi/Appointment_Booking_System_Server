import {AppError} from "./app-error";
export class NotFoundError extends AppError {
    code:string;
    constructor(resource="Resource") {
        super(`${resource} Not Found`, 404);
        this.code='NOT_FOUND';
    }
}