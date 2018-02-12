/*global d3*/
/*global ws*/

var activeSubject = "";
var sentimentTweets = {};
var sentimentStats = {};
var sentimentChart;

function addSubject(id, screen_name_en, picture, keywords, startTimestamp) {
	
    var subject = {
    	identifier: id,
    	displayname: screen_name_en,
    	description: "",
    	pictureURL: picture,
    	keywords: keywords
    };
    
    console.log(subject);
    
    ws.send(JSON.stringify({
        messagetype: "addSubject",
        subject: subject
    }));

    var time = Number(startTimestamp);

    sentimentTweets[id] = [];
    sentimentStats[id] = [{
            date: time,
            negative: 0,
            neutral: 0,
            positive: 0
        }];
//    sentimentStats[id] = data;

    $("#sentiment-subject-list").append("<img role=\"button\" id=\"sentiment-subject-" + id + "\" class=\"img-thumbnail sentiment-subject\" src=\"" + picture + "\" alt=\"" + screen_name_en + "\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"" + screen_name_en + "\" />");

    $("#sentiment-subject-" + id).click(function (e) {
        if (activeSubject === id) {
            return;
        }

        activeSubject = id;
        
        var name = e.target.getAttribute("title");
        
        document.getElementById('sentimentselectedheader').innerHTML = "Sentiment Expressed Over Time: <b>"+name+"</b>";
        document.getElementById('sentimentselectedheader2').innerHTML = "Sentiment Posts for <b>"+name+"</b>";
        
        $("#sentiment-subject-list").children().removeClass("sentiment-subject-current");
        $("#sentiment-subject-" + id).addClass("sentiment-subject-current");

        renderSentimentChart(sentimentStats[id]);

        $("#sentiment-tweets").empty();
        sentimentTweets[id].forEach(function (tweet) {
        	renderSentimentPost(tweet.sentiment, tweet.timestamp, tweet.html);
            //$("#sentiment-tweets").append(tweet.html);
        });
    });
}

function refreshSentimentTweets() {
	$("#sentiment-tweets").empty();
    sentimentTweets[activeSubject].forEach(function (tweet) {
    	renderSentimentPost(tweet.sentiment, tweet.timestamp, tweet.html);
    });
}

function subjectForm() {
    var id = $("#subject-id")[0].value;
    var screen_name_en = $("#subject-screen_name_en")[0].value;
    var picture = $("#subject-picture")[0].value;
    var keywords = $("#subject-keywords")[0].value.split("; ");

    addSubject(id, screen_name_en, picture, keywords);

    $("#subject-id")[0].value = "";
    $("#subject-screen_name_en")[0].value = "";
    $("#subject-picture")[0].value = "";
    $("#subject-keywords")[0].value = "";
}

function subjectBatch() {
    var batch = JSON.parse($("#subject-batch")[0].value);

    for (var i in batch) {
        var subject = batch[i];
        addSubject(subject.id, subject.screen_name_en, subject.picture, subject.keywords);
    }

    $("#subject-batch")[0].value = "";
}

var marginS = {top: 20, right: 50, bottom: 100, left: 10};
var widthS = 780 - marginS.left - marginS.right;
var heightS = 390 - marginS.top - marginS.bottom;

var sentiments = ["negative", "neutral", "positive"];

var color = function (name) {
    var col;
    switch (name) {
        case "negative":
            col = "#c00017";
            break;
        case "positive":
            col = "#6dad53";
            break;
        default:
        case "neutral":
            col = "#e6e6e6";
            break;
    }
    return col;
};

function createSentimentChart() {

    var x = d3.time.scale()
            .range([0, widthS]);

    var y = d3.scale.linear()
            .range([heightS, 0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%a %e - %I%p"));

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .tickFormat(d3.format("g"));

    var area = d3.svg.area()
            .x(function (d) {
                return x(d.date);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

    var stack = d3.layout.stack()
            .values(function (d) {
                return d.values;
            });

    var svg = d3.select("#sentiment-chart").append("svg")
            .attr("width", widthS + marginS.left + marginS.right)
            .attr("height", heightS + marginS.top + marginS.bottom)
            .append("g")
            .attr("transform", "translate(" + marginS.left + "," + marginS.top + ")");

    return {
        x: x,
        y: y,
        xAxis: xAxis,
        yAxis: yAxis,
        area: area,
        stack: stack,
        svg: svg
    };
}

function renderSentimentChart(stats) {
    if (sentimentChart === undefined) {
        sentimentChart = createSentimentChart();
    }
    var chart = sentimentChart;

    var browsers = chart.stack(sentiments.map(function (name) {
        return {
            name: name,
            values: stats.map(function (d) {
                return {date: d.date, y: d[name]};
            })
        };
    }));

    chart.x.domain(d3.extent(stats, function (d) {
        return d.date;
    }));

    var yDomain = d3.extent(stats, function (d) {
        return d.negative + d.neutral + d.positive;
    });
    chart.y.domain([0, yDomain[1]]);

    // if no x axis exists, create one, otherwise update it
    if (chart.svg.selectAll(".x.axis")[0].length < 1) {
        chart.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + heightS + ")")
                .call(chart.xAxis)
                .selectAll("text")
                .attr("transform", "rotate(330)")
                .style("text-anchor", "end");
    } else {
        chart.svg.selectAll(".x.axis").transition().duration(0)
                .call(chart.xAxis)
                .selectAll("text")
                .attr("transform", "rotate(330)")
                .style("text-anchor", "end");
    }

    // if no y axis exists, create one, otherwise update it
    if (chart.svg.selectAll(".y.axis")[0].length < 1) {
        chart.svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + widthS + " ,0)")
                .call(chart.yAxis);
    } else {
        chart.svg.selectAll(".y.axis").transition().duration(0)
                .call(chart.yAxis);
    }


    var browser = chart.svg.selectAll(".browser").data(browsers).attr("class", "area");
    var areas = chart.svg[0][0];

    browser.enter()
            .append("path")
            .attr("class", "area")
            .attr("d", function (d) {
                return chart.area(d.values);
            })
            .style("fill", function (d) {
                return color(d.name);
            });

    if (areas.childNodes.length > 5) {
        sentiments.forEach(function (s) {
            areas.removeChild(areas.childNodes[2]);
        });
    }

    browser.exit()
            .remove();
}

function processSentimentPost(message) {
    var sentiments = JSON.parse(message.sentiment);
    for (var subject in sentiments) {
        var subjectSentiment = sentiments[subject];
        var tweet = {id: message.identifier, sentiment: subjectSentiment, html: message.text, timestamp: message.timestamp};
        sentimentTweets[subject].unshift(tweet);
        if (subject === activeSubject) {
           // $("#sentiment-tweets").prepend(tweet.html);
        	renderSentimentPost(subjectSentiment, message.timestamp, message.text);
           
        }
        
    }
}

function processSentimentStats(message) {
    console.log("processSentimentStats");
    var stats = JSON.parse(message.stats);
    for (var subject in stats) {
        sentimentStats[subject].push(stats[subject]);
        while (sentimentStats[subject].length > 10) {
            sentimentStats[subject].shift();
        }
        if (subject === activeSubject) {
            renderSentimentChart(sentimentStats[subject]);
        }
    }
}



