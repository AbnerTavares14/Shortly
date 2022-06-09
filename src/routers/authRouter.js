import { Router } from "express";
import { signUp, singIn } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", singIn);

export default authRouter;