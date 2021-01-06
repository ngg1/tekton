const { exec } = require("child_process");

//test to pass http://www.cs.columbia.edu/~sedwards/classes/2019/4995-fall/proposals/topo-sort.pdf
it("must return correct output", (done) => {
  exec("node ./bin/cli top-order", "utf8", (err, stdout, stderr) => {
    let out = JSON.parse(stdout);
    for(let i = 0; i < out.length; i++) {
      for(let y = 0; y < out[i].length; y++) {
        out[i][y] = out[i][y].split(":")[0];
      }
    }

    expect(out).toStrictEqual([
      ["pkg3", "pkg6", "pkg7"],
      ["pkg2", "pkg4"],
      ["pkg1", "pkg5"],
    ]);
    done();
  });
  exec("node ./bin/cli top-order -s", "utf8", (err, stdout, stderr) => {
    let out = JSON.parse(stdout);
    out = out.map((p) => p.split(":")[0]);

    expect(out).toStrictEqual([
      "pkg3",
      "pkg6",
      "pkg7",
      "pkg2",
      "pkg4",
      "pkg1",
      "pkg5",
    ]);
    done();
  });
});

it("must able to detect cycles", (done) => {
  exec("node ./bin/cli top-order -p cir-", "utf8", (err, stdout, stderr) => {
    expect(stderr.includes("GraphError: graph has at least one cycle!")).toBe(
      true
    );
    done();
  });
});

// it("must have help menu", async () => {
//   // Run the command module with --help as argument
//   const output = await new Promise((resolve) => {
//     parser.parse("--help", (err, argv, output) => {
//       resolve(output);
//     })
//   });

//   // Verify the output is correct
//   expect(output).toBeDefined();
//   expect((output.length > 120)).toBe(true);

// });
