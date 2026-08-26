import path from "node:path";
import express from "express";
import {__dirname} from "../app.js";
export const pageRouter=express.Router();

pageRouter.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname,"client","pages","login.html"));
});