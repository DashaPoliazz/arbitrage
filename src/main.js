"use strict";

const fsp = require("node:fs").promises;
const path = require("node:path");
const config = require("./config.js");
const load = require("./load.js")(config.sandbox);
const process = require("node:process");
const transport = require(`./transport/${config.api.transport}.js`);

// instantiating stock exchanges clients
const clients = [];
for (const clientName of config.activeClients) {
  const clientConfig = config.clients[clientName];
  if (!clientConfig) continue;
  // there is a guarantee that either 'httpConnection' or 'wsConnection'
  // should have flag 'true' if 'config.activeClient' includes 'clientName'
  if (clientConfig.httpConnection) {
    const HTTPClient = require(`./clients/${clientName}/http.js`);
    const client = new HTTPClient(clientConfig);
    clients.push(client);
  }
}

console.log(clients);

const sandbox = {
  console,
  common: {},
};

const apiPath = path.join(process.cwd(), "./api");
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox);
  }

  transport(routing, config.api.port, console);
})();
