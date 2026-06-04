import mongoose from 'mongoose'
import { env } from './env.js'
const connectDB = async () => {
    try {
        console.log('💻 Conectando MongoDB...')
        await mongoose.connect(env.MONGO_URI)
        console.log('MongoDb conectado correctamente!!!')
    } catch(error){
        console.log('Error conectando MongoDB')
        console.log(error.message)
    }
}
export default  connectDB