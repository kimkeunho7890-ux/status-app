const form = document.getElementById('register-form');
const messageArea = document.getElementById('message-area');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, password })
    });

    const result = await response.json();
    
    messageArea.textContent = result.message;

    if (result.success) {
        messageArea.className = 'success';
        form.reset(); // 성공 시 입력 필드 초기화
    } else {
        messageArea.className = 'error';
    }
});