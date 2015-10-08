/**
 * Created by berniem on 10/5/15.
 */
require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunk.util",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/headerview",
    "splunkjs/mvc/footerview",
    "splunkjs/mvc/simplexml/dashboardview",
    "splunkjs/mvc/simplexml/dashboard/panelref",
    "splunkjs/mvc/simplexml/element/chart",
    "splunkjs/mvc/simplexml/element/event",
    "splunkjs/mvc/simplexml/element/html",
    "splunkjs/mvc/simplexml/element/list",
    "splunkjs/mvc/simplexml/element/map",
    "splunkjs/mvc/simplexml/element/single",
    "splunkjs/mvc/simplexml/element/table",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/textinputview",
    "splunkjs/mvc/radiogroupview",
    "splunkjs/mvc/multidropdownview",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/simplexml/urltokenmodel"
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/checkboxview"
  ],
  function(
    mvc,
    utils,
    TokenUtils,
    _,
    $,
    SplunkUtil,
    DashboardController,
    HeaderView,
    FooterView,
    Dashboard,
    PanelRef,
    ChartElement,
    EventElement,
    HtmlElement,
    ListElement,
    MapElement,
    SingleElement,
    TableElement,
    FormUtils,
    EventHandler,
    DropdownInput,
    RadioGroupInput,
    MultiSelectInput,
    CheckboxGroupInput,
    TextInput,
    TimeRangeInput,
    SubmitButton,
    SearchBarView,
    TableView,
    TextInputView,
    RadioGroupView,
    MultiDropdownView,
    SearchManager) {
    (function() {

      var app = DashboardController.model.app.get('app')
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = SplunkUtil.make_url('/static/app/'+ app +'/components/d3/d3.js');
      document.getElementsByTagName("head")[0].appendChild(script);
      var endpoint = $("#ctree").data();
      var host = "http://" + endpoint.host + ":" + endpoint.port  + "/en-US/custom/"  || "../../"

      // get multiselect instance
      var multiSelect = mvc.Components.getInstance("multi");

      // Populates Mulitselect with App on Deployment server
      $.get("http://localhost:8000/en-US/custom/" + app + "/configmodel", function(data, status) {
        var appList = JSON.parse(data);
        var choices = _.map(appList, function(app){return {label: app, value: app}});
        multiSelect.settings.set("choices", choices)
      });

      // on change/ update of multiselect query api for merged config
      multiSelect.on("change", function(){
        var apps = {'data': this.settings.get("value")};
        $.post(host + app + "/configmodel", apps ,function(data){
          var configs = JSON.parse(data);
          var margin = {top: 10, right: 20, bottom: 30, left: 20};
          var width = 960 - margin.left - margin.right
          var barHeight = 20;
          var barWidth = width * .8;
          var i = 0;
          var duration = 400;
          var root;

          mergedconf = {name: "configs", children: []}
          for (var key in configs) {
            var F = {name: key, children: []}
            for (var stanza in configs[key]) {
              var S = {name: "[" + stanza + "]", children: []}
              for (var set in configs[key][stanza]){
                var setting;
                setting = {name: set + " = " + configs[key][stanza][set], size: Math.round(999 * Math.random())};
                S.children.push(setting);
              }
              F.children.push(S);
            }
            mergedconf.children.push(F);
          }
          var tree = d3.layout.tree()
            .nodeSize([0, 20]);

          var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });
          var svg = d3.select("#ctree").append("svg")
            .attr("width", width + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          mergedconf.x0 = 0;
          mergedconf.y0 = 0;
          update(root = mergedconf);

          function update(source) {
            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            var nodes = tree.nodes(root);
            var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

            d3.select("#ctree svg").transition()
              .duration(duration)
              .attr("height", height);

            d3.select(self.frameElement).transition()
              .duration(duration)
              .style("height", height + "px");

            // Compute the "layout".
            nodes.forEach(function(n, i) {
              n.x = i * barHeight;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

            var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .style("opacity", 1e-6);

            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
              .attr("y", -barHeight / 2)
              .attr("height", barHeight)
              .attr("width", barWidth)
              .style("fill", color)
              .on("click", click);

            nodeEnter.append("text")
              .attr("dy", 3.5)
              .attr("dx", 5.5)
              .text(function(d) { return d.name; });

            // Transition nodes to their new position.
            nodeEnter.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .style("opacity", 1);

            node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .style("opacity", 1)
              .select("rect")
              .style("fill", color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .style("opacity", 1e-6)
              .remove();

            // Update the links…
            var link = svg.selectAll("path.link")
              .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              })
              .transition()
              .duration(duration)
              .attr("d", diagonal);

            // Transition links to their new position.
            link.transition()
              .duration(duration)
              .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }

          // Toggle children on click.
          function click(d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          }

          function color(d) {
            return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
          }

        });

      });

    })();
  });