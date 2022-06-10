import Router from "express";
import { deleteShortLink, infosUser, ranking, redirectToUrl, shortenLink, shortLink } from "../controllers/linksController.js";
import { validateToken } from "../middlewares/validate.js";

const linksRouter = Router();

linksRouter.post("/urls/shorten", validateToken, shortenLink);
linksRouter.get("/urls/:id", shortLink);
linksRouter.get("/urls/open/:shortUrl", redirectToUrl);
linksRouter.delete("/urls/:id", validateToken, deleteShortLink);
linksRouter.get("/users/:id", validateToken, infosUser);
linksRouter.get("/ranking", ranking);

export default linksRouter;