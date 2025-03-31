import express from "express"

const app = express();

//router imports
import healthCheckRouter from "./controllers/healthcheck.Controllers.js";

app.use("api/v1/healthcheck",healthCheckRouter)

export default app;