const { exec } = require("child_process");

//test to pass http://www.cs.columbia.edu/~sedwards/classes/2019/4995-fall/proposals/topo-sort.pdf
it("must return correct output", (done) => {
  return exec(
    "node ./bin/cli dependantsOf pkg6",
    "utf8",
    (err, stdout, stderr) => {
      let out = JSON.parse(stdout);
      out = out.map((p) => p.split(":")[0]);

      expect(out).toEqual(expect.arrayContaining(["pkg2", "pkg4"]));
      done();
    }
  );
});
