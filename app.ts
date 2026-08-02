import {roleRoutes} from "./routes/role.routes";
import express from "express";
import {ErrorHandler} from "./middlewares/error-handler";
import {NotFoundError} from "./errors/not-found-error";
export let app = express();
app.use((req,res,next)=>{
    console.log(`request received"${req}`);
    next();
})
app.use(express.json());
app.use("/roles",roleRoutes);
app.use((req,res)=>
    {throw new NotFoundError("Resource")})
app.use(ErrorHandler);