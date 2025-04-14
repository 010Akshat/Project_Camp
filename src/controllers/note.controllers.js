import { ProjectNote } from "../models/note.models";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
const createNote = async (req, res) => {
  // notevalidator will be used as middleware
  // verifyJWT ,verifyProject && verifyProjectMember will be used as middleware
  try {
    const {content , projectId} = req.body;
    const note = await ProjectNote.create({
      project:req.project._id,
      createdBy:req.user._id,
      content
    });
    if(!note){
      throw new ApiError(400,"Note not created");
    }
    await note.save();
    return res
            .status(201)
            .json(new ApiResponse(201,note,"Note Created Successfully"));
  } catch (error) {
      throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
  }
};
const getNotes = async (req, res) => {
  // get all notes
  const {projectId} = req.body;
  try {
    const notes = await ProjectNote.aggregate([
      {
        $match:{
          project:projectId
        }
      },
      {
        $lookup:{
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_details"
        }
      },
      {
        $addFields:{
          user_details:{
            $arrayElemAt : ["$user_details",0]
          }
        }
      },
      {
        $project:{
          content:1,
          createdAt:1,
          username:"$users.username"
        }
      }
    ])
    if(!notes){
      throw new ApiError(400,"Error while fetching notes");
    }
    return res
            .status(200)
            .json(new ApiResponse(201,notes,"Notes Created Successfully"));
  } catch (error) {
    throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
  }
}

const getNoteById = async (req, res) => {
  // get note by id
  try {
    const {noteId} = req.body
    if(!noteId){
      throw new ApiError(400,"noteId can't be empty");
    }
    const note = await ProjectNote.findOne({_id:noteId})
    if(!note){
      throw new ApiError(400,"Invalid Note ID");
    }
    return res
            .status(200)
            .json( new ApiResponse(200,note,"Note fetched successfully"));
  } catch (error) {
    throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
  }
};


const updateNote = async (req, res) => {
  // update note
  try {
    const {noteId,content} = req.body;
    if(!noteId){
      throw new ApiError(400,"noteId can't be empty");
    }
    const note = await ProjectNote.findById(noteId)
    if(!note){
      throw new ApiError(400,"Invalid Note ID");
    }
    note.content=content;
    await note.save();
    return res
            .status(200)
            .json( new ApiResponse(200,note.toObject(),"Note Updated Successfully"));
  } catch (error) {
    throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
  }
};

const deleteNote = async (req, res) => {
  // delete note
  try {
    const {noteId} = req.body;
    if(!noteId){
      throw new ApiError(400,"noteId can't be empty");
    }
    const note = await ProjectNote.findByIdAndDelete(noteId)
    if(!note){
      throw new ApiError(400,"Invalid Note ID");
    }
    return res
            .status(200)
            .json( new ApiResponse(200,note,"Note Updated Successfully"));
  } catch (error) {
    throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
  }
};
  
  export { createNote, deleteNote, getNoteById, getNotes, updateNote };
  