d3.csv("ToolsAndArmors.csv").then(data => {

    // Parse and clean
    data.forEach(d => {
        d.year = +d.debutDate.substring(0, 4);
        d.durability = +d.durability;
    });

    // Keep only items with durability
    data = data.filter(d => !isNaN(d.durability));

    // SVG setup
    const width = 1200;
    const height = 700;
    const padding = 90;

    const svg = d3.select("#chart")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, width - padding - 20]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.durability)])
        .range([height - padding, padding]);

    const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.durability))
        .range([5, 25]);

    const colorScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range(["#89CFF0", "#003f5c"]);

    // GRIDLINES ----------------------------------------------------
    const xAxisGrid = d3.axisBottom(xScale)
        .tickSize(-(height - padding * 2))
        .tickFormat("");

    const yAxisGrid = d3.axisLeft(yScale)
        .tickSize(-(width - padding * 2))
        .tickFormat("");

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxisGrid);

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxisGrid);

    // AXES ---------------------------------------------------------
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 35)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Debut Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Durability");

    // GLYPH DRAW ---------------------------------------------------
    function drawGlyph(g, d) {
    const size = sizeScale(d.durability);
    const color = colorScale(d.year);
    const type = d.type.toLowerCase();

    let path = "";

    // Choose actual Minecraft-like silhouettes
    if (type.includes("weapon")) {
        path = "M0 -15 L3 -5 L1 -5 L1 15 L-1 15 L-1 -5 L-3 -5 Z"; // sword
    }
    else if (type.includes("tool")) {
        path = "M0 -18 L3 -15 L-5 -7 L-3 -5 L2 -10 L5 -7 L-3 2 L-1 4 L0 3 L1 4 L3 2 L-5 -7 L-3 -9 Z"; // pickaxe
    }
    else if (type.includes("armor")) {
        path = "M-10 -15 L10 -15 L12 -5 L8 15 L-8 15 L-12 -5 Z"; // chestplate
    }
    else {
        // fallback icon
        path = "M0 -12 L12 0 L0 12 L-12 0 Z";
    }

    // Draw the outlined glyph
    g.append("path")
        .attr("d", path)
        .attr("fill", color)
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5)
        .attr("transform", `scale(${size / 10})`);
}


    // POINTS -------------------------------------------------------
    svg.selectAll("g.point")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "point")
        .attr("transform", d => `translate(${xScale(d.year)}, ${yScale(d.durability)})`)
        .each(function(d) { drawGlyph(d3.select(this), d); })
        .on("mousemove", (event, d) => {
            tooltip.style("visibility", "visible")
                .html(`
                    <b>${d.name}</b><br>
                    Type: ${d.type}<br>
                    Debut: ${d.year}<br>
                    Durability: ${d.durability}
                `)
                .style("top", (event.pageY - 50) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // LEGEND -------------------------------------------------------
    const legend = svg.append("g")
        .attr("transform", "translate(1000, 120)");

    legend.append("text")
        .attr("class", "legend-title")
        .text("Glyph Shape = Type");

    // Weapon
    legend.append("circle")
        .attr("cx", 0).attr("cy", 25).attr("r", 10).attr("fill", "#777");
    legend.append("text").attr("x", 25).attr("y", 30).text("Weapon");

    // Tool
    legend.append("rect")
        .attr("x", -10).attr("y", 45).attr("width", 20).attr("height", 20)
        .attr("fill", "#777");
    legend.append("text").attr("x", 25).attr("y", 60).text("Tool");

    // Armor
    legend.append("path")
        .attr("d", "M0 90 L10 110 L-10 110 Z")
        .attr("fill", "#777");
    legend.append("text").attr("x", 25).attr("y", 107).text("Armor");

});
