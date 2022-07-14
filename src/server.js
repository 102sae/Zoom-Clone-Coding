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
  socket["nickname"] = "Anon";
  //백엔드에서 connection 받을 준비
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // socketIO에서 지원하는 room
    done(); //프론트엔드에서 작성된 코드를 백엔드에서 실행시키면 보안 위험
    socket.to(roomName).emit("welcome", socket.nickname); //welcome은 event 이름
    //welcome 이벤트를 roomNamge에 있는 모든 사람들에 emit
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpserver.listen(3000, handleListen);
