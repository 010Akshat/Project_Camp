import mongoose ,{Schema} from "mongoose";
import { AvailableTaskStatuses, TaskStatusEnum } from "../utils/constants.js";
const taskSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
    },
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:AvailableTaskStatuses,
        default:TaskStatusEnum.TODO,
        required:true
    },
    attachments:{
        // here we can multiple attachments , it can be either images, audio , vides ,txt anything
        type:[
            {
                url:String,
                mimtype:String, // png,jpg etc
                size:Number
            }
        ],
        default:[]
    }

},{timestamps:true})

export const Task = mongoose.model("Task",taskSchema)