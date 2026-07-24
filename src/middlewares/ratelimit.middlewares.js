import rateLimit from "express-rate-limit";
import { errorResponse } from "../helper/response.helper.js";
import securityLog from "../models/securityLog.model.js";

const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15);
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

const rateLimiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Demaciadas solicitudes. Intente nuevamente en unos minutos.",
        errors: null,
    },
    handler: async (req,res) => {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        await securityLog.create({
            eventType: "rate_limit",
            ip,
            method: req.method,
            path: req.originalUrl,
            userAgent: req.get("user-agent") || "",
            userEmail: req.body?.email || "",
            details: {
                reason: "Rate limit exceaded",
            },
        });
        errorResponse(
            res,
            "Demasiadas solicitudes. Intente nuevamente en unos minutos.",
            429,
            null
        );
    },
});

export { rateLimiter };