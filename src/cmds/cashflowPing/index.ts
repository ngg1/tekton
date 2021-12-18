import { Logger } from "../../lib/utils";
const io = require("socket.io-client");

export { command, aliases, describe, handler, deprecated };
// string (or array of strings) that executes this command when given on the command line, first string may contain positional args
const command = "cashflow ping";
// array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
const aliases = ["cf ping"];
//string used as the description for the command in help text, use false for a hidden command
const describe = "Ping the Structured Finance Portal cashflow server.";
const deprecated = false; // a boolean (or string) to show deprecation notice.
//// a function which will be passed the parsed argv.
const handler = async () => {
  let loggy = Logger();

  let socket = io("https://websocket.sfportal.com/", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    // "query": "x-auth-token=" + my.token, //permissioning on handshake
    transports: ["websocket", "xhr-polling"], //force websocket by default, work on > IE10
  });

  function disconnectAndLogResult(socket, res) {
    socket.close();
    let output = JSON.stringify(res, null, 2);
    loggy.log(output);
  }

  socket
    .on("connect", function () {
      socket.emit("PING");
    })
    .on("PONG", function () {
      let res = "Successfully pinged cashflow server.";
      disconnectAndLogResult(socket, res);
    })
    .on("connect_error", function (err) {
      let res = `connect_error ${JSON.stringify(err)}.`;
      disconnectAndLogResult(socket, res);
    })
    .on("connect_timeout", function (timeout) {
      let res = "Connection timed out.";
      disconnectAndLogResult(socket, res);
    })
    .on("disconnect", function (reason) {
      let res = `Disconnected due to ${reason}.`;
      disconnectAndLogResult(socket, res);
    })
    .on("error", function (err) {
      let res = `error ${JSON.stringify(err)}.`;
      disconnectAndLogResult(socket, res);
    });

  return null;
};
