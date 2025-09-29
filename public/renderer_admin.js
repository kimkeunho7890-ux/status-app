const form = document.getElementById('register-form');
const messageArea = document.getElementById('message-area');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    // --- 이 주소도 전체 경로로 수정 ---
    const response = await fetch('https://status-app-server.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, password })
    });

    const result = await response.json();
    
    messageArea.textContent = result.message;

    if (result.success) {
        messageArea.className = 'success';
        form.reset();
    } else {
        messageArea.className = 'error';
    }
});