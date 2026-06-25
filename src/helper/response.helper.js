export const successResponse = (
    res,
    data = null,
    message = "Operacion exitosa",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        succes: true,
        statusCode,
        message,
        data,
    });
};

export const errorResponse = (
    res,
    message = "Error interno del servidor",
    statusCode = 500,
    errors = null
) => {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
    })
}