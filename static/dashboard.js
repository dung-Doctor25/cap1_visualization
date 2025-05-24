function drawSellerTreemap(data) {
    const width = 500;
    const height = 400;

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    const sellerCount = d3.rollup(data, v => v.length, d => d.seller_name);
    const treemapData = Array.from(sellerCount, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    // Tìm min - max của count để scale màu
    const minCount = d3.min(treemapData, d => d.count);
    const maxCount = d3.max(treemapData, d => d.count);

    // Gradient color scale
    const color = d3.scaleLinear()
        .domain([minCount, maxCount])
        .range(["#a2d9ce", "#e74c3c"]); // từ xanh nhạt đến đỏ đậm

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const root = d3.hierarchy({ children: treemapData })
        .sum(d => d.count)
        .sort((a, b) => a.count - b.count); // từ bé đến lớn

    d3.treemap()
        .size([width, height])
        .padding(2)(root);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.data.count))
        .attr("stroke", "white")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>Seller:</strong> ${d.data.name}<br><strong>Posts:</strong> ${d.data.count}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

}



function drawCityBarChart(data) {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    // Tạo tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Xử lý dữ liệu: đếm số bài đăng theo city
    const cityCount = d3.rollup(data, v => v.length, d => d.city);
    const barData = Array.from(cityCount, ([city, count]) => ({ city, count })).sort((a, b) => d3.descending(a.count, b.count)).slice(0, 10);

    const svg = d3.select("#chart2")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.city))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.city))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.count))
        .attr("fill", "#007bff")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>City:</strong> ${d.city}<br><strong>Posts:</strong> ${d.count}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 5)
        .style("text-anchor", "end");


}


function drawRatingPieChart(data) {
    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    // ✅ Nhóm rating theo seller_name
    const sellerGroups = d3.rollup(
        data,
        v => {
            const rating = parseFloat(v[0].rating); // lấy rating đầu tiên của seller
            if (isNaN(rating) || rating === 0) return "Không có đánh giá";
            else if (rating <= 3) return "Đánh giá thấp";
            else if (rating <= 5) return "Đánh giá cao";
            else return "Không xác định";
        },
        d => d.seller_name
    );

    // ✅ Đếm số lượng seller trong mỗi nhóm
    const ratingCount = d3.rollup(
        Array.from(sellerGroups.values()),
        v => v.length,
        d => d
    );

    const pieData = Array.from(ratingCount, ([group, count]) => ({ group, count }));

    const svg = d3.select("#chart3")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // ✅ Tooltip element
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    const arcs = svg.selectAll("g")
        .data(pie(pieData))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => d3.schemeCategory10[d.index])
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mousemove", function(event, d) {
            const percent = ((d.data.count / d3.sum(pieData, d => d.count)) * 100).toFixed(1);
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.data.group}</strong><br>Số seller: ${d.data.count}<br>Tỷ lệ: ${percent}%`)
                .style("top", (event.pageY - 30) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));


}



function drawCriteriaBarChart(data) {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 100 };

    const criteria = [
        "reasonable_price_negotiation",
        "good_price_product",
        "product_quality_good",
        "accurate_product_description",
        "reliable",
        "polite_friendly_communication",
        "on_time",
        "fast_message_response"
    ];
    const averages = criteria.map(criterion => ({
        criterion,
        average: d3.mean(data, d => parseFloat(d[criterion]))
    })).sort((a, b) => d3.ascending(a.average, b.average));

    const svg = d3.select("#chart4")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleLinear()
        .domain([0, d3.max(averages, d => d.average)])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(averages.map(d => d.criterion))
        .range([height - margin.bottom, margin.top])
        .padding(0.1);

    // ✅ Thêm tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    svg.append("g")
        .selectAll("rect")
        .data(averages)
        .enter()
        .append("rect")
        .attr("x", margin.left)
        .attr("y", d => y(d.criterion))
        .attr("width", d => x(d.average) - margin.left)
        .attr("height", y.bandwidth())
        .attr("fill", "#28a745")
        .on("mousemove", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.criterion}</strong><br>Trung bình: ${d.average.toFixed(2)}`)
                .style("top", (event.pageY - 30) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });



    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}


function drawPriceHistogram(data) {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    const prices = data.map(d => parseFloat(d.price)).filter(d => !isNaN(d));

    const svg = d3.select("#chart5")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // X scale
    const x = d3.scaleLinear()
        .domain([d3.min(prices), 400000000]) // Giả sử giá tối đa là 40 triệu
        .range([margin.left, width - margin.right]);

    // Histogram with bin size = 5 triệu
    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(d3.range(d3.min(prices), d3.max(prices) + 5000000, 5000000)); // 5 triệu mỗi bin

    const bins = histogram(prices);

    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top]);

    // ✅ Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Draw bars
    svg.append("g")
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => height - margin.bottom - y(d.length))
        .attr("fill", "#dc3545")
        .on("mousemove", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>Khoảng giá:</strong> ${formatMillions(d.x0)} - ${formatMillions(d.x1)}<br>
                    <strong>Số lượng:</strong> ${d.length}
                `)
                .style("top", (event.pageY - 30) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // Trục X với nhãn dạng "triệu"
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d => formatMillions(d)));



    // ✅ Hàm định dạng giá thành "triệu"
    function formatMillions(value) {
        return (value / 1000000).toFixed(0) + " triệu";
    }
}



function drawBrandTreemap(data) {
    const width = 500;
    const height = 400;

    // Xử lý dữ liệu: đếm số bài đăng theo brand
    const brandCount = d3.rollup(data, v => v.length, d => d.brand);
    const treemapData = Array.from(brandCount, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const svg = d3.select("#chart6")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Tạo thang màu gradient dựa trên số lượng
    const color = d3.scaleLinear()
        .domain([0, d3.max(treemapData, d => d.count)])
        .range(["#cce5ff", "#004085"]); // Xanh nhạt đến xanh đậm

    const root = d3.hierarchy({ children: treemapData })
        .sum(d => d.count)
        .sort((a, b) => b.count - a.count);

    d3.treemap()
        .size([width, height])
        .padding(2)
        (root);

    // ✅ Tạo tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.data.count))
        .attr("stroke", "white")
        .on("mousemove", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(`<strong>Thương hiệu:</strong> ${d.data.name}<br><strong>Số bài đăng:</strong> ${d.data.count}`)
                .style("top", (event.pageY - 30) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    cell.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => `${d.data.name}: ${d.data.count}`)
        .attr("font-size", "12px")
        .attr("fill", "black");
}
