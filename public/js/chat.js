(() => {
    const config = window.chatConfig;
    const messages = Array.isArray(window.initialChatMessages)
        ? window.initialChatMessages
        : [];
    const socket = window.io ? window.io() : null;
    const messageList = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const status = document.getElementById("chatStatus");

    if (!config || !socket || !messageList || !form || !input) {
        return;
    }

    const escapeHtml = (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const renderMessage = (message) => {
        const isCurrentUser = String(message.sender?._id || message.senderId) === String(config.currentUserId);
        const wrapper = document.createElement("div");
        wrapper.className = `mb-2 d-flex ${isCurrentUser ? "justify-content-end" : "justify-content-start"}`;

        wrapper.innerHTML = `
            <div class="p-2 rounded ${isCurrentUser ? "bg-dark text-white" : "bg-light"}" style="max-width: 80%;">
                <div class="small fw-semibold mb-1">${escapeHtml(message.sender?.username || message.senderName || "User")}</div>
                <div>${escapeHtml(message.body)}</div>
            </div>
        `;

        messageList.appendChild(wrapper);
        messageList.scrollTop = messageList.scrollHeight;
    };

    messages.forEach(renderMessage);

    socket.on("listing:message", (message) => {
        if (String(message.listing) !== String(config.listingId)) {
            return;
        }

        renderMessage(message);
    });

    socket.on("listing:error", (payload) => {
        if (status) {
            status.textContent = payload.message || "Unable to send message";
        }
    });

    socket.on("connect", () => {
        socket.emit("listing:join", { listingId: config.listingId });
        if (status) {
            status.textContent = "Connected";
        }
    });

    socket.on("disconnect", () => {
        if (status) {
            status.textContent = "Disconnected";
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const body = input.value.trim();

        if (!body) {
            return;
        }

        socket.emit("listing:message", {
            listingId: config.listingId,
            body,
        });

        input.value = "";
    });
})();
