import { asyncHandler } from "../utils/async-handler.js";
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import { uploadOnCloudinary , deleteOnCloudinary} from "../utils/cloudinary.js";
import crypto from "crypto";
import {sendMail,emailVerificationMailGenContent,forgotPasswordMailGenContent} from "../utils/mail.js";
import jwt from"jsonwebtoken"
import bcrypt from "bcryptjs";
const registerUser = asyncHandler(async (req,res)=>{
    const {email,username,fullname,password} = req.body
    try{
        const existedUser = await User.findOne({
            $or: [{username},{email}]
        })
        if(existedUser){
            throw new ApiError(409,"User with email or username already exists")
        }
        console.log(req.file) // req.files are inserted after execution of middleware (upload)
        const avatarImageLocalPath = req.file?.path;

        if(!avatarImageLocalPath){
            throw new ApiError(400,"Avatar file is required");
        }

        const avatar = await uploadOnCloudinary(avatarImageLocalPath,"avatars");
        console.log(avatar)
        if(!avatar){
            throw new ApiError(400,"Error while uploading image on Cloudinary");
        }
        const user = await User.create({
            fullname,
            email,
            password,
            username:username.toLowerCase(),
            avatar:{
                url: avatar.url,
                localPath: avatarImageLocalPath
            }
        })

        if(!user){
            throw new ApiError(400,"User not registered");
        }
        console.log(user);
        const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;
        console.log(`Token : ${hashedToken}`);
        await user.save();

        try {
            await sendMail({
                email:user.email,
                subject: "Verify Your Email",
                mailGenContent: emailVerificationMailGenContent(
                    user.username,
                    `${process.env.BASE_URL}/api/v1/users/verify/${unHashedToken}`,
                )
            })
        } catch (error) {
            throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong while sending mail")
        }

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering a user")
        }

        return res.status(201).json(
            new ApiResponse(201,createdUser,"User Registered Successfully")
        )
    }catch(error){
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error")
    }

});

const verifyEmail = asyncHandler(async (req,res)=>{

    const {token} = req.params;
    console.log(token);
    if(!token){
        throw new ApiError(400,"Invalid Token");
    }
    try{
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne(
            {
                emailVerificationToken:hashedToken,
                emailVerificationExpiry: {$gt:Date.now()}
            }
        );
        if(!user){
            throw new ApiError(400,"Token Timeout");
        }
        user.isEmailVerified=true;
        user.emailVerificationToken=undefined;
        user.emailVerificationExpiry=undefined;
        await user.save();

        return res.status(201).json(
            new ApiResponse(201,user,"User Email Verified")
        )
    }catch(error){
        console.log(error);
        throw new ApiError(error.statusCode || 500,error?.message ||"Internal Server Error");
    }
    
});

const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        if(!accessToken || !refreshToken){
            throw new ApiError(500,"Error in generating Tokens");
        }
        user.refreshToken = refreshToken;
        await user.save();
        return {accessToken,refreshToken};
    }catch(error){
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
    

};
const loginUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        throw new ApiError(400,"All fields are required");
    }
    try{
        const user = await User.findOne({email})
        if(!user){
            throw new ApiError(400,"Invalid email or password")
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new ApiError(400,"Invalid Password");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const cookieOptions = {
            httpOnly:true,
            secure:true
        }
        return res
                .status(200)
                .cookie("accessToken",accessToken,cookieOptions)
                .cookie("refreshToken",refreshToken,cookieOptions)
                .json(
                    new ApiResponse(200,{
                        user:loggedInUser,
                        accessToken,
                        refreshToken,
                    },"User Logged In Successfully")
                )

    }catch(error){
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
}); 

const logoutUser = asyncHandler(async (req,res)=>{
    
    try {
        return res
                .status(201)
                .cookie("accessToken",'',new Date(0))
                .cookie("refreshToken",'',new Date(0))
                .json( new ApiResponse(201,{},"User logged out successfully"));
    } catch (error) {
        throw new ApiError(500,"Failed to Logged Out");
    }
});


const resendVerificationEmail = asyncHandler(async (req,res)=>{
        const {_id,email} = req.user
    try {
            const user = await User.findOne({_id});

            if(!user){
                throw new ApiError(404,"User Not Found");
            }
            const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
            user.emailVerificationToken = hashedToken;
            user.emailVerificationExpiry = tokenExpiry;
            await user.save();
    
            try {
                await sendMail({
                    email:user.email,
                    subject: "Verify Your Email",
                    mailGenContent: emailVerificationMailGenContent(
                        user.username,
                        `${process.env.BASE_URL}/api/v1/users/verify/${unHashedToken}`,
                    )
                })
            } catch (error) {
                throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong while sending mail")
            }
            res
                .status(201)
                .json(
                    new ApiResponse(201,user,"Email Verification Link Sent")
                )
    } catch (error) {
        throw new ApiError(500,"Internal Server Error");
    }
});


const refreshAccessToken = asyncHandler(async (req,res)=>{
    const token = req.cookies?.refreshToken;
    if(!token){
        throw new ApiError(401,"Unauthorized Request")
    }
    try {
        const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findOne({_id:decoded._id});
        if(user.refreshToken !==token){
            throw new ApiError(400, "Invalid Token");
        }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
        const cookieOptions = {
            httpOnly:true,
            secure:true
        }
        return res
                .status(201)
                .cookie("accessToken",accessToken,cookieOptions) 
                .cookie("refreshToken",refreshToken,cookieOptions) 
                .json( new ApiResponse(201,user,"Accessed Token refreshed Successfully"))
    } catch (error) {
        console.log(error);
        throw new ApiError(error.statusCode || 400, error?.message || "Invalid Token");
    }
});

const forgotPasswordRequest = asyncHandler(async (req,res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email});
        if(!user){
            throw new ApiError(400,"User Email Doesn't Exist");
        }
        console.log(user)
        const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordExpiry = tokenExpiry;
        await user.save();

        try {
            sendMail({
                email,
                subject:"Reset Password",
                mailGenContent: forgotPasswordMailGenContent(
                    user.username,
                    `${process.env.BASE_URL}/api/v1/users/reset-password/${unHashedToken}`
                )
            })
        } catch (error) {
            throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong while sending mail");
        }
        res
            .status(201)
            .json(
                new ApiResponse(201,user,"Reset Password Link Sent")
            )

    } catch (error) {
        throw new ApiError(500,error?.message || "Internal Server Error");
    }
});

const resetPassword = asyncHandler(async (req,res)=>{
    const {password} = req.body;
    const {token} = req.params;
    if(!token){
        throw new ApiError(400,"Invalid Token");
    }
    try{
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne(
            {
                forgotPasswordToken:hashedToken,
                forgotPasswordExpiry: {$gt:Date.now()}
            }
        );
        if(!user){
            throw new ApiError(400,"Invalid Token");
        }
        user.password=password;
        user.forgotPasswordToken=undefined;
        user.forgotPasswordExpiry=undefined;
        await user.save();

        return res.status(201).json(
            new ApiResponse(201,user,"User Password Updated")
        )
    }catch(error){
        console.log(error);
        throw new ApiError(error?.statusCode || 500,error?.message || "Something went wrong while resetting of password");
    }
    
});

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword ,newPassword} = req.body
    const _id=req.user._id;
    try {
        const user = await User.findOne({_id});
        if(!user){
            throw new ApiError(400,"User Doesn't Exist");
        }
        if(!user.isPasswordCorrect(oldPassword)){
            throw new ApiError(400,"Password Incorrect");
        }
        user.password=newPassword;
        await user.save();
        return res.status(201)
                .json(new ApiResponse(201,user,"Password Changed Successfully"));
    } catch (error) {
         throw new ApiError(error?.statusCode || 500,error?.message || "Internal Server Error")
    }
});

const getCurrentUser = asyncHandler(async (req,res)=>{
    const _id = req.user._id;
    try {
        const user = await User.findOne({_id}).select(
            "-password -refreshToken"
        )
        return res.status(201).json(new ApiResponse(201,user,"User Fetched Successfully"))
    } catch (error) {
        throw new ApiError(500,"Internal Server Error");
    }
});
const updateAvatar = asyncHandler(async (req,res)=>{
    try {
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar File Missing");
        }
    
        const avatar = await uploadOnCloudinary(avatarLocalPath,"avatars");
        console.log(avatar);
        if(!avatar){
            throw new ApiError(400,"Error while updating avatar"); 
        }
        const user = await User.findById(req.user._id);
    
        if (!user) {
            throw new ApiError(404,"User not found");
        }
    
        const deletedAvatar = await deleteOnCloudinary(user.avatar.url,"avatars");
    
        if(!deletedAvatar){
            throw new ApiError(400,"Error while deleting avatar");
        }
        user.avatar.url=avatar.url;
        user.avatar.localPath=avatarLocalPath;
    
        await user.save();
        
        return res
                .status(201)    
                .json(new ApiResponse(201,user,"Avatar Updated Successfully"));
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
});
const updateProfile = asyncHandler(async (req,res)=>{
    const {email,username,fullname} = req.body
    const user = await User.findOne({_id:req.user._id});
    let errors=[];
    if(user.email!==email){
        const userWithEmail = await User.findOne({email});
        if(userWithEmail){
            errors.push("Email Already Exists");
        }
    }
    if(user.username!==username){
        const userWithUsername = await User.findOne({username});
        if(userWithUsername){
            errors.push("Username Already Exists");
        }
    }
    if(errors.length!=0){
        throw new ApiError(400,"User Already Exists",errors);
    }
    user.email=email;
    user.username=username;
    user.fullname=fullname;

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;
        await user.save();
    
        try {
            await sendMail({
                email:user.email,
                subject: "Verify Your Email",
                mailGenContent: emailVerificationMailGenContent(
                    user.username,
                    `${process.env.BASE_URL}/api/v1/users/verify/${unHashedToken}`,
                )
            })
        } catch (error) {
            throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong while sending mail")
        }
    res
        .status(201)
        .json(
            new ApiResponse(201,user,"Email Verification Link Sent")
        )
});

const deleteAccount = asyncHandler(async (req,res)=>{
    // Bhot kuch hoga isme .
    // try {
    //     const user = await User.findOne({_id:req.user._id});
    //     if(!user){
    //         throw new ApiError(400,"User doesn' exist");
    //     }

    //     const avatar = await deleteOnCloudinary(user.avatar.url,"avatars");

    //     // if(!avatar.url){
    //     //     throw new ApiError(400,"Error while deleting avatar"); 
    //     // }
    //     const deletedUser = await User.findByIdAndDelete(user._id);

    //     return res.status(200).json( new ApiResponse(201, deletedUser, "Account Deleted Successfully"));

    // } catch (error) {
    //     throw new ApiError(500,error?.message || "Error While Deleting the account");
    // }
});
const deleteAvatar = asyncHandler(async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            throw new ApiError(400,"User not found");
        }
        const deletedAvatar = await deleteOnCloudinary(user.avatar.url,"avatars");
    
        if(!deletedAvatar){
            throw new ApiError(400,"Error while deleting avatar");
        }
        user.avatar.url=undefined;
        user.avatar.localPath=undefined;
    
        await user.save();
        
        return res
                .status(201)    
                .json(new ApiResponse(201,user,"Avatar Updated Successfully"));
    }catch(error){
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    }
});
export {
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
}