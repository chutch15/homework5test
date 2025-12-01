// Load the CSV file
d3.csv("ToolsAndArmors.csv").then(data => {

    // Parse data
    data.forEach(d => {
        d.durability = +d.durability;
        d.year = +d.debutDate.substring(0,4); // Extract year
    });

    // Filter items with a durability value (some tools have NaN)
    data = data.filter(d => !isNaN(d.durability));

    const width = 1000;
    const height = 700;
    const cols = 12;               // number of items per row
    const cellSize = 80;           // spacing grid
    const padding = 40;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Color scale by debut year
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.year))
        .interpolator(d3.interpolateViridis);

    // Size scale by durability
    const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.durability))
        .range([6, 28]);

    // Shapes per type
    function drawGlyph(g, d) {
        const size = sizeScale(d.durability);
        const color = colorScale(d.year);
        const type = d.type.toLowerCase();

        if (type.includes("weapon")) {
            // Circle
            g.append("circle")
                .attr("r", size)
                .attr("fill", color);
        } 
        else if (type.includes("tool")) {
            // Square
            g.append("rect")
                .attr("x", -size)
                .attr("y", -size)
                .attr("width", size * 2)
                .attr("height", size * 2)
                .attr("fill", color);
        }
        else {
            // Triangle (armor)
            const h = size * 1.8;
            g.append("path")
                .attr("d", `M0 ${-h} L${size} ${h} L${-size} ${h} Z`)
                .attr("fill", color);
        }

        // Text label
        g.append("text")
            .attr("class", "item-label")
            .attr("y", size + 12)
            .text(d.name);
    }

    // Draw as grid
    const groups = svg.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
            const x = (i % cols) * cellSize + padding;
            const y = Math.floor(i / cols) * cellSize + padding;
            return `translate(${x}, ${y})`;
        })
        .each(function(d) {
            drawGlyph(d3.select(this), d);
        });
});
