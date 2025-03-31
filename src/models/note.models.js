import mongoose ,{Schema} from "mongoose";

const projectNoteSchema = new Schema({
    project:{
        type:Schema.Types.ObjectId, // Whenever you want to connect another document or Schema 
        ref:"Project",   // It is compulsary if type is Schema.Types.ObjectId, // This should be same as String of mongoose.model
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

export const ProjectNote = mongoose.model("ProjectNote",projectNoteSchema)