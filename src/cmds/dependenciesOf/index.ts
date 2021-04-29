import {
  NodeSelector,
  buildGraph,
  shorttenArr,
  getPaths,
  Logger,
  writeFileSync,
} from "../../lib/utils";

const path = require("path");

//
export { command, aliases, describe, builder, handler, deprecated };
// string (or array of strings) that executes this command when given on the command line, first string may contain positional args
const command = "dependenciesOf mod [dirs..]";
// array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
const aliases = [
  "dep mod [dirs..]",
  "dependencies mod [dirs...]",
  "parents mod [dirs...]",
  "parent mod [dirs...]",
];
//string used as the description for the command in help text, use false for a hidden command
const describe = "generate dependencies of specified module";
//object declaring the options the command accepts, or a function accepting and returning a yargs instance
const builder = (yargs) => {
  return yargs
    .positional("mod", {
      describe: "specified module",
      type: "string",
    })
    .positional("dirs", {
      describe:
        "dirs to look up modules (where package.json files are located)",
      type: "array",
      default: [process.cwd()],
    })
    .option("ignore", {
      type: "array",
      description: "An array of dirs to ignore",
      default: [],
    })
    .option("prefixes", {
      alias: "p",
      type: "array",
      description: "prefixes of interested modules to select",
      default: ["pkg"],
    });
};
const deprecated = false; // a boolean (or string) to show deprecation notice.
//// a function which will be passed the parsed argv.
const handler = async (opts) => {
  let { mod, dirs, prefixes, ignore } = opts;
  let loggy = Logger();

  loggy.info("looking up modules under", dirs);
  loggy.info(`prefixes=${prefixes}`);
  loggy.info(`ignore=${ignore}`);

  let paths = await getPaths(dirs, ignore);

  let G = buildGraph(paths, NodeSelector(prefixes));

  G.print();

  let res = G.dependenciesOf(mod);

  !opts.fullOutput && shorttenArr(res);

  let output = JSON.stringify(res, null, 2);

  if (opts.out) {
    writeFileSync(opts.outPath, output);
  }

  loggy.log(output);

  return output;
};
