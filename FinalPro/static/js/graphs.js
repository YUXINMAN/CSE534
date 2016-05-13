queue()
    .defer(d3.json, "/plt")
    .defer(d3.json, "/tput")
    .defer(d3.json, "/pnum")
    .defer(d3.json, "/ppro")
    .await(makeGraphs);
var global_pktportion;

function makeGraphs(error, PLTJson, TPutJson, PNumJson, PProJson) {


	var PLT = PLTJson;
	var tput = TPutJson;
	var pnum = PNumJson;
	var ppro = PProJson;
	global_pktportion = ppro;

	console.log(PLT);
    console.log(tput);
    console.log(pnum);

    var_name = ['kity','stopwatch','index','oneImage','google'];
    var_name2 = ['kity-spdy','kity-http','stopwatch-spdy','stopwatch-http','index-spdy','index-http','oneImage-spdy','oneImage-http','google-spdy','google-http'];

	d3.select("#ws1")
		.on("click", function(){
		    d3.selectAll("svg").remove();
		    d3.selectAll(".pbutton").remove();
			dataset = PLT;
			drawBar(dataset,var_name,'Page Load Time');
		});
	d3.select("#ws2")
		.on("click", function(){
		    d3.selectAll("svg").remove();
		    d3.selectAll(".pbutton").remove();
			dataset = tput;
			drawBar(dataset,var_name,'ThroughPut');
		});
	d3.select("#ws3")
		.on("click", function(){
			d3.selectAll("svg").remove();
			d3.selectAll(".pbutton").remove();
			dataset = pnum;
			drawBar(dataset,var_name,'Packets Number');
		});
	d3.select("#ws4")
		.on("click", function(){
			d3.selectAll("svg").remove();
			d3.selectAll(".pbutton").remove();
			dataset = PProJson;
			drawPie(dataset,var_name2,0,'Packets Proportion');

		});
};

function buttonHandler(idx){
    drawPie(global_pktportion,var_name2,idx);

}

function drawBar(data_input,var_name,varia){
    //size of svg
    var width = 600;
    var height = 500;
    var data = data_input;

    d3.select("#barnote").html("Bar Chart for -- " + varia);

    var rectPadding = 2;
    var catePadding = 20;
    var padding = {left:48, right:40, top:30, bottom:30};

    var bin_width = (width - padding.left - padding.right - (data.length / 2 - 1) * catePadding - data.length / 2 * rectPadding) / data.length;
    var x_val = (width - padding.left - padding.right)/data.length - bin_width;
    console.log("**********************");
    console.log(data.length);
    console.log(bin_width);
    console.log("**********************");
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    var xScale = d3.scale.ordinal()
        .domain(var_name)
        //.domain(d3.range(data.length + 1).map(function(d){return Math.round((data.min + d*bin_width) * 100) / 100;}))
        .rangeRoundBands([0, width - padding.left - padding.right]);

    var yScale = d3.scale.linear()
        .domain([0,d3.max(data)])
        .range([height - padding.top - padding.bottom, 0]);

    //define axises
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //add bins
    svg.selectAll("text")
        .data([1])
        .enter()
        .append("text")
        .attr("class","bin-value")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")");
    var rects = svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .style("fill",function(d,i){
                if (i < data.length / 2){
                    return "steelblue";// + rectPadding/2;
                } else {
                    return "grey";
                }
            })
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                if (i < data.length / 2){
                    return xScale.range()[i] + x_val;// + rectPadding/2;
                } else {
                    return xScale.range()[i - data.length / 2]+bin_width+rectPadding + x_val;
                }
            } )
            .attr("y",function(d){
                return yScale(d);
            })
            .attr("width", (xScale.range()[1] - xScale.range()[0] - rectPadding - catePadding) / 2)
            .attr("height", function(d){
                return height - padding.top - padding.bottom - yScale(d);
            })
            .on("mouseover",function(d, i){
                d3.select(this)
                    .attr("height", function(d){
                        return height - padding.top - padding.bottom - yScale(d) + 4;
                    })
                    .attr("y", function(d){
                        return yScale(d) - 4;
                    })
                    .attr("width", (xScale.range()[1] - xScale.range()[0] - rectPadding - catePadding) / 2 + 4)
                    .attr("x", function(d){
                        if (i < data.length / 2){
                            return xScale.range()[i] + x_val ;// + rectPadding/2;
                        } else {
                            return xScale.range()[i - data.length / 2] +bin_width+rectPadding + x_val;
                        }
                    })
                    .style("fill", "orange");
                svg.selectAll(".bin-value")
                    .data([d])
                    .attr("x", function(){
                        if (i < data.length / 2){
                            if (varia == 'ThroughPut') {
                                return xScale.range()[i] - bin_width;// + rectPadding/2;
                            } else {
                                return xScale.range()[i] - bin_width/2;
                            }
                        } else {
                            if (varia == 'ThroughPut') {
                                return xScale.range()[i - data.length / 2] + rectPadding + x_val;
                            } else {
                                return xScale.range()[i - data.length / 2] + rectPadding + bin_width/2;
                            }
                        }
                    } )
                    .attr("y",function(d1){
                        return yScale(d1) - 26;
                    })
                    .attr("dx",function(){
                        return (xScale.range()[1] - xScale.range()[0] - rectPadding - catePadding) / 2;
                    })
                    .attr("dy",function(){
                        return 20;
                    })
                    .text(function(d1){
                        if (varia == 'Packets Number') {
                            return d1;
                        } else {
                            return d1.toFixed(2);
                        }
                    });

            })
            .on("mouseout", function(d, i){
                d3.select(this)
                    .attr("height", function(d){
                        return height - padding.top - padding.bottom - yScale(d);
                    })
                    .attr("y", function(d){
                        return yScale(d);
                    })
                    .attr("width", (xScale.range()[1] - xScale.range()[0] - rectPadding - catePadding) / 2)
                    .attr("x", function(d){
                        if (i < data.length / 2){
                            return xScale.range()[i] + x_val;// + rectPadding/2;
                        } else {
                            return xScale.range()[i - data.length / 2]+bin_width+rectPadding + x_val;
                        }
                    })
                    .transition()
                    .duration(500)
                    .style("fill", function(){
                        if (i < data.length / 2){
                            return "steelblue";// + rectPadding/2;
                        } else {
                            return "grey";
                        }
                    });
                svg.select(".bin-value").text("");
            });

    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
        .call(xAxis);
        //.append('text')
        //.text('dim');

    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);
};

function drawPie(data_input,var_name,idx,varia){
    //size of svg
    var width = 600;
    var height = 500;
    var data = data_input[idx];
    d3.select("svg").remove();
    d3.selectAll(".pbutton").remove();
    d3.select("#barnote").html("Pie Chart for -- " + var_name[idx]);
    for (var i = 0; i < var_name.length; i++){
        var button = d3.select("#chart").append("button")
                        .html(var_name[i])
                        .attr("onclick","buttonHandler("+i+")").attr("class", "pbutton");
    }
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var padding = {left:40, right:40, top:30, bottom:30};

    var pie = d3.layout.pie();
    var piedata = pie(data);

    var outerRadius = 150;
    var innerRadius = 0;

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var arcs = svg.selectAll("g")
        .data(piedata)
        .enter()
        .append("g")
        .attr("transform","translate("+ (width/2) +","+ (height/2) +")");


    var color = d3.scale.category20();
    console.log(color.range());
    var domain = ["bbb", "ddd", "ccc", "23", "hello"];
    color.domain(domain);
    arcs.append("path")
        .attr("fill",function(d,i){
            return color(domain[(i+1)*2-1]);
        })
        .attr("d",function(d){
            return arc(d);
        });

    arcs.append("text")
        .attr("transform",function(d){
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor","middle")
        .text(function(d){
            return d.value;
        });

    var tooltip = d3.select("body")
        .append("div")
        .style("position","absolute")
        .style("opacity",0.0)
        .style("background-color","white")
        .style("border-radius", "5px")
        .style("border-width", "1px")
        .style("border-style", "solid");

    arcs.on("mouseover",function(d, i){
        console.log("i:" + i);
        if (i == 0){
            tooltip.html("category: ctrl " + var_name[idx] + "<br/> value:" + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
        } else {
            tooltip.html("category: data " + var_name[idx] + "<br/> value:" + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
        }
        d3.select(this)
            .transition()
            .duration(500)
            .attr("transform",function(d){
                return "translate(" + [arc.centroid(d)[0] / 5 + width / 2, arc.centroid(d)[1] / 5 + height / 2] + ")";
            });
    })
    .on("mousemove",function(d){
        tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 20) + "px");
    })
    .on("mouseout",function(d){
        tooltip.style("opacity",0.0);
        d3.select(this)
            .transition()
            .duration(500)
            .attr("transform",function(d){
                return "translate(" + [width / 2, height / 2] + ")";
            });
    })
}