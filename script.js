d3.csv("ToolsAndArmors.csv").then(data => {

    // Parse values
    data.forEach(d => {
        d.durability = +d.durability;
        d.year = +d.debutDate.substring(0, 4);
    });

    // Filter items WITH durability
    data = data.filter(d => !isNaN(d.durability));

    const width = 1100;
    const height = 650;
    const padding = 70;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // SCALES --------------------------------------------------------
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.durability)])
        .range([height - padding, padding]);

    const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.durability))
        .range([6, 26]);

    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.year))
        .interpolator(d3.interpolateTurbo);

    // GLYPH DRAWING -------------------------------------------------
    function drawGlyph(g, d) {
        const s = sizeScale(d.durability);
        const color = colorScale(d.year);

        if (d.type.toLowerCase().includes("weapon")) {
            g.append("circle")
                .attr("r", s)
                .attr("fill", color);
        }
        else if (d.type.toLowerCase().includes("tool")) {
            g.append("rect")
                .attr("x", -s)
                .attr("y", -s)
                .attr("width", s * 2)
                .attr("height", s * 2)
                .attr("fill", color);
        }
        else {
            const h = s * 1.8;
            g.append("path")
                .attr("d", `M0 ${-h} L${s} ${h} L${-s} ${h} Z`)
                .attr("fill", color);
        }
    }

    // POINTS --------------------------------------------------------
    svg.selectAll("g.item")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "item")
        .attr("transform", d => `translate(${xScale(d.year)}, ${yScale(d.durability)})`)
        .each(function(d) {
            drawGlyph(d3.select(this), d);
        })
        .on("mousemove", function (event, d) {
            tooltip.style("visibility", "visible")
                .html(`<b>${d.name}</b><br>
                       Type: ${d.type}<br>
                       Debut: ${d.year}<br>
                       Durability: ${d.durability}`)
                .style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX + 15) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // AXES ----------------------------------------------------------
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

    // AXIS LABELS
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .text("Debut Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .text("Durability");

    // LEGENDS -------------------------------------------------------

    // Shape legend
    const shapeLegend = svg.append("g")
        .attr("transform", "translate(80, 80)");

    shapeLegend.append("text")
        .attr("class", "legend-title")
        .text("Shape = Item Type");

    shapeLegend.append("circle")
        .attr("cx", 0).attr("cy", 25).attr("r", 10).attr("fill", "#999");
    shapeLegend.append("text").attr("x", 25).attr("y", 30).text("Weapon");

    shapeLegend.append("rect")
        .attr("x", -10).attr("y", 45).attr("width", 20).attr("height", 20).attr("fill", "#999");
    shapeLegend.append("text").attr("x", 25).attr("y", 60).text("Tool");

    shapeLegend.append("path")
        .attr("d", "M0 95 L10 115 L-10 115 Z")
        .attr("fill", "#999");
    shapeLegend.append("text").attr("x", 25).attr("y", 113).text("Armor");

    // Color legend (year gradient)
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "yearGradient")
        .attr("x1", "0%").attr("x2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(d3.min(data, d => d.year)));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(d3.max(data, d => d.year)));

    svg.append("rect")
        .attr("x", width - 300)
        .attr("y", 60)
        .attr("width", 200)
        .attr("height", 18)
        .style("fill", "url(#yearGradient)");

    svg.append("text")
        .attr("x", width - 305)
        .attr("y", 55)
        .attr("class", "legend-title")
        .text("Color = Debut Year");
});
