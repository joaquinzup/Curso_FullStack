import cors from "cors";
import { env } from "./env.js"

const allowedOrigins = env.FRONTEND_URLS.split(",").map((origin) => origin.trim());
const corsConfig = cors({
//Opcion 1 (RECOMENDADA)
//Permite unicamente los dominios definidos
// en la vaciable FRONTEND_URLS del .env
origin: (origin, callback) => {
    if (!origin) {
        return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    return callback(new Error("Origin no permitido por CORS"))
},

//OPCION 2 (NO RECOMENDABLE)
// Permite cualquier dominio
// Util para pruebas rapidas
// NO usar en produccion
credentials: true,
methods: ["GET", "POST", "PUT", "DELETE"],
allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsConfig;