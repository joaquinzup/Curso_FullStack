import Joi from "joi"; 

const  roles = [
  "ROOT",
  "ADMIN",
  "USER",
  "GUEST",
];

const createUserSchema = Joi.object({

  nombre: Joi.string()
  .trim()
  .min(2)
  .max(100)
  .required(),

  apellido: Joi.string()
  .trim()
  .min(2)
  .max(100)
  .required(),

  email: Joi.string().email()
  .trim()
  .email()
  .required(),

  password: Joi.string()
  .min(6)
  .max(50)
  .required(),

  fechaNacimiento: Joi.date()
  .required(),

  edad: Joi.number()
  .integer()
  .min(1)
  .max(100)
  .required()
  .messages({
    "number.base": "La edad debe ser numerica",
    "number.integer": "La edad dabe ser un numero entero",
    "number.min": "La edad no puede ser menor a 1",
    "number.max": "La edad debe ser menor a 100"
  }),

  genero: Joi.string()
  .trim()
  .required(),

  telefono: Joi.string()
  .trim()
  .min(6)
  .max(20)
  .required(),

  direccion: Joi.string()
  .trim()
  .max(200)
  .required(),

  localidad: Joi.string()
  .trim()
  .max(100)
  .required(),

  pais: Joi.string()
  .trim()
  .max(100)
  .required(),

  provincia: Joi.string()
  .trim()
  .max(100)
  .required(),

  codigoPostal: Joi.string()
  .trim()
  .max(40)
  .required(),

  role: Joi.string()
  .valid(...roles)
  
  .messages({
    "any.only": `El rol debe ser uno de los siguientes: ${roles.join(", ")}`,
  })
});

const updateUserSchema = Joi.object({

  nombre: Joi.string()
  .trim()
  .min(2)
  .max(100),

  apellido: Joi.string()
  .trim()
  .min(2)
  .max(100),

  email: Joi.string().email()
  .trim()
  .email(),

  password: Joi.string()
  .min(6)
  .max(50),

  fechaNacimiento: Joi.date(),

  edad: Joi.number()
  .integer()
  .min(1)
  .max(100)
  .message({
    "number.base": "La edad debe ser numerica",
    "number.integer": "La edad dabe ser un numero entero",
    "number.min": "La edad no puede ser menor a 1",
    "number.max": "La edad debe ser menor a 100"
  }),

  genero: Joi.string()
  .trim(),

  telefono: Joi.string()
  .trim()
  .min(6)
  .max(20),

  direccion: Joi.string()
  .trim()
  .max(200),

  localidad: Joi.string()
  .trim()
  .max(100),

  pais: Joi.string()
  .trim()
  .max(100),

  provincia: Joi.string()
  .trim()
  .max(100),

  codigoPostal: Joi.string()
  .trim()
  .max(40),
  
  role: Joi.string()
  .valid(...roles)
  .default("USER")
  .messages({
    "any.only": `El rol debe ser uno de los siguientes: ${roles.join(", ")}`,
  })

}).min(1)
.messages({
  "object.main":
  "Debe enviar al menos un campo para actualizar"
});

//  nombre: Joi.string(),
//  apellido: Joi.string(),
//  password: Joi.string().min(6),
//  edad: Joi.number(),
//  genero: Joi.string(),
//  telefono: Joi.string(),
//  direccion: Joi.string(),
//  localidad: Joi.string(),
//  pais: Joi.string(),
//  provincia: Joi.string(),
//  codigoPostal: Joi.string(),
//});

const userParamsSchema = Joi.object({
  id: Joi.string()
  .hex()
  .length(24)
  .required()
  .messages({
    "string.hex": "El id debe ser un ObjectId valido",
    "string.length": "El id debe tener 24 caracteres",
    "any.required": "El id es obligatorio"
  })
});

export { createUserSchema, updateUserSchema, userParamsSchema };
