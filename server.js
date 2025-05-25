const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://jrs1101.github.io", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// CORS 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://jrs1101.github.io');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// 정적 파일 제공
app.use(express.static(__dirname));

// 접속한 사용자 목록
const users = new Map();

io.on('connection', (socket) => {
    console.log('사용자 접속:', socket.id);

    // 사용자 입장
    socket.on('join', (username) => {
        users.set(socket.id, username);
        io.emit('userList', Array.from(users.values()));
        io.emit('message', {
            type: 'system',
            text: `${username}님이 입장하셨습니다.`,
            timestamp: new Date()
        });
    });

    // 메시지 수신 및 브로드캐스트
    socket.on('sendMessage', (message) => {
        const username = users.get(socket.id);
        io.emit('message', {
            type: 'chat',
            username: username,
            text: message,
            timestamp: new Date()
        });
    });

    // 연결 끊김
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            io.emit('userList', Array.from(users.values()));
            io.emit('message', {
                type: 'system',
                text: `${username}님이 퇴장하셨습니다.`,
                timestamp: new Date()
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 