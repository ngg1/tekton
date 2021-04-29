# tekton

# usage

```
tekton % ./bin/cli -h
Usage: cli <command> [options]

Commands:
  cli dependantsOf mod [dirs..]    generate children/dependantsOf of specified
                                   module             [aliases: children, child]
  cli dependenciesOf mod [dirs..]  generate dependencies of specified module
                                   [aliases: dep, dependencies, parents, parent]
  cli top-order [dirs..]           generate the topological order from
                                   dependencies chain [aliases: deptree, torder]

Options:
      --version      Show version number                               [boolean]
  -v, --verbose      Run with verbose logging (-vv=debug)                [count]
  -f, --force        godspeed                                          [boolean]
  -h, --help         Show help                                         [boolean]
      --full-output  Show full output                 [boolean] [default: false]
      --out-path     out put path             [string] [default: "./output.txt"]
  -o, --out          out to file?                     [boolean] [default: false]
  ```