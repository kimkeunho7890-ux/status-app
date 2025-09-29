const form = document.getElementById('register-form');
const messageArea = document.getElementById('message-area');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

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