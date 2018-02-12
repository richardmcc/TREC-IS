var ws;

var i =0;

function openWebSocketConnection() {
    
    var wsURL = document.getElementById("myBody").getAttribute("wsdata"); 
    ws = new WebSocket(wsURL);
    ws.onmessage = function(event) {
      var message;
      message = JSON.parse(event.data);
      switch (message.type) {
      case "topic":
    	  //alert("a");
    	  insertTopicToVis(message);
    	  
    	  break;
      default:
        return console.log(message);
      }
    }
    
}

function loadTopics() {
	ws.send(JSON.stringify({
		messagetype: "LOAD"
    }));
}

function insertTopicToVis(message) {
	var id = message.id;
	var prob = message.prob;
	var terms = message.topterms;
	var largeImg = message.largeImg;
	var smallImg = message.smallImg;
	var numEntities = message.numEntities;
	var entitiesHTML = message.entitiesHTML;
	var conceptsHTML = message.conceptsHTML;
	var conceptNameList = message.conceptNameList;
	var conceptScoreList = message.conceptScoreList;
	/*<div class="row panel">
	<div class="col-md-4 bg_blur background-image:url('http://data2.whicdn.com/images/139218968/large.jpg')">
	    <a href="#" class="follow_btn hidden-xs">Follow</a>
	</div>
    <div class="col-md-8  col-xs-12">
       <img src="http://lorempixel.com/output/people-q-c-100-100-1.jpg" class="img-thumbnail picture hidden-xs" />
       <img src="http://lorempixel.com/output/people-q-c-100-100-1.jpg" class="img-thumbnail visible-xs picture_mob" />
       <div class="header">
            <h1>Lorem Ipsum</h1>
            <h4>Web Developer</h4>
            <span>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."
"There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain..."</span>
       </div>
    </div>
</div>   */
	
	var htmlInsert = "<div class=\"row panel\">";
    htmlInsert = htmlInsert.concat("<div class=\"col-md-3 bg_blur\" style=\"background-image: url(").concat(largeImg).concat(")\">");
    //htmlInsert = htmlInsert.concat("<a href=\"#\" class=\"follow_btn hidden-xs\">Follow</a>");
    htmlInsert = htmlInsert.concat("</div>");
    htmlInsert = htmlInsert.concat("<div class=\"col-md-4  col-xs-6\">");
    //htmlInsert = htmlInsert.concat("<img src=\"").concat(smallImg).concat("\" class=\"img-thumbnail picture hidden-xs\" />");
    //htmlInsert = htmlInsert.concat("<img src=\"http://lorempixel.com/output/people-q-c-100-100-1.jpg\" class=\"img-thumbnail visible-xs picture_mob\" />");
    htmlInsert = htmlInsert.concat("<div class=\"header\">");
    htmlInsert = htmlInsert.concat("<h1>").concat(id).concat("</h1>");
    htmlInsert = htmlInsert.concat("<h4>").concat(prob).concat("</h4>");
    htmlInsert = htmlInsert.concat("<span>").concat(terms).concat("<br/></span>");
    htmlInsert = htmlInsert.concat("<span>").concat(entitiesHTML).concat("</span>");
    //htmlInsert = htmlInsert.concat("<span>").concat(conceptsHTML).concat("</span>");
    htmlInsert = htmlInsert.concat("</div>");
    htmlInsert = htmlInsert.concat("</div>");
    htmlInsert = htmlInsert.concat("<div class=\"col-md-5  col-xs-6\">");
    
    htmlInsert = htmlInsert.concat("<div id=\"chart").concat(i).concat("\"></div>");
    
    htmlInsert = htmlInsert.concat("</div>");
    htmlInsert = htmlInsert.concat("</div>");
    
    var frag = document.createDocumentFragment();

    temp = document.createElement('div');
        
    temp.innerHTML = htmlInsert;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
	  
	document.getElementById("topicsdiv").insertBefore(frag, document.getElementById("topicsdiv").childNodes[0]);
    
	var ns = conceptNameList.split(",");
	var ns1 = conceptScoreList.split(",");
	//alert(conceptScoreList);
	
	var targetChart = "#chart".concat(i);
	
	$(targetChart).jChart({
		width: 250, 
		name: "Concept Distribution",
		headers: [ns[0],ns[1],ns[2],ns[3],ns[4]],
		values: [ns1[0],ns1[1],ns1[2],ns1[3],ns1[4]],
		footers: [0,0.2,0.4,0.6,0.8,1.0],
		colors: ["#1000ff","#006eff","#00b6ff","#00fff6","#00ff90"]
	});
	
	i=i+1;
	
}


function moveToTopicPage() {
	window.location.href = "http://localhost:9000/electionTopic";
	
}

