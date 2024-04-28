import UserManager from "../daos/mongoDb/DB/userManager.js";
const userService = new UserManager()

import generationToken from "../utils/jwt.js";

export const register = async (req, res ) => {
    try {
        const { email, password } = req.body;
        const isRegistered = await userService.register({ email, password, ...req.body });

        // Verifica si isRegistered no es undefined y tiene la propiedad email
        if (isRegistered && isRegistered.email) {
            // Genera el token JWT con el email del usuario registrado
            generationToken({ email: isRegistered.email }, res);

            console.log("Successfully registered user. Redirecting to Login");
            res.redirect("/login");
        } else {
            // Si el usuario no está registrado correctamente, redirige a la página de error de registro
            console.error("Error durante el registro: El usuario no está registrado correctamente");
            res.status(400).redirect("/register-error");
        }
    } catch (error) {
        console.error("Error durante el registro:", error);
        res.status(500).redirect("/register-error");
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.login(email, password);
        console.log(`busca el usuario: `, user);
        // Verificar si el usuario está autenticado correctamente
        if (!user) {
            res.status(400).redirect("/login-error");
        } else {
            // Generar el token JWT
            generationToken({ user }, res); // Aquí se agregó 'let' antes de 'token'

            if (!req.session || !req.session.email) {
                req.session = req.session || {};
                req.session.email = email;
                req.session.firstName = user.first_name;
                // Almacena toda la información del usuario en la sesión
                req.session.user = user;
            }
            req.session.welcomeMessage = `Bienvenido, ${user.first_name} ${user.last_name}!`;
            console.log(`Welcome message in session: ${req.session.welcomeMessage}`);
            
            res.redirect("/");
        }
    } catch (error) {
        console.error("Login process error", error);
        res.status(500).json({ error: "Login process error" });
    }
};

export const logOut = async (req, res) => {
    // Destruye la sesión del usuario
    res.clearCookie("coderCookieToken");
    res.redirect("/login");
};
