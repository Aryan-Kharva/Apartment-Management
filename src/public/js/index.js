let messageContainer = document.getElementById('message-container');

if (messageContainer) {
    setTimeout(()=> {
        messageContainer.classList.toggle('hide');
    }, 2000)
}