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

// public 폴더를 static 경로로 지정
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectedUsers = {};

// --- DB 초기화 및 관리자 계정 생성 ---
// 서버가 시작될 때 한번만 실행됩니다.
db.initAdmin();

// 루트 경로 접속 시 login.html을 보여줌
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
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
        const userId = Object.keys(connectedUsers).find(key => connectedUsers[key].socketId === socket.id);
        if (userId) {
            connectedUsers[userId].status = newStatus;
            io.emit('online-users-update', connectedUsers);
        }
    });

    socket.on('send-poke', ({ targetUserId, message, senderName }) => {
        const target = connectedUsers[targetUserId];
        if (target) {
            io.to(target.socketId).emit('receive-poke', { message, senderName });
        }
    });

    socket.on('disconnect', () => {
        const userId = Object.keys(connectedUsers).find(key => connectedUsers[key].socketId === socket.id);
        if (userId) {
            delete connectedUsers[userId];
            io.emit('online-users-update', connectedUsers);
        }
    });
});

// Render는 PORT 환경변수를 사용하므로, process.env.PORT를 우선적으로 사용하도록 설정
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = server;