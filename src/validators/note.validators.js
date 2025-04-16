import {body} from "express-validator";
const notesValidator = () => {
    return [
        body("content")
            .notEmpty().withMessage("Content is required")
        ];
  };
export {notesValidator}