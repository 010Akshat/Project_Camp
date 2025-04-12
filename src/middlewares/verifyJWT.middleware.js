import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
export const verifyJWT = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken;
    if(!token){
        throw new ApiError(400,"Unauthorized request");
    }
    try {
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.user=decoded;
        next();
    } catch (error) {
        throw new ApiError(400,"Invalid Token")
    }
}
)