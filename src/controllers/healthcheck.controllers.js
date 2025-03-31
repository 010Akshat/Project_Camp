// Every industry project should have healthcheck route.
//It tells whether server is running or not
//Whenever we deploy on any service such as AWS , they check continously that by hitting a route in server to ckeck 
// whether project is working for that case it is used.
// Industry standard says that it is healthcheck controller

import {ApiResponse} from "../utils/api-response.js"

const healthCheck = async (req,res)=>{
    res.status(200).json(
        new ApiResponse(200,{message:"Server is Running"})
    )
};

export {healthCheck};