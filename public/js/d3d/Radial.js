import Util from '../util/Util.js';
import Vis  from '../vis/Vis.js';
import UI   from'../ui/UI.js';
var Radial;

Radial = class Radial {
  constructor(stream, ui, d3d) {
    this.readyPane = this.readyPane.bind(this);
    this.readyView = this.readyView.bind(this);
    this.doRadial = this.doRadial.bind(this);
    this.doLinks = this.doLinks.bind(this);
    this.doNodes = this.doNodes.bind(this);
    this.moveTo = this.moveTo.bind(this);
    this.project = this.project.bind(this);
    this.nodeClass = this.nodeClass.bind(this);
    this.iconNode = this.iconNode.bind(this);
    this.textNode = this.textNode.bind(this);
    this.isEnd180 = this.isEnd180.bind(this);
    this.isEnd = this.isEnd.bind(this);
    this.iconUnicode = this.iconUnicode.bind(this);
    this.stream = stream;
    this.ui = ui;
    this.d3d = d3d;
    this.ui.addContent('Radial', this);
  }

  readyPane() {
    var geo;
    geo = this.pane.geo;
    this.graph = this.d3d.createGraph(this.pane);
    this.g = this.graph.g;
    this.w = geo.w;
    this.h = geo.h;
    this.r = Math.min(this.w / 2, this.h / 2) * 0.9;
    this.tree = d3.tree();
    this.tree.size([
      this.r,
      this.r // size([@w,@h])
    ]);
    this.tree.separation((a, b) => {
      return (a.parent === b.parent ? 5 : 10) / a.depth;
    });
    this.g.attr("transform", "translate(" + this.w * 0.5 + "," + this.h * 0.5 + ")");
    UI.readJSON('json/Prin.json', (data) => {
      return this.doRadial(data, this.g);
    });
    return this.graph.$svg;
  }

  readyView() {
    return $("<h1 style=\" display:grid; justify-self:center; align-self:center; \">Radial</h1>");
  }

  doRadial(data, g) {
    var link, node, root;
    root = d3.hierarchy(data);
    this.tree(root);
    link = this.doLinks(root, g);
    node = this.doNodes(root, g);
    //node.append("svg:circle").attr("r",4.5)
    //iconNode( node ) # Clutters up overview
    this.textNode(node);
    Util.noop(link);
  }

  doLinks(root, g) {
    return g.selectAll(".link").data(root.descendants().slice(1)).enter().append("svg:path").attr("class", "link").attr("stroke", 'blue').attr("fill", "none").attr("d", (d) => {
      return this.moveTo(d);
    });
  }

  doNodes(root, g) {
    return g.selectAll("g.node").data(root.descendants()).enter().append("svg:g").attr("class", (d) => {
      return this.nodeClass(d);
    }).attr("transform", (d) => {
      return "translate(" + this.project(d.x, d.y) + ")";
    });
  }

  moveTo(d) {
    var p;
    p = d.parent;
    return `M${this.project(d.x, d.y)}C${this.project(d.x, (d.y + p.y) / 2)} ${this.project(p.x, (d.y + p.y) / 2)} ${this.project(p.x, p.y)}`;
  }

  project(x, y) {
    var angle, radius;
    angle = (x - 90) / 180 * Math.PI;
    radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  }

  nodeClass(d) {
    if (d.children != null) {
      return "node--internal";
    } else {
      return "node--leaf";
    }
  }

  iconNode(node) {
    node.append("svg:text").attr("dy", 4).attr("stroke", 'black').attr("font-size", "1.4em").attr("font-family", "FontAwesome").attr("text-anchor", "middle").text((d) => {
      return this.iconUnicode(d);
    });
  }

  textNode(node) {
    node.append("svg:text").attr("dy", ".31em").attr("y", 2).attr("x", (d) => {
      if (this.isEnd180(d)) {
        return 6;
      } else {
        return -6;
      }
    }).attr("text-anchor", (d) => {
      if (this.isEnd180(d)) {
        return "end";
      } else {
        return "start";
      }
    }).attr("transform", (d) => {
      return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
    //attr("font-size","1.0em")
    }).attr("stroke", 'black').attr("font-family", "FontAwesome").text(function(d) {
      return d.data.name;
    });
  }

  isEnd180(d) {
    return d.x > 180;
  }

  isEnd(d) {
    return !((d.children != null) && d.children.length > 0);
  }

  iconUnicode(d) {
    var icon;
    icon = d.data.icon != null ? d.data.icon : 'fas fa-circle';
    return Vis.unicode(icon);
  }

};

export default Radial;
