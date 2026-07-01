require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const url = new URL(process.env.DATABASE_URL);

        const conn = await mysql.createConnection({
            host: url.hostname,
            port: Number(url.port),
            user: url.username,
            password: url.password,
            database: url.pathname.replace('/', ''),
            ssl: {
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