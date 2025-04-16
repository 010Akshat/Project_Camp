import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

// Sometimes when third party is involved , they are not automatically imported and process.env does not work
// Hence we import them explicitly in this file
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath,folder)=>{
    try{
        console.log(localFilePath)
        if(!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload
        (localFilePath,{
            resource_type:"auto",
            folder:`Project_Camp/${folder}`
        })
        // File has been uploaded succesfully
        console.log("File is uploaded on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        console.log(error)
        fs.unlinkSync(localFilePath) // remove the locally saved file as the upload operation got failed
        return null; 
    }
}

const deleteOnCloudinary = async (url,folder)=>{
    try{
        if(!url) return null
        // Getting public key from URL 
        console.log(url);
        const urlArray = url.split('/');
        console.log(urlArray);
        const image=urlArray[urlArray.length - 1];
        console.log(image);
        const imagePublicId = `Project_Camp/${folder}/${image.split('.')[0]}`;
        console.log(imagePublicId)
        const response = await cloudinary.uploader.destroy(imagePublicId)
        console.log(response) // If file not found then response.result = not found & if file is deleted response.result = ok
        return response
    }
    catch(error){
        console.log(error);
        return null;
    }
}
export {uploadOnCloudinary,deleteOnCloudinary}