// string (or array of strings) that executes this command when given on the command line, first string may contain positional args
exports.command		=	"dependency [dirs..]"
// array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
exports.aliases		=	["dep [dirs..]", "deptree [dirs..]", "torder [dirs..]"]
//string used as the description for the command in help text, use false for a hidden command
exports.describe 	=	""
//object declaring the options the command accepts, or a function accepting and returning a yargs instance
exports.builder		=	(yargs) => {
    yargs
      .positional('dirs', {
        describe: 'dirs to look up packages (where package.json files are located)',
        default: [	process.cwd()	]
      })
}
exports.deprecated = false // a boolean (or string) to show deprecation notice.
//// a function which will be passed the parsed argv.
exports.handler = (yargs) => {

}
