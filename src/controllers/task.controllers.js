import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Task } from "../models/task.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { Board } from "../models/board.models.js";
import { asyncHandler } from "../utils/async-handler.js";
const createTask = asyncHandler(async (req, res) => {
    const {title,description,projectId,assignedTo,assignedBy,boardId}=req.body;
    const projectMember = await ProjectMember.findOne({
      user:assignedTo,
      project:projectId
    })
    if(!projectMember){
      throw new ApiError(400,"User is not member of the project");
    }
    const task = await Task.create({
      title,
      description,
      project:projectId,
      assignedTo,
      assignedBy
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
// get all tasks
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

// get task by id
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
  
// update task
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
      const response = await uploadOnCloudinary(file.path,`${req.project._id}/${req.task._id}`);
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
  
})
const addMembers = asyncHandler(async(req,res)=>{})
const deleteMembers = asyncHandler(async(req,res)=>{})
const changeBoardAndPosition = asyncHandler(async (req, res) => {})
// delete task
const deleteTask = async (req, res) => {
  // delete task
};
  
  
  export {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
  };
  