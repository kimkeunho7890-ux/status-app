const socket = io("https://status-app-server.onrender.com/");
const userListDiv = document.getElementById('user-list');

let currentUserId = null;
let currentUserName = null;
let allUsers = []; 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userInfo = await window.electronAPI.getUserInfo();
        if (userInfo) {
            currentUserId = userInfo.userId;
            currentUserName = userInfo.name;
        }
    } catch (e) {
        console.error("로그인 정보를 가져오는데 실패했습니다.", e);
    }

    try {
        const response = await fetch('https://status-app-server.onrender.com/all-users');
        const data = await response.json();
        
        if (data.success && data.users && data.users.length > 0) {
            allUsers = data.users;
            sortAndRenderUsers({});
        } else {
            userListDiv.innerHTML = '<p class="empty-message">등록된 사용자가 없습니다.<br>admin 계정으로 로그인하여<br>새 사용자를 추가해주세요.</p>';
        }
    } catch (e) {
        console.error("전체 사용자 목록을 가져오는데 실패했습니다.", e);
    }
    
    if (currentUserId) {
        socket.emit('user-connected', { userId: currentUserId, name: currentUserName });
    }
});

socket.on('online-users-update', (onlineUsers) => {
    sortAndRenderUsers(onlineUsers);
});

socket.on('receive-poke', ({ message, senderName }) => {
    window.electronAPI.openPopup({ message, senderName });
});

document.querySelectorAll('.status-btn').forEach(button => {
    button.addEventListener('click', () => {
        const newStatus = button.dataset.status;
        socket.emit('change-status', newStatus);
    });
});

userListDiv.addEventListener('click', (e) => {
    // 클릭된 요소 또는 그 부모가 .poke-btn 클래스를 가졌는지 확인
    const pokeButton = e.target.closest('.poke-btn');
    if (pokeButton) {
        const targetUserId = pokeButton.dataset.target;
        const message = pokeButton.dataset.message;
        if (currentUserName) {
            socket.emit('send-poke', { targetUserId, message, senderName: currentUserName });
        }
    }
});


function sortAndRenderUsers(onlineUsers = {}) {
    allUsers.sort((a, b) => {
        const aIsOnline = onlineUsers.hasOwnProperty(a.id);
        const bIsOnline = onlineUsers.hasOwnProperty(b.id);

        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;

        if (aIsOnline && !bIsOnline) return -1;
        if (!aIsOnline && bIsOnline) return 1;

        return a.name.localeCompare(b.name);
    });

    userListDiv.innerHTML = '';
    allUsers.forEach(user => {
        const userStatusData = onlineUsers[user.id];
        const userDiv = createUserCard(user, userStatusData);
        userListDiv.appendChild(userDiv);
    });
}


// 개별 사용자 카드를 생성하는 함수
function createUserCard(user, statusData) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-card';
    userDiv.id = `user-${user.id}`;
    
    const status = statusData ? statusData.status : 'Offline';

    let pokeButtonsHTML = '';
    // 온라인 상태인 다른 사용자에게만 말 걸기 버튼 표시
    if (currentUserId && user.id !== currentUserId && statusData) {
        // 카카오톡 로고 SVG 아이콘
        const kakaoSVG = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M256 464c-114.9 0-208-79.3-208-176.6S141.1 110.8 256 110.8s208 79.3 208 176.6S370.9 464 256 464zM168.1 228.4c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm175.8 0c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"></path></svg>`;
        
        // '담타' 버튼 삭제, '카톡' 버튼을 로고로 변경
        pokeButtonsHTML = `
            <button class="poke-btn" data-target="${user.id}" data-message="카톡확인좀" title="카톡 확인 요청">
                ${kakaoSVG}
            </button>`;
    }
    
    userDiv.innerHTML = `
        <div class="user-details">
            <span class="name ${getStatusClass(status)}">${user.name}</span>
        </div>
        ${pokeButtonsHTML}
    `;
    return userDiv;
}

function getStatusClass(status) {
    switch (status) {
        case '근무중': return 'name-work';
        case '휴게': return 'name-break';
        case '점심': return 'name-lunch';
        default: return 'name-offline';
    }

}
