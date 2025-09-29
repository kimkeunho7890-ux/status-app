const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
    });
    
    const result = await response.json();

    if (result.success) {
        errorMessage.textContent = '';
        // isAdmin 정보까지 객체로 전달
        window.electronAPI.loginSuccess({ 
            userId: result.userId, 
            name: result.name,
            isAdmin: result.isAdmin 
        });
    } else {
        errorMessage.textContent = result.message;
    }
});