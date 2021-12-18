const path = require("path");
const fs = require("fs");

export function readPkg(path: string) {
  return require(path);
}

export function flat(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

export function writeFileSync(file, ...args) {
  log(`writing out to ${file}...`);

  return fs.writeFileSync.call(fs, path.posix.resolve(file), ...args);
}

export function safeArrayFrom(res) {
  if (res === undefined) return [];
  return Array.from(res);
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
