"use strict";

const { Server } = require("ws");

module.exports = (routing, port, console) => {
  const ws = new Server({ port });

  ws.on("connection", (connection, req) => {
    const ip = req.socket.remoteAddress;

    connection.on("message", async (message) => {
      const obj = JSON.parse(message);
      const { name, method, args = [] } = obj;
      // checking endpoint
      const entity = routing[name];

      if (!entity) {
        connection.send('"Not found"', { binary: false });
        return;
      }
      // checking handler
      const handler = entity[method];
      if (!handler) {
        connection.send('"Not found"', { binary: false });
        return;
      }
      // parsing args
      const json = JSON.stringify(args);
      const parameters = json.substring(1, json.length - 1);
      console.log("json", json);
      console.log(`${ip} ${name}.${method}(${parameters})`);
      // trying to calculate the result
      try {
        const result = await handler(...args);
        connection.send(JSON.stringify(result.rows), { binary: false });
      } catch (err) {
        console.dir({ err });
        connection.send('"Server error"', { binary: false });
      }
    });
  });

  console.log(`API on port ${port}`);
};
