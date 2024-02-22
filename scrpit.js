const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
let userMessage;

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;

}

const handleChat = () => {
  userMessage = chatInput.value.trim();
  console.log(userMessage);

  if (!userMessage) return;

  createChatLi(userMessage, "outgoing");

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));

  setTimeout(() => {
    chatbox.appendChild(createChatLi("I am a bot", "incoming"));
  }, 600);

};

sendChatBtn.addEventListener("click", handleChat);