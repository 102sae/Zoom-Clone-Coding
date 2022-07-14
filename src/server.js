import { Socket } from "dgram";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpserver = http.createServer(app);
const wsServer = new Server(httpserver);

wsServer.on("connection", (socket) => {
  //백엔드에서 connection 받을 준비
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      done("hi from be"); //서버는 백엔드에서 함수를 호출하는데 함수는 프론트 엔드에서 실행됨
    }, 5000); //프론트엔드에서 작성된 코드를 백엔드에서 실행시키면 보안 위험
  });
});

/* const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket); //firefox와 연결되면 넣고 chrome과 연결되면 또 추가하고
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("Disconnect from the Browser"));
  socket.on("message", (msg) => {
    //json.stringify는 자바스크립트 객체를 string으로 변경
    //json.parse는 string을 자바스트립트 객체로 변경
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}); */

httpserver.listen(3000, handleListen);
