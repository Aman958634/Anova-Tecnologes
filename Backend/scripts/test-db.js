require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST;
        const dbPort = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
        const dbUser = process.env.DB_USER || process.env.MYSQL_USER;
        const dbPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
        const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE;

        if (!dbHost || !dbUser || !dbPassword || !dbName) {
            throw new Error('Missing required DB env vars. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.');
        }

        const conn = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: false
            }
        });

        console.log('CONNECTED');

        const [rows] = await conn.query('SELECT NOW()');
        console.log(rows);

        await conn.end();
    } catch (e) {
        console.error(e);
    }
})();