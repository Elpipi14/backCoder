import { Router } from "express";
import * as controller from "../../controllers/carts.controllers.js"
import passport from "passport";
const routerCartDB = Router();

routerCartDB.get("/", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.getCart);
routerCartDB.get("/add/:productId", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), controller.addToCart);

// routerCartDB.get("/:cId", controller.getById);

// routerCartDB.post("/add", controller.createCart);
// routerCartDB.post("/:cId/add/:pId", controller.addToCart);

// routerCartDB.delete("/:cId/product/:pId", controller.deleteProduct);
// routerCartDB.delete("/:cId", controller.deleteCart);

export default routerCartDB;