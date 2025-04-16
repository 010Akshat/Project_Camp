import { asyncHandler } from "../utils/async-handler";
import { Board } from "../models/board.models";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { User } from "../models/user.models.js";
const createBoard = asyncHandler(async(req,res)=>{
    const {status,description,projectId} = req.body;
    const boardNames = await Aggregate.Project([
        {
            $match:{
                _id:projectId
            }
        },
        {
            $unwind:{
                path:"$board"
            }
        },
        {
            $lookup:{
              from: "boards",
              localField: "board",
              foreignField: "_id",
              as: "board_details"
            }
          },
          {
            $addFields:{
                board_details:{
                $arrayElemAt : ["$board_details",0]
              }
            }
          },
          {
            $project:{
                _id:0,
                status:"$board_details.status"
            }
          }
    ])

    // filter
    const statusIndex = boardNames.findIndex(obj=> obj.status===status);
    if(statusIndex!=-1){
        throw new ApiError(400,"Name of board Already Exist in this Project");
    }
    const board = await Board.create({
        status,
        description,
        project:projectId,
        createdBy:req.user._id,
    })
    if(!board){
        throw new ApiError(400,"Error while creating Board");
    }
    return res.status(201).json(new ApiResponse(201,"Board Successfully Created"));
})

const getBoardById = asyncHandler(async(req,res)=>{
    const {boardId,projectId} = req.body;
    const index = req.project.board.findIndex(boardId);
    if(index==-1){
        throw new ApiError(400,"Board Not Part of the Project");
    }
    const tasksOfBoardData = Board.aggregate([
        {
            $match:{
                _id:boardId
            }
        },
        {
            $unwind:{
                path:"$tasks"
            }
        },
        {
            $lookup:{
                from:"tasks",
                localField:"tasks",
                foreignField:"_id",
                as:"tasks_details"
            }
        },
        {
            $addFields:{
                tasks_details:{
                    $arrayElemAt : ["$tasks_details",0]
                }
            }
        },
        {
            $project:{
                title:"$tasks_details.title",
                assignedTo:"$tasks_details.assignedTo"
            }
        }
    ])

    const user = await User.findById(createdBy);
    if(!user){
        throw new ApiError("Jisne Board Banaya Vo user hi Exist Nhi Karta... Bhai tere lag gye");
    }
    const boardData = {
        status:req.board.status,
        description:req.board.description,
        createdBy:user.username,
        tasks:tasksOfBoardData
    }
    return res
            .status(200)
            .json(new ApiResponse(200,boardData,"Board Details Fetched Successfully"));
})

const updateBoardPosition = asyncHandler(async(req,res)=>{
    const {boardId,projectId,newPosition,newIndex} = req.body;
    const index = req.project.board.findIndex(boardId);
    if(index==-1){
        throw new ApiError(400,"Board Not Part of the Project");
    }
    const len=req.project.board.length;
    if(newIndex<0 || newIndex>len){
        throw new ApiError(400,"Invalid Index");
    }
    if(index===newIndex){
        return res
                .status(200)
                .json(200,"Board is at the same position");
    }
    req.project.board.splice(index,1);
    req.project.board.splice(newIndex,0);
    await req.project.save()
    return res
            .status(200)
            .json(new ApiResponse(200,{},"Board Position Changed Successfully"));
})

const updateBoardDetails = asyncHandler(async(req,res)=>{
    const {status,description,projectId,boardId} = req.body;
    const board = req.board;
    if(board.status===status && board.description===description){
        return res
                .status(200)
                .json(new ApiResponse(200, "status and description are same"));
    }
    if(board.status===status){
        req.board.description=description;
        await req.board.save();
        return res
                .status(200)
                .json(new ApiResponse(200, "Description of Board Updated"));
    }
    const boardNames = await Aggregate.Project([
        {
            $match:{
                _id:projectId
            }
        },
        {
            $unwind:{
                path:"$board"
            }
        },
        {
            $lookup:{
              from: "boards",
              localField: "board",
              foreignField: "_id",
              as: "board_details"
            }
          },
          {
            $addFields:{
                board_details:{
                $arrayElemAt : ["$board_details",0]
              }
            }
          },
          {
            $project:{
                _id:0,
                status:"$board_details.status"
            }
          }
    ])
    // filter
    const statusIndex = boardNames.findIndex(obj=> obj.status===status);
    if(statusIndex!=-1){
        throw new ApiError(400,"Name of board Already Exist in this Project");
    }
    req.board.status=status;
    req.board.description=description;
    await req.board.save();
    return res
            .status(200)
            .json(new ApiResponse(200,req.board,"Board Data Updated Successfully"));

})

const deleteBoard = asyncHandler(async(req,res)=>{
    
})
export {createBoard,getBoardById,updateBoardPosition,updateBoardDetails,deleteBoard}