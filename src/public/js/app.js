const socket = io(); // io function이 알아서 socket.io를 실행하는 서버 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg) {
  console.log("backend say: ", msg);
}
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, backendDone); //vfront-end에서 객체 전달 가능
  //첫번째 매개변수에는 이벤트 이름
  //두번째는 보내고자하는 payload
  //서버에서 호출하는 함수는 꼭 마지막에
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
