import { Logger } from "../../lib/utils";
import { WebSocket } from "ws";
const io = require("socket.io-client");

export { command, describe, handler, deprecated };
// string (or array of strings) that executes this command when given on the command line, first string may contain positional args
const command = "connect test";
//string used as the description for the command in help text, use false for a hidden command
const describe = "Test connection to all servers.";
const deprecated = false; // a boolean (or string) to show deprecation notice.
//// a function which will be passed the parsed argv.
const handler = async () => {
  let loggy = Logger();

  loggy.log("Beginning tests...");

  enum SocketType {
    SOCKETIO = "socketio",
    WS = "ws",
  }

  let hosts = [
    {
      url: "https://websocket.sfportal.com/",
      type: SocketType.SOCKETIO,
    },
    {
      url: "ws://ws.ifelse.io/",
      type: SocketType.WS,
    },
  ];

  function disconnectAndLogResult(socket, res) {
    socket.close();
    loggy.log(res);
  }

  function openSocketIo(url) {
    let socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 60000,
      // "query": "x-auth-token=" + my.token, //permissioning on handshake
      transports: ["websocket", "xhr-polling"], //force websocket by default, work on > IE10
    });
    let startTime, latency;
    socket
      .on("connect", function () {
        startTime = Date.now();
        socket.emit("PING");
      })
      .on("PONG", function () {
        latency = Date.now() - startTime;
        let res = `Successfully pinged ${url}. ${latency}ms`;
        socket.off();
        disconnectAndLogResult(socket, res);
      })
      .on("connect_error", function (err) {
        let res = `${url} connect_error ${JSON.stringify(err)}.`;
        disconnectAndLogResult(socket, res);
      })
      .on("connect_timeout", function (timeout) {
        let res = `Connection to ${url} timed out.`;
        disconnectAndLogResult(socket, res);
      })
      .on("disconnect", function (reason) {
        let res = `Disconnected from ${url} due to ${reason}.`;
        disconnectAndLogResult(socket, res);
      })
      .on("error", function (err) {
        let res = `${url} error ${JSON.stringify(err)}.`;
        disconnectAndLogResult(socket, res);
      });
  }

  function openWsSocket(url) {
    let startTime, latency;
    let socket = new WebSocket(url);
    socket
      .on("open", function () {
        startTime = Date.now();
        socket.send("echo");
      })
      .on("message", function (data, isBinary) {
        if (data.toString() === "echo") {
          latency = Date.now() - startTime;
          let res = `Successfully pinged ${url}. ${latency}ms`;
          disconnectAndLogResult(socket, res);
        }
      })
      .on("close", function (code, reason) {
        //0,1 open states, 2,3 already closed
        if (socket.readyState < 2 && code !== 1000) {
          // 1000 is expected, don't log error
          let res = `Disconnected from ${url} ${
            code !== undefined || reason !== undefined
              ? `due to ${code} ${reason}`
              : ""
          }.`;
          disconnectAndLogResult(socket, res);
        }
      })
      .on("error", function (err) {
        let res = `${url} error ${JSON.stringify(err, null, 2)}.`;
        disconnectAndLogResult(socket, res);
      });
  }

  hosts.forEach((host) => {
    switch (host.type) {
      case SocketType.SOCKETIO:
        openSocketIo(host.url);
        break;
      case SocketType.WS:
        openWsSocket(host.url);
        break;
      default:
        break;
    }
  });

  return null;
};
