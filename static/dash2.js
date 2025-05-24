const colorPalette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

function drawAveragePriceByCity(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Process data: average price by city
    const cityAvgPrice = d3.rollup(
        data,
        v => d3.mean(v, d => parseFloat(d.price) || 0),
        d => d.city
    );
    const barData = Array.from(cityAvgPrice, ([city, avgPrice]) => ({ city, avgPrice }))
        .sort((a, b) => b.avgPrice - a.avgPrice)
        .slice(0, 5); // chỉ lấy top 5
    const svg = d3.select("#chart1")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.city))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.avgPrice)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("g")
        .selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.city))
        .attr("y", d => y(d.avgPrice))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.avgPrice))
        .attr("fill", colorPalette[0])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("fill", colorPalette[1]);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`City: ${d.city}<br>Average Price: ${d.avgPrice.toFixed(2)} VND`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8).attr("fill", colorPalette[0]);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 5)
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
        .style("font-size", "10px");
}

function drawWarrantyPieChart(data) {
    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    // Process data: count unique vehicle_id by warranty_policy
    const warrantyCount = d3.rollup(
        data,
        v => new Set(v.map(d => d.vehicle_id)).size,
        d => d.warranty_policy || "Unknown"
    );
    const totalVehicles = d3.sum(Array.from(warrantyCount.values()));
    const pieData = Array.from(warrantyCount, ([group, count]) => ({
        group,
        count,
        percentage: (count / totalVehicles * 100).toFixed(2)
    }));

    const svg = d3.select("#chart2")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const arcs = svg.selectAll("arc")
        .data(pie(pieData))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colorPalette[i % colorPalette.length])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("stroke", "black").attr("stroke-width", 2);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Status: ${d.data.group}<br>Vehicles: ${d.data.count}<br>Percentage: ${d.data.percentage}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8).attr("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(d => `${d.data.group}: ${d.data.percentage}%`);
}

function drawEngineCapacityTreemap(data) {
    const width = 400;
    const height = 300;

    // Process data: count unique vehicle_id by engine_capacity
    const engineCount = d3.rollup(
        data,
        v => new Set(v.map(d => d.vehicle_id)).size,
        d => d.engine_capacity || "Unknown"
    );
    const treemapData = Array.from(engineCount, ([capacity, count]) => ({ name: capacity, count }));

    const svg = d3.select("#chart3")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const root = d3.hierarchy({ children: treemapData })
        .sum(d => d.count)
        .sort((a, b) => b.count - a.count);

    d3.treemap()
        .size([width, height])
        .padding(2)
        (root);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", (d, i) => colorPalette[i % colorPalette.length])
        .attr("stroke", "white")
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("stroke-width", 2);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Capacity: ${d.data.name}<br>Vehicles: ${d.data.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8).attr("stroke-width", 1);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    cell.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => d.data.name.length > 15 ? `${d.data.name.slice(0, 12)}...` : d.data.name)
        .attr("font-size", "12px")
        .attr("fill", "white")
        .attr("font-weight", "500");
}

function drawPriceVsKilometersScatter(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const validData = data.filter(d => d.price != null && d.kilometers_used != null && !isNaN(d.price) && !isNaN(d.kilometers_used));

    const svg = d3.select("#chart4")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleLinear()
        .domain([0, d3.max(validData, d => parseFloat(d.kilometers_used))])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(validData, d => parseFloat(d.price))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("g")
        .selectAll("circle")
        .data(validData)
        .enter()
        .append("circle")
        .attr("cx", d => x(parseFloat(d.kilometers_used)))
        .attr("cy", d => y(parseFloat(d.price)))
        .attr("r", 5)
        .attr("fill", colorPalette[2])
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("r", 7);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Price: ${parseFloat(d.price).toFixed(2)} VND<br>Kilometers: ${parseFloat(d.kilometers_used).toFixed(0)} km`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.6).attr("r", 5);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".2s")))
        .style("font-size", "10px");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
        .style("font-size", "10px");
}

function drawVehiclesByYearBarChart(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Process data: count unique vehicle_id by registration_year
    const yearCount = d3.rollup(
        data,
        v => new Set(v.map(d => d.vehicle_id)).size,
        d => d.registration_year || "Unknown"
    );
    const barData = Array.from(yearCount, ([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);

    const svg = d3.select("#chart5")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("g")
        .selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.count))
        .attr("fill", colorPalette[3])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("fill", colorPalette[4]);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Year: ${d.year}<br>Vehicles: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8).attr("fill", colorPalette[3]);
            tooltip.transition().duration(500).style("opacity", 0);
        });
    // Lọc và chuyển năm thành số
    const validYears = barData
        .map(d => +d.year)
        .filter(year => !isNaN(year));
    const minYear = d3.min(validYears);
    const maxYear = d3.max(validYears);

    // Tạo danh sách các năm cách nhau 3 năm
    const tickYears = d3.range(minYear, maxYear + 1, 3);

    // Lọc năm cách nhau 3 năm
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(tickYears))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 5)
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .style("font-size", "10px");
}

function drawAveragePriceByYearLineChart(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Process data: average price by registration_year
    const yearAvgPrice = d3.rollup(
        data,
        v => d3.mean(v, d => parseFloat(d.price) || 0),
        d => d.registration_year || "Unknown"
    );
    const lineData = Array.from(yearAvgPrice, ([year, avgPrice]) => ({ year, avgPrice }))
        .sort((a, b) => a.year - b.year);

    const svg = d3.select("#chart6")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scalePoint()
        .domain(lineData.map(d => d.year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => d.avgPrice)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.avgPrice));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", colorPalette[5])
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("g")
        .selectAll("circle")
        .data(lineData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avgPrice))
        .attr("r", 5)
        .attr("fill", colorPalette[5])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("r", 7);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Year: ${d.year}<br>Average Price: ${d.avgPrice.toFixed(2)} VND`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8).attr("r", 5);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Lọc và chuyển năm thành số
    const validYears = lineData
        .map(d => +d.year)
        .filter(year => !isNaN(year));
    const minYear = d3.min(validYears);
    const maxYear = d3.max(validYears);

    // Tạo danh sách các năm cách nhau 3 năm
    const tickYears = d3.range(minYear, maxYear + 1, 3);

    // Cập nhật trục X với tick cách 3 năm
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(tickYears))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 5)
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
        .style("font-size", "10px");
}

function drawConditionByTypeBarChart(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Process data: count unique vehicle_id by condition and vehicle_type
    const groupedData = d3.rollup(
        data,
        v => new Set(v.map(d => d.vehicle_id)).size,
        d => d.vehicle_type || "Unknown",
        d => d.condition || "Unknown"
    );

    const vehicleTypes = Array.from(groupedData.keys());
    const conditions = [...new Set(Array.from(groupedData.values()).flatMap(d => Array.from(d.keys())))];
    const barData = vehicleTypes.flatMap(type => 
        conditions.map(condition => ({
            type,
            condition,
            count: groupedData.get(type)?.get(condition) || 0
        }))
    );

    const svg = d3.select("#chart7")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x0 = d3.scaleBand()
        .domain(vehicleTypes)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain(conditions)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("g")
        .selectAll("g")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x0(d.type) + x1(d.condition))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.count))
        .attr("fill", (d, i) => colorPalette[i % conditions.length])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Type: ${d.type}<br>Condition: ${d.condition}<br>Vehicles: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 5)
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .style("font-size", "10px");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

    conditions.forEach((condition, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorPalette[i]);

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .attr("font-size", "10px")
            .text(condition);
    });
}