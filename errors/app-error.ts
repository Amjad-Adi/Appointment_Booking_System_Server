export class AppError extends Error {
    statusCode:number;
    message:string;
    status:string;
    isOperational:boolean;
constructor(message:string,statusCode:number=500) {
    super(message);
    this.statusCode=statusCode;
    this.message=message;
    this.status=`${statusCode}`.startsWith('4')?'fail':'error';
    this.isOperational=true;
    Error.captureStackTrace(this, this.constructor)
}
}