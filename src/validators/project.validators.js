import {body} from "express-validator";

const createProjectValidator = ()=>{
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required"),
        body("description").optional(),
    ]
}

const addMemberToProjectValidator = () => {
  return [
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Role is invalid"),
  ];
};

export {createProjectValidator,addMemberToProjectValidator}