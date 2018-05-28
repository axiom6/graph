import Util from '../util/Util.js';
import Vis  from '../vis/Vis.js';
import UI   from'../ui/UI.js';
var Tree;

Tree = class Tree {
  constructor(stream, ui, d3d) {
    this.readyPane = this.readyPane.bind(this);
    this.readyView = this.readyView.bind(this);
    this.doTree = this.doTree.bind(this);
    this.nodeTo = this.nodeTo.bind(this);
    this.linkTo = this.linkTo.bind(this);
    this.stream = stream;
    this.ui = ui;
    this.d3d = d3d;
    this.ui.addContent('Tree', this);
  }

  readyPane() {
    var geo;
    geo = this.pane.geo;
    this.graph = this.d3d.createGraph(this.pane);
    this.g = this.graph.g;
    this.w = geo.w;
    this.h = geo.h;
    this.margin = 0.05;
    this.sizepc = 1 - this.margin * 2;
    this.tree = d3.tree();
    this.tree.size([this.h, this.w]);
    UI.readJSON('json/Prin.json', (data) => {
      return this.doTree(data, this.g);
    });
    return this.graph.$svg;
  }

  readyView() {
    return $("<h1 style=\" display:grid; justify-self:center; align-self:center; \">Tree</h1>");
  }

  doTree(data, g) {
    var link, node, root;
    root = d3.hierarchy(data);
    this.tree(root);
    link = this.doLinks(root, g);
    node = this.doNodes(root, g);
    this.iconNode(node);
    this.textNode(node);
    Util.noop(link);
  }

  doNodes(root, g) {
    return g.selectAll("g.node").data(root.descendants()).enter().append("svg:g").attr("class", "node").attr("transform", (d) => {
      return this.nodeTo(d);
    });
  }

  doLinks(root, g) {
    return g.selectAll("g.link").data(root.descendants().slice(1)).enter().append("svg:path").attr("class", 'link').attr("stroke", 'blue').attr("fill", "none").attr("d", (d) => {
      return this.linkTo(d);
    });
  }

  dydx(d) {
    return [d.y + this.h * this.margin, d.x + this.w * this.margin];
  }

  nodeTo(d) {
    var dx, dy;
    [dy, dx] = this.dydx(d);
    return `translate(${dy},${dx})`;
  }

  linkTo(d) {
    var dx, dy, px, py;
    [dy, dx] = this.dydx(d);
    [py, px] = this.dydx(d.parent);
    return `M${dy},${dx}C${py + 50},${dx} ${py + 50},${px} ${py},${px}`;
  }

  isEnd(d) {
    //Util.log('Tree.isEnd', d.data.name, d.depth, d.depth > 2 )
    return d.depth === 0 || d.depth > 2;
  }

  textNode(node) {
    node.append("svg:text").attr("dy", 1).attr("x", (d) => {
      if (this.isEnd(d)) {
        return 8;
      } else {
        return -10;
      }
    }).attr("y", 2).attr("stroke", 'black').attr("font-size", "1.4em").attr("font-family", "FontAwesome").attr("text-anchor", (d) => { //.
      if (this.isEnd(d)) {
        return "start";
      } else {
        return "end";
      }
    }).text(function(d) {
      return d.data.name;
    });
  }

  iconNode(node) {
    node.append("svg:text").attr("dy", 4).attr("stroke", 'black').attr("font-size", "1.4em").attr("font-family", "FontAwesome").attr("text-anchor", "middle").text((d) => {
      return this.iconUnicode(d);
    });
  }

  iconUnicode(d) {
    var icon;
    icon = d.data.icon != null ? d.data.icon : 'fas fa-circle';
    return Vis.unicode(icon);
  }

};

export default Tree;
