const { uuid } = require("uuidv4");

class MessageQueue {
  constructor(io) {
    this.messages = new Map();
    this.io = io;
  }
  addClientToRoom(clientId, socket) {
    const roomId = `${clientId}-room`;
    socket.join(roomId);
    console.log(`adding to ${roomId}`);
  }
  addMessage(messagePackageIn) {
    const { to, from, body } = messagePackageIn;
    const clientId = to;
    if (!this.messages.get(clientId)) this.messages.set(clientId, new Map());

    const clientMessages = this.messages.get(clientId);
    const messageId = uuid();
    const messagePackage = {
      to,
      from,
      messageId,
      body,
    };
    clientMessages.set(messageId, messagePackage);
    console.log(`sending message ${messageId} to ${clientId}`);
    this.io.in(`${clientId}-room`).emit("pm-message-for-you", messagePackage);
  }
}

module.exports = MessageQueue;
