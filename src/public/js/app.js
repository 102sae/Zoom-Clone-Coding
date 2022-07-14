const socket = io(); // io function이 알아서 socket.io를 실행하는 서버 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nameform = document.querySelector("#name");

room.hidden = true;
let roomName = "";

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`);
    input.value = "";
  });
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = document.querySelector("h3");
  h3.innerText = `Room : ${roomName}`;
  const msgform = room.querySelector("#msg");
  msgform.addEventListener("submit", handleMessageSubmit);
  nameform.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom); //vfront-end에서 객체 전달 가능
  //첫번째 매개변수에는 이벤트 이름
  //두번째는 보내고자하는 payload
  //서버에서 호출하는 함수는 꼭 마지막에
  roomName = input.value;
  input.value = "";
}

nameform.addEventListener("submit", handleNicknameSubmit);
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} Joined!`);
});

socket.on("bye", (user) => {
  addMessage(`${user} left..`);
});

socket.on("new_message", addMessage);
