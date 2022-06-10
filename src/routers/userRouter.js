import { Router } from "express";
import { infosUser } from "../controllers/userController.js";
import { validateToken } from "../middlewares/validate.js";

const userRouter = Router();

userRouter.get("/users/:id", validateToken, infosUser);

export default userRouter;