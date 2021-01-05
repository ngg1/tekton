import { DGraph } from "./lib"
const globby = require('globby');

let dirs = [process.cwd()];
let prefixes = ['pkg'];

(async () => {
	console.log("looking up packages under", dirs);

	const paths = await globby(dirs, {
		gitignore: true, //ignore node_modules ..etc
		deep: 12, // expand up to 12 inner paths
	    expandDirectories: {
            files: ['package.json']
        }
	});
	const G = buildGraph(paths);

	 G.print();

	let build_order = G.overallOrder();
	shorttenArr(build_order);
	//full parallelized paths
	console.log(JSON.stringify(build_order, null, 2));
	//serialied single path
	console.log(JSON.stringify(build_order.flat(), null, 2));

})();
function shorttenArr(arr) {
	for(let i = 0; i < arr.length; ++i) {
		for(let y = 0; y < arr[i].length; ++y) {
			arr[i][y] = arr[i][y].name + ":" + arr[i][y].path;
		}
	}
}

function buildGraph(paths:Array<string>):DGraph {
	console.log(paths);

	let G = new DGraph();

	paths.forEach(val => {
		let pkg = readPkg(val);

		if(isMatch(prefixes, pkg.name)) {
			G.addNode(pkg.name, val, pkg)
		};
	})
	console.log("Graph size =", G.size())
	console.log("adding edges..")

 	G.getNodes().forEach(node => {
 		console.log(node.name, ":", node.dependencies)

		Object.entries(node.dependencies).forEach(entry => {
			let [dep, ver] = entry;
			G.addEdge(dep, node);
		});
 	})
	return G;
}

function isMatch(prefixes:Array<string>, name:string) {
	return prefixes.some(p => name.startsWith(p));
}

function readPkg(path:string){
	return require(path);
}