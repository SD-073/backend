import type { RequestHandler } from "express";

export const logger: RequestHandler = async (req, res, next) => {
    console.log("New request at", Date.now());
    
    console.log(req.method);
    
    next()
   
};