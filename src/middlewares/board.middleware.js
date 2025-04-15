import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Board } from "../models/board.models.js";
const verifyBoard = asyncHandler (async (req,res,next)=>{
    try {
        const {boardId}=req.body;
        if(!boardId){
            throw new ApiError(400,"BoardId is required");
        }
        const board = await Board.findById(boardId);
        if(!board){
            throw new ApiError(400,"Invalid BoardId");
        }
        req.board=board;
        next();
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
})

export {verifyBoard}