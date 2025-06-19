const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
   
    process.exit(1);
  }
};

module.exports = connectDB;