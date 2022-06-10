import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import linksRouter from "./routers/linksRouter.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(linksRouter);

app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port " + process.env.PORT);
});