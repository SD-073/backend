// db/index.ts
// Import mongoose


const mongoose= require ('mongoose');
const  { Schema} = require ('mongoose');
const dotenv = require("dotenv")

dotenv.config()
// models/User.ts




async function connectDb () {
    const userSchema = new Schema({
      firstName: { type: String, required: [true, 'First name is required'] },
      lastName: { type: String, required: [true, 'Last name is required'] },
      email: { type: String, required: [true, 'Email is required'], unique: true },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model("User", userSchema)
    
    try {
        // Connect
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) throw new Error('MONGO_URI missing, check your .env file');
        
        await mongoose.connect(MONGO_URI, {
            dbName: 'learning-mongoose'
        });

        // const createdUser = await User.create({ firstName: 'Sarah', lastName: 'Doe', email: 'jdd@mail.com' });
        const users = await User.find({firstName: "Sarah"})
        console.log(users);
        
        console.log('MongoDB connected');
    } catch (error) {
        // Log error and end Node process if it fails
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

connectDb()


// {
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: [true, 'Last name is required'] },
//   email: { type: String, required: [true, 'Email is required'], unique: true }
//   createdAt: { type: Date, default: Date.now }
// }