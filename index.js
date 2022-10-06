const { on } = require("events");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use("/static", express.static(__dirname));

const users = [];
io.on("connection", (socket) => {
  socket.emit("message", { message: "I love Socket.io" });
  socket.on("setUsername", (data) => {
    const USERNAME = data.username;
    if (users.indexOf(USERNAME) === -1) {
      users.push(USERNAME);
      console.log("current users:", users);
      socket.emit("userCreated", { username: USERNAME });
    } else {
      socket.emit("user-exists", { username: USERNAME });
    }
    socket.on("disconnect", () => {
      console.log(USERNAME, "has disconnected");
      if (users.indexOf(USERNAME) > -1) {
        const i = users.indexOf(USERNAME);
        users.splice(i, 1);
      }
    });
    socket.on("chat-message", (data) => {
      const { message } = data;
      const output = { message, username: USERNAME };
      console.log(output);
      io.emit("new-chat-message", output);
    });
  });
});

const MessageQueue = require("./message-queue");
const pmIo = io.of("/private-messages");
const messageQueue = new MessageQueue(pmIo);
pmIo.on("connection", (socket) => {
  let clientId = null;
  socket.on("set-username", (data) => {
    const USERNAME = data.username;
    clientId = USERNAME;
    console.log("set-username", data.username);
    messageQueue.addClientToRoom(clientId, socket);
  });
  socket.on("pm-message", (messagePackage) => {
    messageQueue.addMessage({ ...messagePackage, from: clientId });
  });
});

const PORT = 8001;
server.listen(PORT, () => {
  console.log("listening on", process.env.PORT || PORT);
});
