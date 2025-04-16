import {body} from "express-validator";

const createBoardValidators = ()=>{
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Status is required"),
        body("description")
            .optional()
    ]
}
const updateBoardValidators = ()=>{
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Status is required"),
        body("description")
            .optional()
    ]
}