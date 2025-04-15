const createTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("assignedTo")
        .isArray({min:1})
        .withMessage("At least one member is required"),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty().withMessage("Title of task connot empty"),
    body("description")
      .optional(),
    // body("status")
    //   .optional()
    //   .isIn()// boards of project
    //   .withMessage("Status is invalid"),
  ];
};