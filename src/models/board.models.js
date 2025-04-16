import mongoose,{Schema} from "mongoose";

const boardSchema = new Schema ({
    status:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required : true,
    },
    project:{
        type: Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    tasks:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Task"
            }
        ],
        default:[]
    }
},{timestamps:true})

export const Board = mongoose.model("Board",boardSchema);