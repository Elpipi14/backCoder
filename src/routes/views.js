import { Router } from "express";

import ChatManager from "../daos/mongoDb/DB/chat.manager.js";
import ProductsManager from "../daos/mongoDb/DB/productsManager.js";
import UserManager from "../daos/mongoDb/DB/userManager.js";

import passport from "passport";
import generationToken from "../utils/jwt.js";

const routerViews = Router();
const productsDB = new ProductsManager();
const chatManager = new ChatManager();
const userManger = new UserManager();

routerViews.get('/', passport.authenticate("jwt", {session:false, failureRedirect: "/login" }), async (req, res) => {
    try {
        const productList = await productsDB.getAll()
        const leanProducts = productList.payload.products.map(product => product.toObject({ getters: true }))
        res.render('partials/index', { products: leanProducts, session: req.session });
    } catch (error) {
        console.error('Error getting products:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

routerViews.get('/products', passport.authenticate("jwt", {session:false, failureRedirect: "/login" }), async (req, res) => {
    try {
        const page = req.query.page || 1;
        const productList = await productsDB.getAll(page);
        // Convierte los productos en objetos lean para evitar problemas de referencia y mejora el rendimiento
        const leanProducts = productList.payload.products.map(product => product.toObject({ getters: true }));
        // Obtiene la información de paginación de la lista de productos
        const pageInfo = productList.payload.info;
        // Renderiza la plantilla 'products' pasando la lista de productos, información de paginación y demás datos necesarios
        res.render('partials/products', { products: leanProducts, pageInfo });
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        res.status(500).send('Error interno del servidor');
    }
});

routerViews.get('/view/:id', async (req, res) => {
    try {
        // busca por params el id del producto y muestra en el render de view
        const productId = req.params.id;
        const product = await productsDB.getById(productId);
        res.render('partials/view', { product: product });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

///-------chat´s---------///

routerViews.get('/contact', async (req, res) => {
    try {
        // Obtener todos los chats desde el gestor de chats
        const chats = await chatManager.getAllChats();
        // Renderizar la plantilla Handlebars con los chats obtenidos
        res.render('partials/contact', { messages: chats });
    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).send('Internal Server Error');
    }
});

routerViews.post('/contact/send', async (req, res) => {
    try {
        const { email, message } = req.body;
        await chatManager.createChat(email, message);
        res.redirect('/contact');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    };
});

///-----------Login´s------------//

//Renderiza Login
routerViews.get('/login', async (req, res) => {
    res.render('partials/login');
});

routerViews.get('/register-gitHub', passport.authenticate("github", { scope: ["user:email"] }));

routerViews.get('/gitHub', passport.authenticate('github', { failureRedirect: "/login" }), async (req, res) => {
    //La estrategia de GitHub nos retornará el usurio, entonces lo agregamos a nuestro objeto de session: 
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/profile");
});

// ------------------------------------------------- 

//renderizar la vista register

routerViews.get('/register', async (req, res) => {
    res.render('partials/register');
});


// ------------------------------------------------- 

// vista profile

routerViews.get('/profile', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    try {
        // El objeto req.user contiene el usuario autenticado extraído del token JWT
        const user = req.user;
        res.render('partials/profile', { user: user });
    } catch (error) {
        console.error('Error getting user profile:', error.message);
        res.status(500).send('Error interno del servidor');
    }
});

// ------------------------------------------------- 

//error vista
routerViews.get('/register-error', async (req, res) => {
    res.render('partials/register-error');
});
routerViews.get('/login-error', async (req, res) => {
    res.render('partials/login-error');
});


export default routerViews;