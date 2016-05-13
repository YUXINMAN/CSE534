queue()
    .defer(d3.json, "/conn")
    .await(makeGraphs);
var global_conn;
var var_name = ['spdy_kity', 'http_kity', 'spdy_stopwatch', 'http_stopwatch', 'spdy_index', 'http_index', 'spdy_oneImage', 'http_oneImage','spdy_google','http_google'];
function makeGraphs(error, JsonData) {
	

    global_conn = JsonData;
    console.log(global_conn)
    drawForceDirected(JsonData[0], var_name,0);
    drawForceDirected(JsonData[1], var_name,1);
	//Create a Crossfilter instance
};

function ForceButtonHandler(idx){

    d3.selectAll("svg").remove();
    drawForceDirected(global_conn[idx*2],var_name, 0);
    drawForceDirected(global_conn[idx*2 + 1],var_name, 1);

}

function drawForceDirected(data_input, var_name, num){
    var width = 600;
    var height = 500;
    var PORTS = {};
    var data = data_input;


    var nodes = new Array();
    nodes.push({name:"",port:-1});
    var edges = new Array();
    for (var i = 0; i < data.length; i++){
        nodes.push({name: data[i]["id"],port:data[i]["port"]});
        var src_idx = nodes.length - 1;
        if (PORTS[data[i]["port"]] == null){
            nodes.push({name:data[i]["port"],port:data[i]["port"]});
            PORTS[data[i]["port"]] = nodes.length - 1;
            edges.push({source:0,target:nodes.length - 1})
        }
        var dst_idx = PORTS[data[i]["port"]];
        edges.push({source : src_idx , target : dst_idx});
    }

    var colors = d3.scale.category20();
    if (num == 0){
        var svg = d3.select("#force_spdy").append("svg")
            .attr("width", width)
            .attr("height", height);
    } else {
        var svg = d3.select("#force_http").append("svg")
            .attr("width", width)
            .attr("height", height);
    }

    var force = d3.layout.force()
      .nodes(nodes)
      .links(edges)
      .size([width,height])
      .linkDistance(80)
      .charge([-120])
      .start();
    var force_edges = svg.selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("stroke","#ccc")
        .style("stoke-width", 1);
    var domain = Object.keys(PORTS);
    domain.push(-1);
    colors.domain(domain);
    var force_nodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r",10)
        .style("fill",function(d, i){
            return colors(d.port);
        })
        .call(force.drag)
    var force_texts = svg.selectAll("text")
     .data(nodes)
     .enter()
     .append("text")
     .style("fill", "black")
     .attr("dx", 10)
     .attr("dy", 8)
     .text(function(d){
        return d.name;
     });

    force.on("tick", function(){
        force_edges.attr("x1",function(d){ return d.source.x; })
            .attr("y1",function(d){ return d.source.y; })
            .attr("x2",function(d){ return d.target.x; })
            .attr("y2",function(d){ return d.target.y; });

        force_nodes.attr("cx",function(d){ return d.x; })
            .attr("cy",function(d){ return d.y; });

        force_texts.attr("x", function(d){ return d.x; })
           .attr("y", function(d){ return d.y; });
     });

}