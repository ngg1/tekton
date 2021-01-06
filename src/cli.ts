const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { middlewares } = require(".");
const path = require("path");

export const parser = yargs(hideBin(process.argv))
  .middleware(Array.from(Object.values(middlewares)))
  .strict() //args parsing
  .usage("Usage: $0 <command> [options]")
  .version()
  .commandDir(path.join(__dirname, "cmds"), {
    recurse: true,
  })
  //global options
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging (-vv=debug)",
  })
  .option("force", {
    alias: "f",
    type: "boolean",
    description: "godspeed",
  })
  .option("h", {
    alias: "help",
    description: "display help message",
  })
  .option("full-output", {
    type: "boolean",
    description: "Show full output",
    default: false,
  })
  .option("out-path", {
    type: "string",
    description: "out put path",
    default: "./output.txt",
  })
  .option("out", {
    alias: "o",
    type: "boolean",
    description: "out to file?",
    default: false,
  })
  //global behavior
  .count("verbose") //i.e log level
  .help()
  .demandCommand() //show help menu no command
  .showHelpOnFail(false, "Specify --help for available options");
