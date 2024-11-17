// backend/config/db.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString, {
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
