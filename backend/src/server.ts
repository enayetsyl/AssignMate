// server.js
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';


dotenv.config();

// Connect to MongoDB
connectDB();

// Define the port from the environment or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
