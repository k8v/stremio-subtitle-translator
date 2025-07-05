const MySQLAdapter = require('./adapters/MySQLAdapter');
const SQLiteAdapter = require('./adapters/SQLiteAdapter');
require('dotenv').config();

class DatabaseFactory {
    static createAdapter(type = null) {
        const dbType = type || process.env.DB_TYPE || 'mysql';
        
        switch (dbType.toLowerCase()) {
            case 'mysql':
                return new MySQLAdapter({
                    host: process.env.DATABASEHOST,
                    user: process.env.DATABASEUSER,
                    password: process.env.DATABASEPASSWORD,
                    database: process.env.DATABASE
                });
            
            case 'sqlite':
                return new SQLiteAdapter({
                    database: process.env.SQLITE_PATH || './data/database.db'
                });
            
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
    }

    static async createAndConnect(type = null) {
        const adapter = this.createAdapter(type);
        await adapter.connect();
        return adapter;
    }
}

module.exports = DatabaseFactory; 