const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 // 100MB로 최대 파일 크기 설정
});

// CORS 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 파일 저장을 위한 메모리 저장소
const fileStorage = new Map();

// 정적 파일 제공
app.use(express.static('public'));

// 파일 다운로드 엔드포인트
app.get('/download/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const fileData = fileStorage.get(fileId);
    
    if (fileData) {
        res.setHeader('Content-Type', fileData.type);
        res.setHeader('Content-Disposition', `attachment; filename="${fileData.name}"`);
        
        // Base64 디코딩 후 전송
        const buffer = Buffer.from(fileData.data.split(',')[1], 'base64');
        res.send(buffer);
        
        // 다운로드 후 파일 삭제 (선택사항)
        // fileStorage.delete(fileId);
    } else {
        res.status(404).send('파일을 찾을 수 없습니다.');
    }
});

// 접속한 유저 목록
let users = [];

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    console.log('사용자 연결됨');

    // 채팅방 입장
    socket.on('join', (data) => {
        const user = {
            id: socket.id,
            username: data.username,
            profile: data.profile
        };
        
        users.push(user);
        
        // 입장 메시지 전송
        io.emit('message', {
            type: 'system',
            text: `${user.username}님이 입장하셨습니다.`,
            timestamp: new Date()
        });
        
        // 접속자 수 업데이트
        io.emit('userList', users);
    });

    // 메시지 수신 및 전송
    socket.on('sendMessage', (text, fileData) => {
        const user = users.find(u => u.id === socket.id);
        if (!user) return;

        const messageData = {
            type: 'user',
            username: user.username,
            profile: user.profile,
            text: text,
            timestamp: new Date()
        };

        // 파일이 있는 경우 처리
        if (fileData) {
            const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            fileStorage.set(fileId, fileData);

            messageData.file = {
                id: fileId,
                name: fileData.name,
                type: fileData.type,
                url: `/download/${fileId}`
            };

            // 이미지인 경우 미리보기 데이터 추가
            if (fileData.type.startsWith('image/')) {
                messageData.file.data = fileData.data;
            }
        }

        io.emit('message', messageData);
    });

    // 연결 해제
    socket.on('disconnect', () => {
        const index = users.findIndex(u => u.id === socket.id);
        if (index !== -1) {
            const user = users[index];
            users.splice(index, 1);
            
            // 퇴장 메시지 전송
            io.emit('message', {
                type: 'system',
                text: `${user.username}님이 퇴장하셨습니다.`,
                timestamp: new Date()
            });
            
            // 접속자 수 업데이트
            io.emit('userList', users);
        }
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 