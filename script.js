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
    const emojiPicker = document.querySelector('.emoji-picker');
    const emojiTabs = document.querySelectorAll('.emoji-tab');
    const emojiContents = document.querySelectorAll('.emoji-content');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');
    const onlineCount = document.getElementById('onlineCount');
    const fileButton = document.querySelector('.file-button');
    const fileUpload = document.getElementById('fileUpload');
    const filePreview = document.querySelector('.file-preview');
    const imagePreview = document.getElementById('imagePreview');
    const fileInfo = document.getElementById('fileInfo');
    const cancelUpload = document.querySelector('.cancel-upload');

    let username = '';
    let userProfile = 'https://via.placeholder.com/40';
    let currentFile = null;

    // 프로필 이미지 업로드 처리
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userProfile = e.target.result;
                profilePreview.src = userProfile;
            };
            reader.readAsDataURL(file);
        }
    });

    // 이모티콘 관련 기능
    const customEmojis = [
        { src: 'https://media.giphy.com/media/RMwgs5kZqkJJS0F5rp/giphy.gif', code: ':잘자요:' },
        { src: 'https://media.giphy.com/media/XGmHk5ZWDrHiw/giphy.gif', code: ':아침:' },
        { src: 'https://media.giphy.com/media/w89ak63KNl0nJl80ig/giphy.gif', code: ':안녕:' },
        { src: 'https://media.giphy.com/media/3BUYbmX7uqX9YZjt5F/giphy.gif', code: ':마스크:' },
        { src: 'https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif', code: ':화남:' },
        { src: 'https://media.giphy.com/media/TPl5N4Ci49ZQY/giphy.gif', code: ':궁금:' },
        { src: 'https://media.giphy.com/media/LnKa2WLkd6eAM/giphy.gif', code: ':하트:' },
        { src: 'https://media.giphy.com/media/7SF5scGB2AFrgsXP63/giphy.gif', code: ':슬픔:' }
    ];

    // 커스텀 이모티콘 로드
    const customEmojisContainer = document.getElementById('customEmojis');
    customEmojis.forEach(emoji => {
        const img = document.createElement('img');
        img.src = emoji.src;
        img.alt = emoji.code;
        img.onclick = () => insertEmoji(emoji.code);
        customEmojisContainer.appendChild(img);
    });

    // 이모티콘 탭 전환
    emojiTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            emojiTabs.forEach(t => t.classList.remove('active'));
            emojiContents.forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            document.getElementById(targetTab + 'Emojis').style.display = 'grid';
        });
    });

    // 이모티콘 버튼 토글
    emojiButton.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    // 이모티콘 선택
    document.querySelectorAll('.emoji-content span, .emoji-content img').forEach(emoji => {
        emoji.addEventListener('click', () => {
            insertEmoji(emoji.innerText || emoji.alt);
            emojiPicker.style.display = 'none';
        });
    });

    function insertEmoji(emoji) {
        input.value += emoji;
        input.focus();
    }

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
            socket.emit('join', { username, profile: userProfile });
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

    // 파일 업로드 버튼 클릭
    fileButton.addEventListener('click', () => {
        fileUpload.click();
    });

    // 파일 선택 처리
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        currentFile = file;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                fileInfo.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
            fileInfo.style.display = 'flex';
            fileInfo.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>${file.name}</span>
            `;
        }

        filePreview.style.display = 'block';
    });

    // 파일 업로드 취소
    cancelUpload.addEventListener('click', () => {
        currentFile = null;
        filePreview.style.display = 'none';
        fileUpload.value = '';
    });

    // 메시지 전송 함수
    function sendMessage() {
        const messageText = input.value.trim();
        
        if (messageText === '' && !currentFile) return;

        if (currentFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: currentFile.name,
                    type: currentFile.type,
                    data: e.target.result
                };
                
                socket.emit('sendMessage', messageText, fileData);
                
                currentFile = null;
                filePreview.style.display = 'none';
                fileUpload.value = '';
            };
            reader.readAsDataURL(currentFile);
        } else {
            socket.emit('sendMessage', messageText);
        }

        input.value = '';
    }

    // 메시지 표시 함수
    function displayMessage(message) {
        const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        let messageText = message.text || '';
        let fileContent = '';
        
        // 이모티콘 코드를 이미지로 변환
        customEmojis.forEach(emoji => {
            const regex = new RegExp(emoji.code, 'g');
            messageText = messageText.replace(regex, `<img src="${emoji.src}" class="chat-emoji" alt="${emoji.code}">`);
        });

        // 파일 처리
        if (message.file) {
            if (message.file.type.startsWith('image/')) {
                fileContent = `
                    <div class="message-file">
                        <img src="${message.file.data}" alt="Uploaded image" onclick="window.open('${message.file.url}', '_blank')">
                        <a href="${message.file.url}" class="file-download" download="${message.file.name}">
                            <i class="fas fa-download"></i>
                            <span>다운로드</span>
                        </a>
                    </div>
                `;
            } else {
                const fileSize = message.file.size ? `(${formatFileSize(message.file.size)})` : '';
                fileContent = `
                    <div class="message-file">
                        <a href="${message.file.url}" class="file-download" download="${message.file.name}">
                            <i class="fas fa-file-pdf"></i>
                            <span>${message.file.name} ${fileSize}</span>
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                `;
            }
        }

        if (message.type === 'system') {
            const systemMessage = `
                <div class="message system">
                    <div class="message-text">
                        ${messageText}
                    </div>
                    ${fileContent}
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', systemMessage);
        } else {
            const messageHTML = `
                <div class="message">
                    <div class="message-avatar">
                        <img src="${message.profile || 'https://via.placeholder.com/40'}" alt="User">
                    </div>
                    <div class="message-content">
                        <div class="message-info">
                            <span class="username">${message.username}</span>
                            <span class="timestamp">${time}</span>
                        </div>
                        <div class="message-text">
                            ${messageText}
                        </div>
                        ${fileContent}
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

    // 소켓 이벤트 리스너
    socket.on('message', displayMessage);
    
    socket.on('userList', (users) => {
        onlineCount.textContent = `${users.length} 온라인`;
    });

    // 클릭 이벤트 처리 (이모티콘 패널 닫기)
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiButton.contains(e.target)) {
            emojiPicker.style.display = 'none';
        }
    });

    // 파일 크기 포맷팅 함수
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 