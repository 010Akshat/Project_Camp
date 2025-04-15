import mongoose,{Schema} from "mongoose";

const boardSchema = new Schema ({
    name:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required : true,
    },
    projectId:{
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
        ]
    }
},{timestamps:true})

export const Board = mongoose.model("Board",boardSchema);