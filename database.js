const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDb = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            isAdmin INTEGER DEFAULT 0
        );
    `;
    try {
        await pool.query(query);
        console.log("테이블이 성공적으로 생성되었거나 이미 존재합니다.");
    } catch (err) {
        console.error("테이블 생성 오류", err.stack);
    }
};

const addUser = async (id, password, name, isAdmin = 0) => {
    const query = 'INSERT INTO users (id, password, name, isAdmin) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET password = $2, name = $3, isAdmin = $4';
    try {
        await pool.query(query, [id, password, name, isAdmin]);
    } catch (err) {
        console.error('사용자 추가 오류', err.stack);
    }
};

const findUser = async (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
        const res = await pool.query(query, [id]);
        callback(null, res.rows[0]);
    } catch (err) {
        callback(err, null);
    }
};

const findAllUsers = async (callback) => {
    const query = 'SELECT id, name FROM users WHERE isAdmin = 0';
    try {
        const res = await pool.query(query);
        callback(null, res.rows);
    } catch (err) {
        callback(err, null);
    }
};

// initAdmin 함수를 삭제하고 initDb만 내보냅니다.
module.exports = { initDb, addUser, findUser, findAllUsers };