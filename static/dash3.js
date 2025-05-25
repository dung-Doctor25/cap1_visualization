const colorPalette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

function drawSellersByCity(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Tính unique seller_name và count vehicle_id theo city
    const cityStats = d3.rollup(
        data,
        v => ({
            sellerCount: new Set(v.map(d => d.seller_name)).size,
            vehicleCount: v.length
        }),
        d => d.city || "Unknown"
    );

    const barData = Array.from(cityStats, ([city, stats]) => ({
        city,
        sellerCount: stats.sellerCount,
        vehicleCount: stats.vehicleCount
    }))
    .sort((a, b) => b.sellerCount - a.sellerCount)  // Sắp giảm dần theo số seller
    .slice(0, 5);                                   // Lấy top 5

    if (barData.length === 0) {
        d3.select("#chart1").append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("No data available")
            .style("font-size", "14px");
        return;
    }

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.city))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.sellerCount) || 1])
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
        .attr("y", d => y(d.sellerCount))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.sellerCount))
        .attr("fill", colorPalette[0])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("fill", colorPalette[1]);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
                `City: ${d.city}<br>` +
                `Sellers: ${d.sellerCount}<br>` +
                `Vehicles: ${d.vehicleCount}`
            )
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
}


function drawSellerPolicyPieChart(data) {
    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    // Process data: count unique seller_name by seller_policy
    const policyCount = d3.rollup(
        data,
        v => new Set(v.map(d => d.seller_name)).size,
        d => d.seller_policy === "Không có" ? "Không có" : "Có"
    );
    const totalSellers = d3.sum(Array.from(policyCount.values()));
    const pieData = Array.from(policyCount, ([group, count]) => ({
        group,
        count,
        percentage: totalSellers > 0 ? (count / totalSellers * 100).toFixed(2) : 0
    }));

    // Nếu không có dữ liệu
    if (pieData.length === 0) {
        d3.select("#chart2").append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("No data available")
            .style("font-size", "14px");
        return;
    }

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
            tooltip.html(`Policy: ${d.data.group}<br>Sellers: ${d.data.count}<br>Percentage: ${d.data.percentage}%`)
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

function drawTopSellersBarChart(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Process data: sum sold and selling for top 5 sellers
    const sellerStats = d3.rollup(
        data,
        v => ({
            sold: d3.max(v, d => d.sold || 0),
            selling: d3.max(v, d => d.selling || 0)
        }),
        d => d.seller_name
    );
    console.log(sellerStats);
    const barData = Array.from(sellerStats, ([seller, { sold, selling }]) => ({ seller, sold, selling }))
        .sort((a, b) => (b.sold + b.selling) - (a.sold + a.selling))
        .slice(0, 5);

    // Nếu không có dữ liệu
    if (barData.length === 0) {
        d3.select("#chart3").append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("No data available")
            .style("font-size", "14px");
        return;
    }

    const svg = d3.select("#chart3")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x0 = d3.scaleBand()
        .domain(barData.map(d => d.seller))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain(['sold', 'selling'])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => Math.max(d.sold, d.selling)) || 1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const barGroups = barData.flatMap(d => [
        { seller: d.seller, type: 'sold', value: d.sold },
        { seller: d.seller, type: 'selling', value: d.selling }
    ]);

    svg.append("g")
        .selectAll("rect")
        .data(barGroups)
        .enter()
        .append("rect")
        .attr("x", d => x0(d.seller) + x1(d.type))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.value))
        .attr("fill", d => d.type === 'sold' ? colorPalette[2] : colorPalette[3])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Seller: ${d.seller}<br>Type: ${d.type}<br>Count: ${d.value}`)
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
    ['sold', 'selling'].forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", type === 'sold' ? colorPalette[2] : colorPalette[3]);
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .attr("font-size", "10px")
            .text(type.charAt(0).toUpperCase() + type.slice(1));
    });
}

function drawCityPolicyTable(data) {
    // Chuẩn hóa dữ liệu
    data.forEach(d => {
        d.city = d.city || "Unknown";
        d.seller_policy = d.seller_policy === "Không có" ? "Không có" : "Có";
    });

    const policies = Array.from(new Set(data.map(d => d.seller_policy)));

    // Gom nhóm và đếm số lượng seller_name duy nhất theo city và seller_policy
    const grouped = d3.rollup(
        data,
        v => {
            const counts = d3.rollup(
                v,
                vv => new Set(vv.map(d => d.seller_name)).size,
                d => d.seller_policy
            );
            const result = {};
            policies.forEach(p => {
                result[p] = counts.get(p) || 0;
            });
            return result;
        },
        d => d.city
    );

    // Chuyển dữ liệu thành dạng mảng để vẽ bảng
    const tableData = Array.from(grouped, ([city, policyCounts]) => ({
        city,
        ...policyCounts
    })).sort((a, b) => d3.ascending(a.city, b.city));

    // Nếu không có dữ liệu
    if (tableData.length === 0) {
        d3.select("#chart4").append("p")
            .text("No data available")
            .style("text-align", "center")
            .style("font-size", "14px");
        return;
    }

    const table = d3.select("#chart4")
        .append("table")
        .attr("class", "table table-striped table-bordered");

    // Header
    const columnKeys = ["city", ...policies];
    const columnLabels = ["City", ...policies];

    table.append("thead")
        .append("tr")
        .selectAll("th")
        .data(columnLabels)
        .enter()
        .append("th")
        .text(d => d);

    // Body
    table.append("tbody")
        .selectAll("tr")
        .data(tableData)
        .enter()
        .append("tr")
        .selectAll("td")
        .data(row => columnKeys.map(key => row[key]))
        .enter()
        .append("td")
        .text(d => d);
}




function drawPriceByPolicyBoxplot(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const colorPalette = ["#1f77b4", "#ff7f0e"];

    // Gom nhóm giá theo seller_policy
    const priceData = d3.rollup(
        data,
        v => v
            .filter(d => d.price != null && d.price !== "" && !isNaN(d.price))
            .map(d => parseFloat(d.price)),
        d => d.seller_policy === "Không có" ? "Không có" : "Có"
    );

    const boxData = Array.from(priceData, ([policy, prices]) => {
        if (prices.length === 0) return null;
        const sorted = prices.sort(d3.ascending);
        const q1 = d3.quantile(sorted, 0.25);
        const median = d3.quantile(sorted, 0.5);
        const q3 = d3.quantile(sorted, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(sorted[0], q1 - 1.5 * iqr);
        const max = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
        return {
            policy,
            min,
            q1,
            median,
            q3,
            max,
            outliers: sorted.filter(d => d < min || d > max)
        };
    }).filter(d => d);

    if (boxData.length === 0) {
        d3.select("#chart5").append("p")
            .text("No data available")
            .style("text-align", "center")
            .style("font-size", "14px");
        return;
    }

    const svg = d3.select("#chart5")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(boxData.map(d => d.policy))
        .range([margin.left, width - margin.right])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([
            d3.min(boxData, d => d.min),
            d3.max(boxData, d => d.max)
        ])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const boxWidth = x.bandwidth() / 2;

boxData.forEach((d, i) => {
    const xPos = x(d.policy) + x.bandwidth() / 2;

    // Whiskers
    svg.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", y(d.min))
        .attr("y2", y(d.max))
        .attr("stroke", "black");

    // Box
    svg.append("rect")
        .attr("x", xPos - boxWidth / 2)
        .attr("y", y(d.q3))
        .attr("height", y(d.q1) - y(d.q3))
        .attr("width", boxWidth)
        .attr("fill", colorPalette[i])
        .attr("opacity", 0.8)
        .on("mouseover", function(event) {
            d3.select(this).attr("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Policy: ${d.policy}<br>Min: ${d.min.toFixed(2)} VND<br>Q1: ${d.q1.toFixed(2)} VND<br>Median: ${d.median.toFixed(2)} VND<br>Q3: ${d.q3.toFixed(2)} VND<br>Max: ${d.max.toFixed(2)} VND`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Median line
    svg.append("line")
        .attr("x1", xPos - boxWidth / 2)
        .attr("x2", xPos + boxWidth / 2)
        .attr("y1", y(d.median))
        .attr("y2", y(d.median))
        .attr("stroke", "black");

    // Outliers
    svg.selectAll(`circle.outlier-${i}`)
        .data(d.outliers)
        .enter()
        .append("circle")
        .attr("cx", xPos)
        .attr("cy", o => y(o))
        .attr("r", 3)
        .attr("fill", colorPalette[i])
        .attr("opacity", 0.6)
        .on("mouseover", function(event, o) {
            d3.select(this).attr("opacity", 1).attr("r", 5);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Policy: ${d.policy}<br>Outlier: ${o.toFixed(2)} VND`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.6).attr("r", 3);
            tooltip.transition().duration(500).style("opacity", 0);
        });
});


    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .style("font-size", "10px");


}


function drawSellerRatingsBarChart(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Process data: average ratings by criteria for each seller
    const criteria = [
        'reasonable_price_negotiation', 'fast_message_response', 'good_price_product',
        'product_quality_good', 'accurate_product_description', 'reliable',
        'polite_friendly_communication', 'on_time'
    ];
    const ratingsData = d3.rollup(
        data,
        v => criteria.reduce((acc, c) => {
            acc[c] = d3.mean(v, d => parseFloat(d[c]) || 0);
            return acc;
        }, {}),
        d => d.seller_name
    );
    const barData = criteria.flatMap(criterion => ({
        criterion: criterion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: d3.mean(Array.from(ratingsData.values()), d => d[criterion])
    }));

    // Nếu không có dữ liệu
    if (barData.length === 0) {
        d3.select("#chart6").append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("No data available")
            .style("font-size", "14px");
        return;
    }

    const svg = d3.select("#chart6")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.criterion))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.value) || 5])
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
        .attr("x", d => x(d.criterion))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.value))
        .attr("fill", (d, i) => colorPalette[i % colorPalette.length])
        .attr("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Criterion: ${d.criterion}<br>Average Rating: ${d.value.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.8);
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

}