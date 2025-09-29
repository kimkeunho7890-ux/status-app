const { Pool } = require('pg');

// Render가 제공하는 데이터베이스 주소에 자동으로 연결합니다.
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
    const query = 'INSERT INTO users (id, password, name, isAdmin) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING';
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

// 최초 서버 실행 시 DB 초기화 및 관리자 계정 생성
const initAdmin = async () => {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    try {
        await initDb();
        const hash = await bcrypt.hash('admin123', saltRounds);
        await addUser('admin', hash, '관리자', 1);
        console.log("관리자 계정이 준비되었습니다.");
    } catch (err) {
        console.error("관리자 계정 초기화 오류", err);
    }
}

module.exports = { initAdmin, addUser, findUser, findAllUsers };