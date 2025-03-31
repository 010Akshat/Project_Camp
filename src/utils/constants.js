// These are some constant which will remain same throughout project, are not as sensitive 
// to be put in env file.
export const UserRolesEnum = {
    ADMIN:"admin",
    PROJECT_ADMIN:"project_admin",
    MEMBER:"member"
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum ={
    TODO:"todo",
    IN_PROGRESS:"in_progress",
    DONE:"done"
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);