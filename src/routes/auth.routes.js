import { Router } from "express";

import {registerUser } from "../controllers/auth.controllers.js";
const router = Router();

import { validate } from "../middlewares/validator.middleware.js";

import { userRegistrationValidator } from "../validators/index.js";
router.route("/register")
    .post(userRegistrationValidator(),validate,registerUser)

export default router 