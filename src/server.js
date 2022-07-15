import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      //어댑터로부터 socket id와 room을 가져와서 만든 퍼블릭 룸만 찾음
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
  /*   ?는
  if(wsServer.sockets.adapter.rooms.get(roomName)){
    return wsServer.sockets.adapter.rooms.get(roomName).size
    } else {
    return undefined;
    }
    와 같음 */
}
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  //백엔드에서 connection 받을 준비
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // socketIO에서 지원하는 room
    done(); //프론트엔드에서 작성된 코드를 백엔드에서 실행시키면 보안 위험
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //welcome은 event 이름
    //welcome 이벤트를 roomNamge에 있는 모든 사람들에 emit, 하나의 socket
    wsServer.sockets.emit("room_change", publicRooms()); //모든 socket에 메세지를 전송
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpServer.listen(3000, handleListen);
