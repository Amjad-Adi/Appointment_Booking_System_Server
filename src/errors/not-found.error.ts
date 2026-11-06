import {AppError} from "./app-error";
export class NotFoundError extends AppError {
    code:string;
    constructor(resource="Resource", message?:string) {
        super(message ?? `${resource} was not found`, 404);
        this.code='NOT_FOUND';
    }
}
