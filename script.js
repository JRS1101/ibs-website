// 서버 URL을 환경에 따라 설정
const SERVER_URL = 'https://jeialeseu-silsigan-caeting.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // Socket.IO 연결 설정
    const socket = io(SERVER_URL, {
        transports: ['websocket'],
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    
    // DOM 요소
    const loginContainer = document.getElementById('loginContainer');
    const chatContainer = document.getElementById('chatContainer');
    const usernameInput = document.getElementById('usernameInput');
    const joinButton = document.getElementById('joinButton');
    const chatMessages = document.querySelector('.chat-messages');
    const input = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-button');
    const emojiButton = document.querySelector('.emoji-button');
    const onlineCount = document.getElementById('onlineCount');

    let username = '';

    // 연결 상태 로깅
    socket.on('connect', () => {
        console.log('서버에 연결되었습니다.');
    });

    socket.on('connect_error', (error) => {
        console.error('연결 오류:', error);
    });

    // 입장 버튼 클릭
    joinButton.addEventListener('click', () => {
        username = usernameInput.value.trim();
        if (username) {
            socket.emit('join', username);
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        }
    });

    // 엔터키로 입장
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinButton.click();
        }
    });

    // 메시지 전송 함수
    function sendMessage() {
        const messageText = input.value.trim();
        if (messageText === '') return;

        socket.emit('sendMessage', messageText);
        input.value = '';
    }

    // 메시지 표시 함수
    function displayMessage(message) {
        const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (message.type === 'system') {
            const systemMessage = `
                <div class="message system">
                    <div class="message-text">
                        ${message.text}
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', systemMessage);
        } else {
            const messageHTML = `
                <div class="message">
                    <div class="message-avatar">
                        <img src="https://via.placeholder.com/40" alt="User">
                    </div>
                    <div class="message-content">
                        <div class="message-info">
                            <span class="username">${message.username}</span>
                            <span class="timestamp">${time}</span>
                        </div>
                        <div class="message-text">
                            ${message.text}
                        </div>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 이벤트 리스너 등록
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 이모지 버튼 클릭 이벤트
    emojiButton.addEventListener('click', () => {
        input.value += '😊';
        input.focus();
    });

    // 소켓 이벤트 리스너
    socket.on('message', displayMessage);
    
    socket.on('userList', (users) => {
        onlineCount.textContent = `${users.length} 온라인`;
    });
}); 