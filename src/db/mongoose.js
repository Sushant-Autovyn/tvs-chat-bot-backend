const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/tvs-support';

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
