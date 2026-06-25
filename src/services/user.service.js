import bcrypt from "bcryptjs"

import mongoose from "mongoose"

import User from '../models/user.model.js'

import Audit from '../models/audit.model.js'

const getUsersService = async ({ email, id } = {}) => {
try {
    if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)){
            throw{
                statusCode: 400,
                message: "Id invalido"
            };
        }
        const user = await User.findById(id)
        .select("-password");

        if (!user) {
            throw {
                statusCode: 400,
                message: "Usuario no encontrado",
            };
        }
        return user;
    }
    if (email) {
        const user = await User.findOne({ email })
        .select("-password");

        if (!user) {
            throw {
                statusCode: 404,
                message: "Usuario no encontrado"
            };
        }
        return user;
    }
    return await User.find()
    .select("-password")
    .sort({nombre : 1});
} catch (error) {
    throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error interno del servidor",
        errors: error.errors || null,
        }
    }
}
 //   try {
 //       console.log('📦 SERVICE ➡️ getUserService')
 //       const users = await User.find().select('-password')
 //       console.log(users)
 //       return users
 //   } catch (error) {
 //       throw error
 //  }

const createUserService = async (data) => {
        console.log('📦 SERVICE ➡️ createUserService')
    try {
        const existUser = await User.findOne({
            email: data.email
        });
        if (existUser) {
            throw {
                statusCode: 409,
                message: "El usuario ya existe",
            };
        }
        const hashedPassword = await bcrypt.hash(
            data.password,
            10,
        );

        

        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            edad: data.edad,
            genero: data.genero,
            fechaNacimiento: data.fechaNacimiento,
            telefono: data.telefono,
            direccion: data.direccion,
            localidad: data.localidad,
            pais: data.pais,
            provincia: data.provincia,
            codigoPostal: data.codigoPostal,
            role: data.role
        });
        await user.save()
        return {
            id: user._id,
           nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            genero: user.genero,
            fechaNacimiento: user.fechaNacimiento,
            telefono: user.telefono,
            direccion: user.direccion, 
            localidad: user.localidad,
            pais: user.pais,
            provincia: user.provincia,
            codigoPostal: user.codigoPostal,
            role: user.role
        };

    } catch (error) {
        console.error(
            "❌ Error en createUserService",
            error
        );
        throw {
            statusCode:
            error.statusCode || 500,
            message:
            error.message || 
            "Error interno del servidor",
            errors:
            error.errors || null,
        };
    }
};

const updateUserService = async (id, data) => {
    console.log('📦 SERVICE ➡️ updateUserService')
    try {
        if (!mongoose.Types.ObjectId.isValid(id)){
            throw {
                statusCode: 400,
                message: "Id invalido",
            };
        }
        const user = await User.findById(id)
        if (!user) {
            throw {
                statusCode: 400,
                message: "Usuario no encontrado",
            };
        }
        //if (!user) {
        //    throw new Error('Usuario no encontrado')
        //}
        //No permitir Copiar Email
        if (data.email !== undefined) {
            throw {
                statusCode: 400,
                message: "El email no puede modificarse",
            };
        }
        const allowedFields = [
            "nombre",
            "apellido",
            "fechaNacimiento",
            "edad",
            "genero",
            "telefono",
            "direcciom",
            "localidad",
            "provincia",
            "pais",
            "codigoPostal",
        ];
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                user[field] = data[field];
            }
        });
        if (data.password !== undefined) {
            user.password = await bcrypt.hash(
                data.password,
                10
            );
        }

        await user.save();
        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            fechaNacimiento: user.fechaNacimiento,
            edad: user.edad,
            genero: user.edad,
            telefono: user.telefono,
            direccion: user.direccion,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            codigoPostal: user.codigoPostal
        };
    } catch (error){
        console.error(
            "Error en UpdateService",
            error
        );
        throw{
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        };
    }
};
const deleteUserService = async(id) => {
    console.log('📦 SERVICE ➡️ deleteUserService')

    let sessions;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                statusCode: 400,
                message: "ID invalido",
            };
        }
        sessions = await mongoose.startSession();

        await sessions.withTransaction(async () => {
            const user = await User.findById(id)
            .session(sessions);

            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                };
            }
            await Audit.create(
                [
                    {
                        usuarioEliminado: user.toObject(),
                        fechaEliminacion: new Date(),
                    },
                ],
                { sessions }
            );
            await user.deleteOne ({ sessions });
        });
        return {
            message: "Usuario eliminado",
        };
    } catch (error) {
        console.error(
            "❌ Error en deleteUserService:",
            error
        );
        throw {
            statusCode:
            error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        };
    } finally {
        if (sessions) {
            await sessions.endSession();
        }
    }
};
export{
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService
}
