import {body} from "express-validator"  // Now you dont req.body you can directly use body

const userRegistrationValidator = ()=>{
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required") // in notEmpty becomes false tghen withMessage will execute.
            .isEmail().withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required") 
            .isLength({min:3}).withMessage("username should be atleast 3 char")
            .isLength({max:13}).withMessage("username cannot exceed 13 char")

    ]
}

const userLoginValidator = ()=>{
    return [
        body('email')
            .isEmail().withMessage("Email is not valid"),
        body('password').notEmpty().withMessage("Password cannot be empty"),
    ]
}

export {userRegistrationValidator, userLoginValidator}