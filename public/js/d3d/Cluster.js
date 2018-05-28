import Vis from '../vis/Vis.js';
import UI  from '../ui/UI.js';
var Cluster;

Cluster = class Cluster {
  constructor(stream, ui, d3d) {
    this.readyPane = this.readyPane.bind(this);
    this.doCluster = this.doCluster.bind(this);
    this.readyView = this.readyView.bind(this);
    this.stream = stream;
    this.ui = ui;
    this.d3d = d3d;
    this.ui.addContent('Cluster', this);
  }

  readyPane() {
    var geo;
    geo = this.pane.geo;
    this.graph = this.d3d.createGraph(this.pane);
    this.g = this.graph.g;
    this.w = geo.w;
    this.h = geo.h;
    this.tree = d3.cluster();
    this.tree.size([this.h * 0.6, this.w * 0.75]);
    UI.readJSON('json/Prin.json', (data) => {
      return this.doCluster(data, this.g);
    });
    return this.graph.$svg;
  }

  doCluster(data, g) {
    this.root = d3.hierarchy(data);
    this.tree(this.root);
    //@sort( @root )
    this.tree(this.root);
    this.doLink();
    this.doNode();
  }

  readyView() {
    return $("<h1 style=\" display:grid; justify-self:center; align-self:center; \">Cluster</h1>");
  }

  sort(root) {
    root.sort(function(a, b) {
      return (a.height - b.height) || a.id.localeCompare(b.id);
    });
  }

  doLink() {
    var link;
    return link = this.g.selectAll(".link").data(this.root.descendants().slice(1)).enter().append("path").attr("class", "link").attr("d", (d) => {
      return this.moveTo(d);
    });
  }

  moveTo(d) {
    var p;
    p = d.parent;
    return `M${d.y},${d.x}C${p.y + 100},${d.x} ${p.y + 100},${p.x} ${p.y},${p.x}`;
  }

  doNode() {
    var node;
    node = this.g.selectAll(".node").data(this.root.descendants()).enter().append("g").attr("class", function(d) {
      var ref;
      return "node" + ((ref = d.children) != null ? ref : {
        " node--internal": " node--leaf"
      });
    }).attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
    node.append("circle").attr("r", 5.0);
    return node.append("svg:text").attr("dy", 3).attr("x", function(d) {
      if (d.children != null) {
        return -8;
      } else {
        return 8;
      }
    }).attr("y", 3).text(function(d) {
      return d.name;
    }).attr("stroke", "yellow").style("text-anchor", function(d) {
      if (d.children != null) {
        return "end";
      } else {
        return "start";
      }
    });
  }

};

//text(                (d) -> d.name.substring(d.name.lastIndexOf(".") + 1) )
export default Cluster;
