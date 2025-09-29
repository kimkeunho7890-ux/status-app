const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const db = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectedUsers = {};

// 서버 시작 시 DB 테이블만 초기화
db.initDb();

// 루트 경로 접속 시 login.html을 보여줌
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// 임시 관리자 계정 생성 API
app.get('/setup-admin-once', async (req, res) => {
    try {
        const hash = await bcrypt.hash('admin123', saltRounds);
        await db.addUser('admin', hash, '관리자', 1);
        res.status(200).send('<h1>관리자 계정이 성공적으로 생성되었습니다.</h1><p>이 창을 닫고 다시 로그인해주세요.</p>');
    } catch (err) {
        console.error("임시 관리자 생성 오류:", err);
        res.status(500).send('<h1>관리자 계정 생성에 실패했습니다. Render 로그를 확인해주세요.</h1>');
    }
});


app.post('/login', async (req, res) => {
    const { userId, password } = req.body;
    await db.findUser(userId, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.json({ success: true, userId: user.id, name: user.name, isAdmin: user.isAdmin });
            } else {
                res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
            }
        });
    });
});

app.post('/register', async (req, res) => {
    const { userId, password, name } = req.body;
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        await db.addUser(userId, hash, name);
        res.json({ success: true, message: `${name}(${userId}) 사용자가 등록되었습니다.` });
    } catch (err) {
        res.status(500).json({ success: false, message: '사용자 등록 중 오류가 발생했습니다.' });
    }
});

app.get('/all-users', async (req, res) => {
    await db.findAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ success: false, message: '데이터베이스 오류' });
        }
        res.json({ success: true, users: users });
    });
});

io.on('connection', (socket) => {
    socket.on('user-connected', ({ userId, name }) => {
        connectedUsers[userId] = { 
            socketId: socket.id, 
            status: '근무중',
            name: name
        };
        io.emit('online-users-update', connectedUsers);
    });
    
    socket.on('change-status', (newStatus) => {
        // --- 바로 이 부분의 오타를 수정했습니다 ---
        const userId = Object.keys(connectedUsers).find(key => connectedUsers[key