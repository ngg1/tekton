const { exec } = require("child_process");

//test to pass http://www.cs.columbia.edu/~sedwards/classes/2019/4995-fall/proposals/topo-sort.pdf
it("must ping cashflow server", (done) => {
  return exec(
    "node ./bin/cli cashflow ping",
    (err, stdout, stderr) => {
      expect(stdout).toMatch("Successfully pinged cashflow server.");
      done();
    }
  );
});
