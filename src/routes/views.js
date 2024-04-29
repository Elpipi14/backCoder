import { Router } from "express";
import passport from "passport";

import ChatManager from "../daos/mongoDb/DB/chat.manager.js";
import ProductsManager from "../daos/mongoDb/DB/productsManager.js";
import CartsManager from "../daos/mongoDb/DB/carts.Manager.js";


const routerViews = Router();
const productsDB = new ProductsManager();
const chatManager = new ChatManager();
const cartManager = new CartsManager();

routerViews.get('/', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    try {
        const productList = await productsDB.getAll()
        const leanProducts = productList.payload.products.map(product => product.toObject({ getters: true }))
        res.render('partials/index', { products: leanProducts, session: req.session });
    } catch (error) {
        console.error('Error getting products:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

routerViews.get('/products', passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
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

// Carts
routerViews.get('/cart', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        // Verificar si el usuario está autenticado y tiene un carrito asociado
        if (req.isAuthenticated() && req.user.cartId) {
            // Obtener el ID del carrito del usuario autenticado
            const cartId = req.user.cartId;
            // Obtener los productos del carrito utilizando el ID del carrito
            const cart = await cartManager.getById(cartId);
            const products = cart.products;

            // Crear un mapa para almacenar los productos agrupados por su ID
            const productMap = new Map();

            // Iterar sobre cada producto y agregarlo al mapa
            for (const item of products) {
                const productId = item.product;
                const productDetails = await productsDB.getById(productId);
                if (productMap.has(productId)) {
                    // Si el producto ya está en el mapa, sumar la cantidad
                    const existingProduct = productMap.get(productId);
                    existingProduct.quantity += item.quantity;
                } else {
                    // Si el producto no está en el mapa, agregarlo
                    productMap.set(productId, {
                        product: productDetails,
                        quantity: item.quantity,
                        _id: item._id
                    });
                }
            }

            // Convertir el mapa de productos a un array
            const productsWithDetails = Array.from(productMap.values());

            // Renderizar la vista del carrito pasando los productos con sus detalles
            res.render('partials/cart', { products: productsWithDetails });
        } else {
            // Si el usuario no está autenticado o no tiene un carrito asociado, renderizar el carrito vacío
            res.render('partials/cart', { products: [] });
        }
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error.message);
        res.status(500).send('Error interno del servidor');
    }
});


// Ruta para agregar un producto al carrito
routerViews.post('/cart/add/:productId', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        // Obtener el ID del producto
        const productId = req.params.productId;
        // Obtener el ID del carrito asignado al usuario desde el objeto de usuario
        const cartId = req.user.cartId;
        // Agregar el producto al carrito del usuario utilizando el ID del carrito asignado
        await cartManager.addToCart(cartId, productId);

        res.redirect('/cart'); // Redirigir al usuario al carrito después de agregar el producto
    } catch (error) {
        console.error('Error adding product to cart:', error.message);
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