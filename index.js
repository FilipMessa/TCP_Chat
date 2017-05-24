"use-strict";

const net = require("net");
const port = 8000;
let clients = [];
let id = 0;

const log = {
  info: console.log,
  error: console.error
};

// broadcast to others clients
function broadcast(author = "all", message) {
  if (clients.length === 0) {
    log.info("No users! Chat is empty");
  } else {
    log.info(message);
    clients.filter(c => c.id !== author).map(c => c.write(message));
  }
}

const server = net.createServer();

server.on("connection", client => {
  // set client id
  client.id = id;
  id++;
  client.write("Hello, enter your nickname:\n");
  client.on("data", data => {
    // parse data
    const stringData = data.toString("utf8").replace(/\n$/, "");

    if (!client.nickname) {
      // set client nickname
      client.nickname = stringData;
      log.info(`The user ${client.nickname} is connected.\n`);

      // add client to clients array
      clients.push(client);
      client.write(`Welcome, ${client.nickname}\n`);

      // send other client message
      broadcast(client.id, `${client.nickname} joined\n`);
    } else {
      const message = `${client.nickname} : ${stringData}\n`;
      broadcast(client.id, message);
    }
  });

  client.on("end", () => {
    const message = `The ${client.nickname} disconnected\n`;
    log.info(message);

    // remove disconnected client from clients
    clients = clients.filter(c => c.id !== client.id);
    broadcast(null, message);
  });
});

server.listen(port, () => {
  const address = server.address();
  log.info(`Server listening at ${address.address}:${address.port}`);
});
