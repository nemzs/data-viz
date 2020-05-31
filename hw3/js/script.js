const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C', '#a6cee3', '#1f78b4',
    '#33a02c', '#fb9a99', '#b2df8a',
    '#fdbf6f', '#ff7f00', '#cab2d6',
    '#6a3d9a', '#ffff99', '#b15928']

// Part 1: Создать шкалы для цвета, радиуса и позиции 
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
    .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
    .attr('class', 'donut-lable')
    .attr("text-anchor", "middle")
    .attr('transform', `translate(${(d_width / 2)} ${d_height / 2})`);
const tooltip = d3.select('.tooltip');

const xParam = 'release year';
const rParam = 'user rating score';

const updateCx = function (d) {
    let value = d[xParam] ? d[xParam] : 0;
    return x(value);
};
const updateCy = function (d) {
    return 0;
};
const updateR = function (d) {
    let value = d[rParam] ? d[rParam] : 0;
    return Math.max(radius(value), 3);
};

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation()
    .force('x', d3.forceX().x(updateCx))
    .force('collision', d3.forceCollide().radius(updateR))
    .force("center", d3.forceCenter(b_width / 2, b_height / 2));




d3.csv('data/netflix.csv').then(data => {
    data = d3.nest().key(d => d.title).rollup(d => d[0]).entries(data).map(d => d.value).filter(d => d['user rating score'] !== 'NA');
    console.log(data);

    const rating = data.map(d => +d['user rating score']);
    const years = data.map(d => +d['release year']);
    let ratings = d3.nest().key(d => d.rating).rollup(d => d.length).entries(data);

    //console.log(rating)
    //console.log(years)
    //console.log(ratings)

    color.domain(ratings.map(d => d.key));
    radius.domain([d3.min(rating), d3.max(rating)]);
    x.domain([d3.min(years), d3.max(years)]);
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    // ..

    // Part 1 - создать circles на основе data


    let nodes = bubble.selectAll('circle').data(data);


    nodes.attr('cx', updateCx);
    nodes.attr('cy', updateCy);
    nodes.attr('r', updateR);
    nodes.style('fill', function (d) {
        return color(d.rating)
    });

    let nodesEnter = nodes.enter().append("circle");

    nodesEnter.attr('cx', updateCx);
    nodesEnter.attr('cy', updateCy);
    nodesEnter.attr('r', updateR);
    nodesEnter.style('fill', function (d) {
        return color(d.rating);
    });

    nodes.exit().remove();

    var pie = d3.pie()
        .value(function (d) {
            return d.count;
        });
    let pieData = {};
    data.forEach(d => {
        if (!pieData[d.rating]) {
            pieData[d.rating] = {name: d.rating, count: 1};
        } else {
            pieData[d.rating].count++;
        }
    })
    const dataReady = Object.values(pieData).sort((a, b) => a.count - b.count);

    var arc = d3.arc()
        .innerRadius(80) // it'll be donut chart
        .outerRadius(150)
        .padAngle(0.02)
        .cornerRadius(5);


    let top = donut.selectAll('path')
        .data(pie(dataReady))
        .enter().append('path')
        .attr('d', arc) // каждый элемент будет передан в генератор
        .attr('fill', function(d){
            return color(d.data.name);
        });



    d3.select('svg').selectAll('circle').on('mouseover', overBubble);
    d3.select('svg').selectAll('circle').on('mouseout', outOfBubble);

    d3.selectAll('path').on('mouseover', overArc);
    d3.selectAll('path').on('mouseout', outOfArc);



    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    // ..

    // Part 1 - Создать шаблон при помощи d3.pie() на основе ratings
    // ..

    // Part 1 - Создать генератор арок при помощи d3.arc()
    // ..

    // Part 1 - построить donut chart внутри donut
    // ..


    simulation
        .nodes(data)
        .on("tick", ticked);

    function ticked() {
        var u = d3.select('svg')
            .selectAll('circle')
            .data(data);

        u.enter()
            .append('circle')
            .attr('r', updateR)
            .style('fill', function (d) {
                //console.log(d);
                return d.color;
            })
            .merge(u)
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            });

        u.exit().remove();
    }

    // добавляем обработчики событий mouseover и mouseout
    //.on('mouseover', overArc)
    //.on('mouseout', outOfArc);
    tooltip
        .style("position", "absolute")
        .style("z-index", "10")
        .style("background", "white")
        .style("border", "2px")
        .style("border-radius", "18px")
        .style("border-style", "solid")
        .style("padding", "2px")
        .style("font", "24px sans-serif")
        .style("visibility", "hidden")

    function overBubble(d) {
        this.setAttribute("stroke", "black");
        this.setAttribute("stroke-width", "2");

        tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
            .text(d.title+' '+d['release year'])
            .style("visibility", "visible");
        //d.attr('fill', 'none')
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        // ..

        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        // ..

        // Part 3 - изменить display и позицию tooltip
        // ..
    }



    function outOfBubble() {

        this.removeAttribute("stroke");
        this.removeAttribute("stroke-width");

        tooltip.style("visibility", "hidden");
        // Part 2 - сбросить stroke и stroke-width
        // ..

        // Part 3 - изменить display у tooltip
        // ..
    }


    function overArc(d) {
        this.setAttribute("opacity", "0.7");
        donut_lable.text(d.data.name);
        d3.select('svg').selectAll('circle').each(function(e){
            if(e.rating === d.data.name){
                this.setAttribute("stroke", "black");
                this.setAttribute("stroke-width", "2");
            } else{
                this.setAttribute("opacity", "0.7");
            }
        })
        // Part 2 - изменить содержимое donut_lable
        // ..
        // Part 2 - изменить opacity арки
        // ..

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        // ..
    }

    function outOfArc(d) {
        this.removeAttribute("opacity");
        donut_lable.text('')
        // Part 2 - изменить содержимое donut_lable
        // ..
        // Part 2 - изменить opacity арки
        // ..

        d3.select('svg').selectAll('circle').each(function(e){
            this.removeAttribute("stroke");
            this.removeAttribute("stroke-width");
            this.removeAttribute("opacity");
        })

        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        // ..
    }
});