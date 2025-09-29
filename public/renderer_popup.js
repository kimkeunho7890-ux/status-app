// Main 프로세스로부터 데이터를 받음
window.electronAPI.onShowPopup((data) => {
    document.getElementById('sender').textContent = `${data.senderName}님의 메시지`;
    document.getElementById('message').textContent = data.message;

    // 3초 후에 자동으로 창을 닫음
    setTimeout(() => {
        window.close();
    }, 3000);
});