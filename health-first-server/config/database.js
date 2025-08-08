const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.dbType = process.env.DB_TYPE || 'mongodb';
    this.isInitialized = false;
  }

  async init() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_first';
      
      // Connect to MongoDB (removed deprecated options)
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.connection = mongoose.connection;
      this.isInitialized = true;
      
      // Handle connection events
      this.connection.on('connected', () => {
        console.log('✅ Connected to MongoDB database');
      });

      this.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      this.connection.on('disconnected', () => {
        console.log('📴 MongoDB disconnected');
        this.isInitialized = false;
      });

      console.log(`✅ Connected to ${this.dbType.toUpperCase()} database`);
      
    } catch (error) {
      console.error('❌ Database connection error:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async close() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isInitialized = false;
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.connection && this.connection.readyState === 1) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Get mongoose connection
  getConnection() {
    return this.connection;
  }

  // Check if database is initialized
  isReady() {
    return this.isInitialized && this.connection && this.connection.readyState === 1;
  }
}

module.exports = Database; 