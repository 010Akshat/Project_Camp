import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { verifyProject,verifyProjectMember, verifyAdmin } from "../middlewares/verifyProject.middleware.js";
import {
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
} from "../controllers/task.controllers.js"
const router = Router();

router.route("/create-task").post(verifyJWT,upload.fields(),verifyJWT,createTask)
