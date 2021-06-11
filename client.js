require('dotenv').config()
const { Pool } = require('pg');

const client = new Pool({
 user: process.env.USER,
 host: process.env.HOST,
 database: process.env.DATABASE,
 password: process.env.PASSWORD,
 port: 5432,
});

module.exports = client