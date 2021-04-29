import { NodeSelector, buildGraph, getPaths, Logger } from "../lib/utils";

export async function setGraph(opts) {
  let { dirs, prefixes, ignore } = opts;
  let loggy = Logger();

  loggy.info("looking up modules under", dirs);
  loggy.info(`prefixes=${prefixes}`);
  loggy.info(`ignore=${ignore}`);

  let paths = await getPaths(dirs, ignore);
  opts.graph = buildGraph(paths, NodeSelector(prefixes));

  opts.graph.print();
}
