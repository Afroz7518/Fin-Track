const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n👉 To fix this, choose one of the following options:`);
    console.error(`   1. Install & start MongoDB locally: https://www.mongodb.com/try/download/community`);
    console.error(`      Then run: mongod`);
    console.error(`   2. Use MongoDB Atlas (free cloud): https://cloud.mongodb.com`);
    console.error(`      Then update MONGO_URI in server/.env with your Atlas connection string\n`);
    console.error(`   Server will keep retrying every 5 seconds...\n`);
    // Retry after 5 seconds instead of crashing
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
