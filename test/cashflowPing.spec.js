const { exec } = require("child_process");

it("must ping cashflow server", (done) => {
  return exec(
    "node ./bin/cli cashflow ping",
    (err, stdout, stderr) => {
      expect(stdout).toMatch("Successfully pinged cashflow server.");
      done();
    }
  );
});

it("must ping all hosts", (done) => {
  return exec(
    "node ./bin/cli connect test",
    (err, stdout, stderr) => {
      let hosts = [
        "https://websocket.sfportal.com/",
        "ws://websocketstest.com/service/",
      ];
      hosts.forEach((host) => {
        expect(stdout).toMatch("Successfully pinged ${host}.");
      });
      done();
    }
  );
});
