import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { verifyProject,verifyProjectMember, verifyAdminOrProjectAdmin } from "../middlewares/verifyProject.middleware.js";
import {
    createBoard
}from "../controllers/board.controllers.js"
import router from "./auth.routes.js";

router.route("/create-board").post(verifyJWT,
                                verifyProject,
                                verifyProjectMember,
                                verifyAdminOrProjectAdmin,
                                createBoard);