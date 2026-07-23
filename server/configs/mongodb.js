import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log("Database Connected");
    })

    let dbNameOption = {};
    try {
        const url = new URL(process.env.MONGODB_URI);
        const dbName = url.pathname.replace(/^\//, '');
        if (!dbName) {
            dbNameOption = { dbName: 'ai-image' };
        }
    } catch (error) {
        // Fallback in case of parsing error
    }

    await mongoose.connect(process.env.MONGODB_URI, dbNameOption);

}

export default connectDB;