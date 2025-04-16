import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Task } from "../models/task.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { Board } from "../models/board.models.js";
import { asyncHandler } from "../utils/async-handler.js";
const createTask = asyncHandler(async (req, res) => {
    const {title,description,projectId,assignedTo,boardId}=req.body;
    const members = await Promise.all(assignedTo.map(async (id)=>{
      const projectMember = await ProjectMember.findOne({
        user:assignedTo,
        project:projectId
      })
      if(!projectMember){
        throw new ApiError(400,"User is not member of the project");
      }
      return projectMember;
    }))
    const task = await Task.create({
      title,
      description,
      project:projectId,
      assignedTo:members,
      assignedBy:req.user._id
    })
    if(!task){
      throw new ApiError(400,"Error while creating task");
    } 
    const files = req.files;
    const filesData = await Promise.all(
        files.map(async function(file){
        const response = await uploadOnCloudinary(file.path,`${req.project._id}/${task._id}`);
        if(!response){
          throw new ApiError(400,"Error while uploading on cloudinary");
        }
        return {
          url:response.url,
          mimtype:response.format, // png,jpg etc
          size:response.bytes,
        }
      })
    )
    task.attachments=filesData;
    await task.save();
    req.board.tasks.push(task._id);
    await req.board.save();
    return res
            .status(201)
            .json( new ApiResponse(201,task,"Task Successfully Created"));
});
const getTasks = async (req, res) => {
    const {taskId,projectId,boardId}=req.body
    const board = req.board;
    const tasks = await Board.aggregate([
      {
        $match:{
          _id:board._id
        }
      },
      {
        $unwind:{
          path:"$tasks"
        }
      },
      {
        $lookup:{
          from: "tasks",
          localField: "tasks",
          foreignField: "_id",
          as: "task_details"
        }
      },
      {
        $addFields:{
          task_details:{
            $arrayElemAt : ["$task_details",0]
          }
        }
      },
      {
        $project:{
          task_details:1
        }
      }
    ])
    return res
            .status(200)
            .json(200,tasks,"Tasks Fetched Successfully");
};
const getTaskById = async (req, res) => {
  // get task by id
    // const{taskId} = req.body
    // const task = await Task.findById(taskId);
    // if(!task){
    //   throw new ApiError(400,"Task doesn't exists");
    // }
    const {taskId,projectId,boardId}=req.body
    return res
            .status(200)
            .json(new ApiResponse(200,req.task,"Task Fetched Succesfully")); 
};
const updateTask = async (req, res) => {
  // update task
  const {title,description}= req.body;
  req.task.title=title;
  req.task.description=description;
  await req.task.save();
  return res
          .status(200)
          .json(new ApiResponse(200,req.task,"Task Updated Succesfully"));
};
const addAttachments = asyncHandler(async(req,res)=>{
  const {taskId,projectId,boardId}=req.body // teeno middleware use honge ???
  const files = req.files;
  const filesData = await Promise.all(
      files.map(async function(file){
      const response = await uploadOnCloudinary(file.path,`${req.board._id}/${req.task._id}`);
      if(!response){
        throw new ApiError(400,"Error while uploading on cloudinary");
      }
      return {
        url:response.url,
        mimtype:response.format, // png,jpg etc
        size:response.bytes,
      }
    })
  )
    req.task.attachments.push(...filesData);
    await req.task.save();
    return res
            .status(200)
            .json(new ApiResponse(200,req.task,"Attachments added successfully"));
})
const deleteAttachments = asyncHandler(async(req,res)=>{
  const { attachmentData, taskId, boardId} = req.body
  const index = req.task.attachments.findIndex(data=> data===attachmentData);
  if(index==-1){
    throw new ApiError(400,"Attachment doesn't exist in task");
  }
  const attachmentUrl = req.task.attachments[index].url;
  const response = await deleteOnCloudinary(attachmentUrl,`${req.board._id}/${req.task._id}`);
  if(!response || response.result!=="ok"){
    throw new ApiError(400,"File not found in cloudinary");
  }
  req.task.attachments.splice(attachmentIndex, 1)
  await req.task.save();
  return res.status(200).json(new ApiResponse(200, req.task, "Attachment Deleted"))
})
const addMembers = asyncHandler(async(req,res)=>{
  const {userId,taskId,projectId}= req.body
  // for person which needs to be added is part of project or not
  const memberProject = await ProjectMember.findOne({
    user:userId,
    project:projectId
  })
  if(!memberProject){
    throw new ApiError(400,"User is not member of the project");
  }
  const memberTaskIndex = req.task.assignedTo.findIndex(id=>id===userId)
  if(memberTaskIndex!==-1){
    throw new ApiError(400,"Member Already exist in task");
  }
  req.task.assignedTo.push(userId);
  await req.task.save();
  return res.status(200).json(new ApiResponse(200,"User Added To Task Successfully"));
})
const deleteMembers = asyncHandler(async(req,res)=>{
  const {userId,taskId,projectId}= req.body
  const memberTaskIndex = req.task.assignedTo.findIndex(id=>id===userId)
  if(memberTaskIndex===-1){
    throw new ApiError(400,"Member Already already not part of task");
  }
  req.task.assignedTo.splice(memberTaskIndex,1);
  await req.task.save();
  return res.status(200).json(new ApiResponse(200,"User Deleted From Task Successfully"));
})
const getMembersOfTask = asyncHandler(async(req,res)=>{})
const changeBoardAndPosition = asyncHandler(async (req, res) => {
  const {taskId,boardId,newBoardId,newIndex} = req.body
  let newBoard;
  if(boardId===newBoardId){
    newBoard=req.board
  }
  else{
    newBoard = await Board.findById(newBoardId)
  }
  if(!newBoard){
    throw new ApiError(400,"Board Doesn't Exist");
  }
  const taskIndex = req.board.tasks.findIndex(id => id===taskId)
  if(taskIndex===-1){
    throw new ApiError(400,"Task doesn't exist in prev Board");
  }
  // remove
  req.board.tasks.splice(taskIndex,1);
  if(newIndex<0 || newIndex>newBoard.tasks.length){
    throw new ApiError(400,"Invalid Index");
  }
  //add
  req.newBoard.tasks.splice(newIndex,0);
  await req.board.save();
  if(boardId!==newBoardId)
    await req.newBoard.save();
  return res.status(200).json(new ApiResponse(200,"Board and Postion Changed Successfully"));
})
const deleteTask = async (req, res) => {
};
  
  
  export {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateTask,
    addAttachments,
    deleteAttachments,
    addMembers,
    deleteMembers,
    changeBoardAndPosition
  };
  