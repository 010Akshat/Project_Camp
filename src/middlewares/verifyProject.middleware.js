import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";


// We always check after getting project from db that it exist or not.
// Hence making a middleware
export const verifyProject = asyncHandler( async(req,res,next)=>{
    try {
        const {projectId} = req.body
        if(!projectId){
            throw new ApiError(400,"Unaurthorized Request");
        }
        const project = await Project.findById(projectId);
        if(!project){
            throw new ApiError(400,"Project Doesn't Exist")
        }
        req.project=project;
        next();
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
})

export const verifyProjectMember = asyncHandler( async (req,res,next)=>{
    const {projectId} = req.body
    const existedUser = await ProjectMember.findOne({
        user:req.user._id,
        project:projectId
    })
    if(!existedUser){
        throw new ApiError(400,"User Not Member of the project");
    }
    req.userRole = existedUser.role;
    next();
})
export const verifyAdmin = asyncHandler( async (req,res,next)=>{
    if(req.userRole!=UserRolesEnum.ADMIN){
         throw new ApiError(400,"User is not Admin");
    }
    next();
})