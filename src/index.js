import app from './app.js'
import dotenv from "dotenv"
import connectDB from './db/index.js';
dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8000;

connectDB()
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server listening on ${PORT}`)
        })
    })
    .catch((err)=>{  // Technically this code will never run because if connection failed we will exit process from db file 
        console.log("MongoDB connection Error", err);
        process.exit(1);
    })