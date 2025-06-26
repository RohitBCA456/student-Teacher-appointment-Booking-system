const socket = io("http://localhost:3000");

const urlParams = new URLSearchParams(window.location.search);
const teacherId = urlParams.get("teacherId");
const studentId = urlParams.get("studentId");

const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const roomId = `${studentId}-${teacherId}`;
let currentUserId = null;

fetch("http://localhost:2000/auth/getCurrentUser", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((userData) => {
    if (!userData || !userData.user || !userData.user._id) {
      alert("Failed to get current user.");
      return;
    }

    currentUserId = String(userData.user._id);

    socket.emit("register", currentUserId);
    socket.emit("join-room", roomId);

    setupSocketListeners();
  })
  .catch((err) => {
    console.error("Failed to fetch current user", err);
  });

function setupSocketListeners() {
  socket.on("load-messages", (messages) => {
    messages.forEach((msg) => {
      const isSentByCurrentUser = String(msg.sender) === currentUserId;
      appendMessage(msg.content, isSentByCurrentUser ? "sent" : "received");
    });

    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
  });

  socket.on("receive-message", (msg) => {
    const isSentByCurrentUser = String(msg.sender) === currentUserId;

    appendMessage(msg.message, isSentByCurrentUser ? "sent" : "received");

    if (!isSentByCurrentUser) {
      console.log("Marking as read:", roomId, currentUserId);
      socket.emit("mark_read", { roomId, username: currentUserId });
    }
  });

  socket.on("messages-read", ({ roomId, markedBy }) => {
    console.log(`Messages marked as read in ${roomId} by ${markedBy}`);
  });
}

sendButton.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text || !currentUserId) return;

  socket.emit("send-message", {
    username: currentUserId,
    roomId,
    message: text,
  });

  messageInput.value = "";
});

function appendMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type);
  messageDiv.textContent = text;

  chatContainer.appendChild(messageDiv);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}
