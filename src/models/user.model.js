//import { truncates } from 'bcryptjs'
//import { number, required, string } from 'joi'
//import { object } from 'joi'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    edad: {
        type: Number,
        required: true
    },
    sexo: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    ciudad: {
        type: String,
        required: true
    },
    pais: {
        type: String,
        required: true
    },
    provincia: {
        type: String,
        required: true
    },
    codigopostal: {
        type: String,
        required: true
    }
},  {
        timestamps: true
    
})

const  User = mongoose.model('User', userSchema)
export default User