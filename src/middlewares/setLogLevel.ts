//https://github.com/aorinevo/yargs/blob/791ffee30b28a8f2d7a64253ed3dffc68104022e/docs/api.md#middlewarecallbacks
import { setLogLevel as _setLogLevel } from "../lib/utils";

export function setLogLevel(argvs) {
  _setLogLevel(argvs.verbose);
}
