import { Queue } from "./";
import { Logger, safeArrayFrom } from "./utils";

export class DGraph {
  private _nodes: Map<string, Node> = new Map();
  private _inEdges: Map<Node, Set<Node>> = new Map();
  private _outEdges: Map<Node, Set<Node>> = new Map();
  private _eCnt = 0;
  private loggy = Logger();

  static clone(graph: DGraph) {
    return Object.assign(Object.create(Object.getPrototypeOf(graph)), graph);
  }
  /**
   * [addNode description]
   * @param  {string} name [description]
   * @param  {string} path [description]
   * @param  {Object} data [description]
   * @return {Node}        [description]
   */
  public addNode(name: string, path: string, data?: Object): Node {
    if (this.hasNode(name)) {
      throw new GraphError(
        `possible duplicate node \`${name}\` @ ${path} & ${
          this.getNode(name).path
        }`
      );
    }

    let newNode = new Node(name, path, data);
    this.loggy.debug("adding", newNode.name);
    this._nodes.set(name, newNode);
    this._inEdges.set(newNode, new Set<Node>());
    this._outEdges.set(newNode, new Set<Node>());

    return newNode;
  }
  private _name(node: Node | string) {
    return node instanceof Node ? node.name : node;
  }
  /**
   * [removeNode description]
   * @param {string} name [description]
   */
  public removeNode(name: string) {}

  /**
   * [hasNode description]
   * @param  {string}  name [description]
   * @return {boolean}      [description]
   */
  public hasNode(node: Node | string): boolean {
    return this._nodes.has(this._name(node));
  }

  /**
   * [getNode description]
   * @param  {string} name [description]
   * @return {Node}        [description]
   */
  public getNode(n: Node | string): Node {
    let node = this._nodes.get(this._name(n));

    if (node === undefined) {
      throw new GraphError(`missing node named ${this._name(n)}`);
    }

    return node;
  }
  /**
   * [getNodes description]
   * @return {Array<Node>} [description]
   */
  public getNodes(): Array<Node> {
    return Array.from(this._nodes.values());
  }

  public size(): number {
    return this._nodes.size;
  }
  public edgeCount(): number {
    return this._eCnt;
  }
  /**
   * [addDependency description]
   * @param {[type]} from [description]
   * @param {[type]} to   [description]
   *from http://www.cs.columbia.edu/~sedwards/classes/2019/4995-fall/proposals/topo-sort.pdf
   * A --> B ... means "B" depends on "A" because b must come after a is completed or visited..
   *
   * ..however according to https://en.wikipedia.org/wiki/Dependency_graph the arrow is reversed ..
   *
   * ..we assumming the first def above okay!..
   */
  addEdge(from: Node | string, to: Node | string): boolean {
    let fromNode: Node = this.getNode(from);
    let toNode: Node = this.getNode(to);

    if (fromNode === toNode) {
      throw new GraphError(`cannot add loopback edge at ${toNode.name}`);
    }
    this.loggy.debug("Add edge ", fromNode.name, "->", toNode.name);

    let dst = this._inEdges.get(toNode);
    let org = this._outEdges.get(fromNode);

    if (!org || !dst) throw new GraphError("missing nodes");

    var inn = org.add(toNode) !== undefined;
    var out = dst.add(fromNode) !== undefined;

    //either add both
    if (inn && out) {
      ++this._eCnt;
      return true;
    }
    //or roll back
    org.delete(toNode);
    dst.delete(fromNode);
    return false;
  }
  /**
   * [removeEdge description]
   * @param {Node | string} from [description]
   * @param {Node | string} to   [description]
   */
  removeEdge(from: Node | string, to: Node | string) {
    let fromNode: Node = this.getNode(from);
    let toNode: Node = this.getNode(to);

    this.loggy.debug("Remove edge ", fromNode.name, "->", toNode.name);

    let dst = this._inEdges.get(toNode);
    let org = this._outEdges.get(fromNode);

    if (!org || !dst) throw new GraphError("missing nodes");

    var inn = org.delete(toNode) !== undefined;
    var out = dst.delete(fromNode) !== undefined;
    //either remove both
    if (inn && out) {
      --this._eCnt;
      return true;
    }
    //or roll back
    org.add(toNode);
    dst.add(fromNode);
    return false;
  }

  dependenciesOf(node: Node | string, opts: {} = {}) {
    let mod = this.getNode(node);

    return safeArrayFrom(this._inEdges.get(mod));
  }
  dependantsOf(node: Node | string, opts: {} = {}) {
    let mod = this.getNode(node);

    return safeArrayFrom(this._outEdges.get(mod));
  }
  /**
   * [overallOrder description]
   * @param {[type]} leavesOnly=false [description]
   */
  overallOrder(opts: {} = {}): Array<Node>[] {
    let seen = new Set();
    let Q = new Queue();
    let nCnt = 0;
    let top_orders: Array<Node>[] = [];
    function _visit(node: Node) {
      ++nCnt;
      seen.add(node);
      Q.enqueue(node);
    }
    //looking for rootss
    this._inEdges.forEach((deps, node) => {
      if (deps.size === 0 && !seen.has(node)) {
        _visit(node);
      }
    });
    // all valid deps tree are DAG
    if (Q.isEmpty()) throw new GraphError("graph is empty!");

    this._bfs(seen, Q, _visit, top_orders);

    if (nCnt !== this.size() || this.edgeCount() !== 0) {
      throw new GraphError("graph has at least one cycle!", {
        info: "https://en.wikipedia.org/wiki/Topological_sorting",
      });
    }
    return top_orders;
  }
  //
  private _bfs(seen, Q, _visit, top_orders) {
    let currNode;
    let curr_order: Node[] = [];
    while (!Q.isEmpty()) {
      curr_order = [];
      const batchSize = Q.size;
      for (let i = 0; i < batchSize; i++) {
        currNode = Q.dequeue();
        curr_order.push(currNode);
        //visiting
        //get all the edges this going out to
        let nexts: Set<Node> | undefined = this._outEdges.get(currNode);
        if (nexts === undefined) continue;

        nexts.forEach((nextNode) => {
          this.removeEdge(currNode, nextNode);
          if (seen.has(nextNode)) return;

          let nextIns: Set<Node> | undefined = this._inEdges.get(nextNode);

          if (nextIns === undefined || nextIns.size === 0) {
            _visit(nextNode);
          }
        });
      }

      top_orders.push(curr_order);
    }
  }
  /**
   * [print description]
   */
  public print() {
    // Logging to console
    this.loggy.debug("In edges:");
    this._printEdges(this._inEdges);
    this.loggy.debug("Out edges:");
    this._printEdges(this._outEdges);
  }

  private _printEdges(edges: Map<Node, Set<Node>>) {
    edges.forEach((requires, key) => {
      let dep: string[] = [];
      requires.forEach((x) => {
        dep.push(x.name);
      });
      this.loggy.debug("...", key.name, ":", dep.join(", "));
    });
  }
}

class GraphError extends Error {
  meta: Object;
  constructor(msg, meta = {}) {
    super(msg);

    Error.captureStackTrace(this, GraphError);

    let proto = Object.getPrototypeOf(this);
    proto.name = "GraphError";

    this.meta = meta;
  }
  toString() {
    return `${super.toString()} ${JSON.stringify(this.meta)}`;
  }
}

class Package {
  name: string;
  author: string = "";
  version: string = "";
  dependencies: Object = {};
  devDependencies: Object = {};
  description: string = "";
  constructor(name: string) {
    this.name = name;
  }
}

class Node extends Package {
  path: string;

  constructor(name: string, path: string, data?: Object) {
    super(name);
    this.path = path;
    Object.assign(this, data);
  }
}
