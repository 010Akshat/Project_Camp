import mongoose from "mongoose";
import {Project} from "../models/project.models.js"
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserRolesEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";
  const createProject = asyncHandler(async (req, res) => {
    // create project
      let {name, description} = req.body;
      
      const existedProject = await Project.findOne({
        name,
        createdBy: req.user._id
      })
      if(existedProject) {
        throw new ApiError(409,"Project Name Already Exist");
      }

      if(!description)description="";
  
      const project = await Project.create({
        name,
        description,
        totalMembers:1,
        createdBy : req.user._id 
      })
  
      if(!project){
        throw new ApiError(400,"Project Not Created");
      }
      const projectMember = await ProjectMember.create({
          user:req.user._id,
          project:project._id,
          role:UserRolesEnum.ADMIN
      })
      if(!projectMember){
        await Project.findByIdAndDelete(project._id);
        throw new ApiError(400,"Project Member Not Created"); 
      }
      return res
              .status(201)
              .json(
                new ApiResponse(201,project,"project Successfully Created")
              )

  });

  const getProjects = asyncHandler(async (req, res) => {
    // get all projects
      const projects = await ProjectMember.aggregate([
        {
          $match:{
            user:new mongoose.Types.ObjectId(req.user._id)
          }
        },
        {
          $lookup:{
            from: "projects",
            localField: "project",
            foreignField: "_id",
            as: "project_details"
          }
        },
        {
          $addFields:{
            project_details:{
              $arrayElemAt : ["$project_details",0]
            }
          }
        },
        {
          $project:{
            name:"$project_details.name",
            description:"$project_details.description",
            totalMembers:"$project_details.totalMembers",
            role:1,
          }
        }
      ])
      if(projects.length===0){
        throw new ApiError(400,"Error occured while fetching projects");
      }
  
      return res
              .status(200)
              .json(new ApiResponse(200,projects,"Projects Fetched Successfully"))
  });
  
  // Todo
  const getProjectById = asyncHandler(async (req, res) => {
    // get project by Id
    return res
            .status(200)
            .json(new ApiResponse(200,req.project,"Project Fetched Successfully"));
  });
  const updateProject = asyncHandler(async (req, res) => {
    // update project
      const {name, description, projectId} = req.body;

      if(req.project.name===name && req.project.description===description){
        return res
              .status(200)
              .json(
                new ApiResponse(200,"Project Successfully Updated")
              )
      }
      else if(req.project.name==name){
        req.project.description = description;
        await req.project.save();
        return res
              .status(200)
              .json(
                new ApiResponse(200,"Project Successfully Updated")
              )
      }
      const existedProject = await Project.findOne(
        {
          name, 
          createdBy:req.user._id
        }
      );
      if(existedProject) {
        throw new ApiError(409,"Project Name Already Exist");
      }
      if(!description)description="";
      const project = req.project;
      project.name=name;
      project.description = description;
      await project.save();
      return res
              .status(200)
              .json(
                new ApiResponse(200,"Project Successfully Updated")
              )
  });
  
  const getProjectMembers = asyncHandler(async (req, res) => {
    // get project members
    const {projectId} = req.body
    try {
      const projectMembers = await ProjectMember.aggregate([
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
            as: "projectMember"
          }
        },
        {
          $addFields:{
            projectMember:{
              $arrayElemAt : ["$projectMember",0]
            }
          }
        },
        {
          $project:{
            username:"$projectMember.username",
            name:"$projectMember.fullname",
            email:"$projectMember.email",
            user:1,
            role:1
          }
        }
      ])
      if(!projectMembers){
        throw new ApiError(400,"Error While Fetching Members");
      }
      return res
              .status(200)
              .json( new ApiResponse(200,projectMembers,"Project Members Fetched Successfully"));
    } catch (error) {
      throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
  });
  
  const addMemberToProject = asyncHandler(async (req, res) => {
    // add member to project
      const {userToAddId,projectId,role} = req.body; 
      const user = await User.findById(userToAddId);
      if(!user){
        throw new ApiError(400, "Invalid User Id")
      }
      const existedUserInProject = await ProjectMember.findOne({
          user:userToAddId,
          project:projectId
      })
      if(existedUserInProject){
        throw new ApiError(409,"User Already Exist In Project");
      }
      if(role==UserRolesEnum.ADMIN){
        throw new ApiError(400,"Project can only have one admin")
      }
      const projectMember = await ProjectMember.create({
          user:userToAddId,
          project:projectId,
          role
      })
      if(!projectMember){
        throw new ApiError(400,"Error While creating Project Member");
      }
      const project = req.project;
      project.totalMembers++;
      await project.save();
      return res
              .status(201)
              .json(new ApiResponse(201,"Project Member Created"))
  });
  
  const updateMemberRole = asyncHandler(async (req, res) => {
    // update member role
    try {
      const {projectId,userToUpdateId,role} = req.body;
      const user = await User.findById(userToUpdateId);
      if(!user){
        throw new ApiError(400, "Invalid User Id")
      }
      const existedUserInProject = await ProjectMember.findOne({
          user:userToUpdateId,
          project:projectId
      })
      if(!existedUserInProject){
        throw new ApiError(409,"User Doesn't Exist In Project");
      }
      if(existedUserInProject.role==UserRolesEnum.ADMIN){
        throw new ApiError(400,"Admin Cannot change its own role");
      }
      if(existedUserInProject.role==role){
        return res.status(200).json(new ApiResponse(200,"User Role Same"));
      }
      if(role==UserRolesEnum.ADMIN){
        throw new ApiError(400,"A Project can only have one Admin");
      }
      existedUserInProject.role=role;
      await existedUserInProject.save();
      return res.status(200).json(new ApiResponse(200,existedUserInProject,"Project Member Role Updated Successfully"));
    } catch (error) {
      throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }

  });

  // Todo
  const deleteMember = asyncHandler(async (req, res) => {
    // delete member from project
  });

  //Todo
  const deleteProject = asyncHandler(async (req, res) => {

    // we have to delete related content.

    // delete project
    // try {
    //   const {projectId} = req.body
    //   const deletedProject = await Project.deleteOne({_id:projectId});
    //   return res.status(200).json( new ApiResponse(200, deletedProject, "Project Deleted Successfully"));
    // } catch (error) {
    //   throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    // }
  });
  
  export {
    addMemberToProject,
    createProject,
    deleteMember,
    deleteProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    updateProject,
  };
  