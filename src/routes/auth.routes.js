import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    resendVerificationEmail,
    refreshAccessToken,
    forgotPasswordRequest,
    changeCurrentPassword,
    getCurrentUser,
    resetPassword,
    updateAvatar,
    updateProfile,
    deleteAccount,
    deleteAvatar
} from "../controllers/auth.controllers.js";
const router = Router();

import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { userLoginValidator,
         userRegistrationValidator, 
         resetPasswordValidator,
         updateProfileValidator,
         userChangeCurrentPasswordValidator,
         userForgotPasswordValidator} from "../validators/auth.validators.js";

router.route("/register").post(upload.single("avatar"),userRegistrationValidator(),validate,registerUser)
router.route("/login").get(userLoginValidator(),validate,loginUser);
router.route("/verify/:token").get(verifyJWT,verifyEmail);
router.route("/resend-mail").get(verifyJWT, resendVerificationEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").get(verifyJWT,userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/reset-password/:token").get(verifyJWT,resetPasswordValidator(),validate,resetPassword);
router.route("/change-password").get(verifyJWT,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/getMe").get(verifyJWT, getCurrentUser);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/update-profile").patch(verifyJWT,updateProfileValidator(),validate,updateProfile);
router.route("/delete-avatar").delete(verifyJWT,deleteAvatar);
router.route("/logout").get(verifyJWT,logoutUser);
router.route("/delete-account").delete(verifyJWT,deleteAccount);

export default router 