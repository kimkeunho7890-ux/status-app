const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://status-app-server.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
    });
    
    const result = await response.json();

    if (result.success) {
        errorMessage.textContent = '';
        window.electronAPI.loginSuccess({ 
            userId: result.userId, 
            name: result.name,
            isAdmin: result.isAdmin 
        });
    } else {
        errorMessage.textContent = result.message;
    }
});