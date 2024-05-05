import CartsManager from "../daos/mongoDb/DB/carts.Manager.js";
import ProductsManager from "../daos/mongoDb/DB/productsManager.js";

const productDao = new ProductsManager();
const cartDao = new CartsManager();

export const addToCart = async (req, res, next) => {
    try {
        // Obtener el ID del producto
        const productId = req.params.productId;
        // Obtener el ID del carrito asignado al usuario desde el objeto de usuario
        const cartId = req.user.cartId;
        // Agregar el producto al carrito del usuario utilizando el ID del carrito asignado
        await cartDao.addToCart(cartId, productId);

        res.redirect('/cart'); // Redirigir al usuario al carrito después de agregar el producto
    } catch (error) {
        console.error('Error adding product to cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

export const getCart = async (req, res, next) => {
    try {
        // Verificar si el usuario está autenticado y tiene un carrito asociado
        if (req.isAuthenticated() && req.user.cartId) {
            // Obtener el ID del carrito del usuario autenticado
            const cartId = req.user.cartId;
            // Obtener los productos del carrito utilizando el ID del carrito
            const cart = await cartDao.getById(cartId);
            const products = cart.products;

            // Crear un mapa para almacenar los productos agrupados por su ID
            const productMap = new Map();

            // Iterar sobre cada producto y agregarlo al mapa
            for (const item of products) {
                const productId = item.product;
                const productDetails = await productDao.getById(productId);
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
};

// export const getById = async (req, res, next) => {
//     try {
//         const { cId } = req.params;
//         const cart = await cartDao.getById(cId);
//         res.status(200).json({ message: "found cart", cart });
//     } catch (error) {
//         next(error.message);
//     }
// };

// export const deleteProduct = async (req, res, next) => {
//     try {
//         const { cId, pId } = req.params;
//         const cart = await cartDao.deleteProduct(cId, pId);
//         res.status(200).json({ message: "Product delete to cart", cart });
//     } catch (error) {
//         console.log(error);
//         next(error.message);
//     }
// };

// export const deleteCart = async (req, res, next) => {
//     try {
//         const { cId } = req.params;
//         await cartDao.deleteCart(cId);
//         res.status(200).json({ msg: "Cart deleted" });
//     } catch (error) {
//         next(error.message);
//     }
// };
