import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { createProjectValidator } from "../validators/project.validators.js";
import { verifyProject,verifyProjectMember, verifyAdmin } from "../middlewares/verifyProject.middleware.js";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    getProjectMembers,
    addMemberToProject,
    updateMemberRole,
    deleteMember
} from "../controllers/project.controllers.js"
const router = Router();

router.route("/create-project").post(verifyJWT,createProjectValidator(),validate,createProject);
router.route("/get-projects").get(verifyJWT,getProjects);
router.route("/get-project").get(verifyJWT,verifyProject,verifyProjectMember,getProjectById);
router.route("/update-project").post(verifyJWT,verifyProject,verifyProjectMember,verifyAdmin,updateProject);
router.route("/add-member").post(verifyJWT,verifyProject,verifyProjectMember,verifyAdmin,addMemberToProject);
router.route("/update-role").post(verifyJWT,verifyProject,verifyProjectMember,verifyAdmin,updateMemberRole);

export default router