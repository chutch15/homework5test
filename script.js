d3.csv("ToolsAndArmors.csv").then(data => {

    // Parse + sanitize
    data.forEach(d => {
        d.year = +d.debutDate.substring(0, 4);
        d.durability = +d.durability;
    });

    data = data.filter(d => !isNaN(d.durability));

    const width = 1200;
    const height = 700;
    const padding = 90;

    const svg = d3.select("#chart")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // --------------------- SCALES ---------------------
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([padding, width - padding - 20]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.durability)])
        .range([height - padding, padding]);

    // --------------------- GRIDLINES ---------------------
    const xGrid = d3.axisBottom(xScale)
        .tickSize(-(height - padding * 2))
        .tickFormat("");

    const yGrid = d3.axisLeft(yScale)
        .tickSize(-(width - padding * 2))
        .tickFormat("");

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xGrid);

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yGrid);

    // --------------------- AXES ---------------------
    svg.append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 35)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Debut Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Durability");

    // --------------------- CUSTOM GLYPH DRAWER ---------------------
    function drawGlyph(g, d) {
        const size = 14;
        const type = d.type.toLowerCase();

        if (type.includes("weapon")) {
            g.append("rect")
                .attr("x", -size)
                .attr("y", -size)
                .attr("width", size * 2)
                .attr("height", size * 2)
                .attr("fill", "#d9534f")
                .attr("stroke", "#222")
                .attr("stroke-width", 1.5);
        }
        else if (type.includes("tool")) {
            g.append("circle")
                .attr("r", size)
                .attr("fill", "#5cb85c")
                .attr("stroke", "#222")
                .attr("stroke-width", 1.5);
        }
        else if (type.includes("armor")) {
            const chest = "M-10 -15 L10 -15 L12 -5 L8 15 L-8 15 L-12 -5 Z";
            g.append("path")
                .attr("d", chest)
                .attr("fill", "#0275d8")
                .attr("stroke", "#222")
                .attr("stroke-width", 1.5)
                .attr("transform", `scale(${size / 10})`);
        }
    }

    // --------------------- PLOTTING ---------------------
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

    // --------------------- LEGEND ---------------------
    const legend = svg.append("g")
        .attr("transform", "translate(1000, 160)");

    legend.append("text")
        .attr("class", "legend-title")
        .text("Glyph = Item Type");

    // Weapon square
    legend.append("rect")
        .attr("x", -10).attr("y", 25)
        .attr("width", 20).attr("height", 20)
        .attr("fill", "#d9534f")
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5);
    legend.append("text")
        .attr("x", 25)
        .attr("y", 40)
        .text("Weapon");

    // Tool circle
    legend.append("circle")
        .attr("cx", 0).attr("cy", 70)
        .attr("r", 10)
        .attr("fill", "#5cb85c")
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5);
    legend.append("text")
        .attr("x", 25)
        .attr("y", 75)
        .text("Tool");

    // Armor chestplate
    legend.append("path")
        .attr("d", "M-10 -15 L10 -15 L12 -5 L8 15 L-8 15 L-12 -5 Z")
        .attr("transform", "translate(0,125)")
        .attr("fill", "#0275d8")
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5);
    legend.append("text")
        .attr("x", 25)
        .attr("y", 130)
        .text("Armor");

});
 
