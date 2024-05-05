// crear servidor express
import express from "express";
//Handlebars
import exphbs from "express-handlebars";;

//connect mongo
import "./daos/mongoDb/connection/mongooseConnection.js";

//DB router
import routerUser from "./routes/DB/usersDB.js";
import routerDB from "./routes/DB/productsDB.js";
import routerCartDB from "./routes/DB/cartsDB.js";
import routerViews from "./routes/views.js";

//Passport
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";


//designamos el puerto
const PORT = 8080;

// creando una nueva instancia de la aplicación Express
const app = express();

//instacia de passport y cookie para la estrategia.
app.use(passport.initialize());
initializePassport();
app.use(cookieParser());


//Este middleware cuando una solicitud llega al servidor con un cuerpo en formato JSON. 
app.use(express.json());

//este middleware lo analiza y lo convierte en un objeto JavaScript 
app.use(express.urlencoded({ extended: true }));

//config handlebars: express busca archivos .handelbars y lo renderize
//le decimos a express que use el motor de plantilla:
app.engine("handlebars", exphbs.engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");
//carpeta static Public
app.use(express.static('./src/public'));


app.use("/api/", routerUser);
app.use("/", routerDB);
app.use("/cart", routerCartDB);
app.use("/", routerViews);

//indicar al servidor que comience a escuchar las solicitudes
const httpServer = app.listen(PORT, () => {
    console.log(`escuchando al puerto ${PORT}`);
});










