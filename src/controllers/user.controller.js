import {
    createUserSchema,
    updateUserSchema,
    userParamsSchema
} from '../dto/user.dto.js'

import {
  getUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

import {
    successResponse,
    errorResponse,
} from "../helper/response.helper.js"

const getUsers = async (req, res) => {
    try {
        const users = await getUsersService(req.query);
        
        return successResponse(
            res,
            users,
            "Usuarios obtenidos correctamente"
        );
    } catch  (error) {
        return errorResponse(
            res,
            error.message || "Error interno del servidor",
            error.statusCode || 500,
            error.errors || null
        );
    }
};

const createUser = async (req, res) => {
    try {
        //console.log('🎮 CONTROLLER ➡️ createUser')
        const {error} = createUserSchema.validate(req.body)
        if (error) {
           return errorResponse(
            res,
            "Error de validacion",
            400,
            error.datails
           );
        }
        const user = await createUserService(req.body)
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

const updateUser = async (req, res) => {
  try {
    const { error: paramsError } =
      userParamsSchema.validate(req.params);

    if (paramsError) {
      return errorResponse(
        res,
        "Id inválido",
        400,
        paramsError.details
      );
    }

    const { error } =
      updateUserSchema.validate(req.body);

    if (error) {
      return errorResponse(
        res,
        "Error de validación",
        400,
        error.details
      );
    }

    const user = await updateUserService(
      req.params.id,
      req.body
    );

    return successResponse(
      res,
      user,
      "Usuario actualizado correctamente"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Error interno del servidor",
      error.statusCode || 500,
      error.errors || null
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const { error: paramsError } =
      userParamsSchema.validate(req.params);

    if (paramsError) {
      return errorResponse(
        res,
        "Id inválido",
        400,
        paramsError.details
      );
    }

    const result = await deleteUserService(
      req.params.id
    );

    return successResponse(
      res,
      result,
      "Usuario eliminado correctamente"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Error interno del servidor",
      error.statusCode || 500,
      error.errors || null
    );
  }
};
export {
    getUsers,

    createUser,

    updateUser,

    deleteUser
}