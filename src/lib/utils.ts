const globby = require("globby");
const path = require("path");
const fs = require("fs");

import { DGraph } from "./";

export async function getPaths(
  dirs: string[],
  ignores: string[] = [],
  files = ["package.json"]
): Promise<string[]> {
  return filterPaths(
    await globby(resolveDirPaths(dirs), {
      gitignore: true, //ignore node_modules ..etc
      deep: 12, // expand up to 12 inner paths
      expandDirectories: { files },
    }),
    resolveDirPaths(ignores)
  );
}

export function filterPaths(arr: string[], ignores: string[] = []): string[] {
  let paths: string[] = [];

  arr.map((path) => {
    if (!ignores.some((p) => path.includes(p))) {
      paths.push(path);
    }
  });

  return paths;
}

export function resolveDirPaths(arr) {
  let paths: string[] = [];
  arr.map((d) => {
    let tmp = path.posix.resolve(d);
    if (!fs.existsSync(tmp)) return;

    paths.push(fs.lstatSync(tmp).isDirectory() ? tmp : path.posix.dirname(tmp));
  });
  return paths;
}

export function isMatch(prefixes: Array<string>, name: string) {
  return name !== undefined && prefixes.some((p) => name.startsWith(p));
}

export function readPkg(path: string) {
  return require(path);
}

export function shorttenArr(arr) {
  for (let i = 0; i < arr.length; ++i) {
    for (let y = 0; y < arr[i].length; ++y) {
      arr[i][y] = arr[i][y].name + ":" + arr[i][y].path;
    }
  }
}

export function flat(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * [selector description]
 * @param {[type]} prefixes prefixes used to filter out interesting modules
 */
export function NodeSelector(prefixes: string[]) {
  // return true to include in graph..ignore otherwise
  return (pkg: { name } | string) => {
    return isMatch(prefixes, pkg instanceof Object ? pkg.name : pkg);
  };
}

export function buildGraph(paths: Array<string>, select: Function): DGraph {
  debug("path=", paths);

  let G = new DGraph();

  paths.forEach((val) => {
    let pkg = readPkg(val);

    select(pkg) && G.addNode(pkg.name, val, pkg);
  });
  debug("Graph size =", G.size());
  debug("adding edges..");

  G.getNodes().forEach((node) => {
    debug(node.name, ":", node.dependencies);

    Object.entries(node.dependencies).forEach((entry) => {
      let [dep, ver] = entry;
      select(dep) && G.addEdge(dep, node);
    });
  });
  return G;
}

export function writeFileSync(file, ...args) {
  log(`writing out to ${file}...`);

  return fs.writeFileSync.call(fs, path.posix.resolve(file), ...args);
}

let LOG_LEVEL = 0;
export function setLogLevel(log_level: number) {
  LOG_LEVEL = log_level;
}
export function log(...args: any[]) {
  console.log.apply(console, args);
}
export function error(...args: any[]) {
  console.error.apply(console, args);
}
export function warn(...args: any[]) {
  LOG_LEVEL >= 0 && console.warn.apply(console, args);
}
export function info(...args: any[]) {
  LOG_LEVEL >= 1 && console.info.apply(console, args);
}
export function debug(...args: any[]) {
  LOG_LEVEL >= 2 && console.debug.apply(console, args);
}
export function Logger() {
  return { error, warn, info, debug, log, setLogLevel };
}
