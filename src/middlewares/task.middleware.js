import { Task } from "../models/task.models.js";

const verifyTask = asyncHandler (async (req,res,next)=>{
        const {taskId}=req.body;
        if(!taskId){
            throw new ApiError(400,"TaskId is required");
        }
        const board=req.board;
        const isPresent = board.tasks.includes(taskId)
        if(!isPresent){
            throw new ApiError(400,"Task not present in Array");
        }
        const task = await Task.findById(taskId);
        if(!task){
            throw new ApiError("Error while fetching task");
        }
        req.task=task;
        next();
})

export {verifyTask}