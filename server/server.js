const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ["http://localhost:3000", "https://juny3.github.io"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
const cors = require('cors');
const path = require('path');

// CORS 설정
app.use(cors({
    origin: ["http://localhost:3000", "https://juny3.github.io"],
    credentials: true
}));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '..'))); // 상위 디렉토리의 파일들을 제공

// 상태 확인 엔드포인트
app.get('/status', (req, res) => {
    res.json({ status: 'ok', message: '서버가 정상적으로 실행 중입니다.' });
});

// 루트 경로로 접근 시 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

let onlineUsers = new Set();

io.on('connection', (socket) => {
    console.log('새로운 사용자가 연결되었습니다.');

    socket.on('join', (data) => {
        console.log('사용자 입장:', data.username);
        socket.username = data.username;
        socket.userProfile = data.profile;
        onlineUsers.add(socket.username);
        
        io.emit('userJoined', {
            username: socket.username,
            profile: socket.userProfile,
            onlineCount: onlineUsers.size,
            type: 'system',
            text: `${socket.username}님이 입장하셨습니다.`,
            timestamp: new Date()
        });

        io.emit('userList', onlineUsers);
    });

    socket.on('sendMessage', (messageText, fileData) => {
        console.log('메시지 수신:', {
            username: socket.username,
            text: messageText,
            hasFile: !!fileData
        });

        if (!socket.username) {
            console.log('사용자 이름이 없음');
            return;
        }

        const messageData = {
            username: socket.username,
            profile: socket.userProfile,
            text: messageText,
            type: 'user',
            timestamp: new Date()
        };

        if (fileData) {
            messageData.file = {
                name: fileData.name,
                type: fileData.type,
                data: fileData.data,
                url: fileData.data,
                size: fileData.size
            };
        }

        io.emit('message', messageData);
        console.log('메시지 전송 완료');
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log('사용자 퇴장:', socket.username);
            onlineUsers.delete(socket.username);
            
            io.emit('userLeft', {
                username: socket.username,
                onlineCount: onlineUsers.size,
                type: 'system',
                text: `${socket.username}님이 퇴장하셨습니다.`,
                timestamp: new Date()
            });

            io.emit('userList', onlineUsers);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 