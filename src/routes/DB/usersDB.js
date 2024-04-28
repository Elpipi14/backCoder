import { Router } from "express";
import * as controller from "../../controllers/users.controllers.js";


const routerUser = Router();

routerUser.post('/register', controller.register);

routerUser.post("/login", controller.login);

routerUser.get("/logout", controller.logOut);

export default routerUser;
