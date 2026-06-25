import { successResponse, errorResponse } from "../helper/response.helper.js";

import { loginService } from "../services/auth.service.js";

const login = async (
    req,
    res,
) => {
    try {
        const response = await loginService(req.body);

        successResponse(
            res,
            response,
            "Login Exitoso",
        );
    } catch (error) {
        errorResponse(
            res,
            error.message,
            error.statusCode,
        );
    }
};

export { login };