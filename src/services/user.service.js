import bcrypt from "bcryptjs"

import mongoose from "mongoose"

import User from '../models/user.model.js'

import Audit from '../models/audit.model.js'
const getUsersService = async () => {
    try {
        console.log('📦 SERVICE ➡️ getUserService')
        const users = await User.find().select('-password')
        console.log(users)
        return users
    } catch (error) {
        throw error
    }
}

const createUserService = async (data) => {
    try {
        console.log('📦 SERVICE ➡️ createUserService')
        console.log(data)
        const existUser = await User.findOne({
            email: data.email
        })
        if (existUser) {
            throw new Error('Usuario Ya Existe')
        }
        const hashedPassword = await bcrypt.hash(
            data.password,
            10
        )
        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: hashedPassword,
            edad: data.edad,
            sexo: data.sexo,
            telefono: data.telefono,
            direccion: data.direccion,
            ciudad: data.ciudad,
            pais: data.pais,
            provincia: data.provincia,
            codigopostal: data.codigopostal
        })
        await user.save()

        return {
            id: user._id,
           nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            sexo: user.sexo,
            telefono: user.telefono,
            direccion: user.direccion, 
            ciudad: user.ciudad,
            pais: user.pais,
            provincia: user.provincia,
            codigopostal: user.codigopostal
        }

        return data
    } catch (error) {
        throw error
    }
}

const updateUserService = async (id, data) => {
    try {
        console.log('📦 SERVICE ➡️ updateUserService')
        console.log(id)
        console.log(data)
        
        if (!mongoose.Types.ObjectId.isValid(id)){
            throw new Error ('Usuario no encontrado')
        }
        const user = await User.findById(id)
        //if (!user) {
        //    throw new Error('Usuario no encontrado')
        //}
        //No permitir Copiar Email
        if (data.email) {
            throw new Error('El email no puede modificarse')
        }
        //Update parcial
        if (data.nombre) user.nombre = data.nombre
        if (data.apellido) user.apellido = data.apellido
        if (data.edad) user.edad = data.edad
        if (data.sexo) user.sexo = data.sexo
        if (data.telefono) user.telefono = data.telefono
        if (data.direccion) user.direccion = data.direccion
        if (data.ciudad) user.ciudad = data.ciudad
        if (data.pais) user.pais = data.pais
        if (data.provincia) user.provincia = data.provincia
        if (data.codigopostal) user.codigopostal = data.codigopostal
        //Cambiar password si viene
        if (data.password) {
            user.password = await bcrypt.hash(
                data.password,
                10
            )
        }
        await user.save()

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            edad: user.edad,
            sexo: user.sexo,
            telefono: user.telefono,
            direccion: user.direccion,
            ciudad: user.ciudad,
            pais: user.pais,
            provincia: user.provincia,
            codigopostal: user.codigopostal
        }
      
    } catch (error) {

        throw error
    }
}

const deleteUserService = async(id) => {
    try {
        console.log('📦 SERVICE ➡️ deleteUserService')
        console.log(id)
        const user = await User.findById(id)
        if (!user) {
            throw new Error('Usuario no encontrado')
        }
        //Auditoria
        await Audit.create({
            usuarioEliminado: user
        })
        await User.findByIdAndDelete(id)
        return {
            message:"Usuario Eliminado"
        }
    } catch (error){
        throw error
    }
}
export{
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService
}