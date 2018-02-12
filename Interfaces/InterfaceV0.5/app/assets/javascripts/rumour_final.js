

var itemsPerPage = 4;
var itemsInsertedInCurrentPage = 0;
var pageNumber = 0;
var currentPageID = null;

// load test data function
function loadItem(json) {

	var identifier = json.sourcePost.identifier;
	var sourceText = json.sourcePost.text;

	var image = null; //"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg";
	if (json.hasOwnProperty('media')) {

		for ( var i = 0; i < json.media.length; i++ ) {


			var mediaItem = json.media[i];

			if (mediaItem.hasOwnProperty('description')) {
				if (mediaItem.description === "photo") {
	
					if (mediaItem.hasOwnProperty('url')) {
						if (image===null) image = mediaItem.url;
					}

				}
			}

		}
	}

	var timestamp = parseInt(json.sourcePost.timestamp)/1000;
	var moment = timeConverter(timestamp);

	var interactions = json.statisicalData.sharedCount;

	var shareTrend = "<span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span>";
	if ((parseFloat(json.statisicalData.growth10m)<5)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-down\" aria-hidden=\"true\"></span>";
	}
	if ((parseFloat(json.statisicalData.growth10m)>=5)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>";
	}
	if ((parseFloat(json.statisicalData.growth30m)*2)>parseFloat(interactions)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>"+"<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>";
	}

	var doubt = json.statisicalData.doubtScore;
	doubt = doubt.toFixed(2);

	if (currentPageID===null || itemsInsertedInCurrentPage===itemsPerPage) {
			// create a new page
			pageNumber = pageNumber+ 1;			
			currentPageID = "pageList-"+pageNumber;		

			var aNewPage = document.createElement('div');
			if (pageNumber===1) {
              			aNewPage.className = "item active";
			} else {
				aNewPage.className = "item";
			}
              		aNewPage.innerHTML = "<ul id='"+currentPageID+"'class='thumbnails'>";
              		document.getElementById('rumour-carousel').appendChild(aNewPage);
			
                    	itemsInsertedInCurrentPage = 0;
	}

	var aNewItem = document.createElement('li');
        aNewItem.className = "col-sm-3";
        aNewItem.setAttribute("id", identifier);

	if (image===null) {
        	aNewItem.innerHTML = "<div class='fff'><div class='caption'><h5>"+sourceText+"</h5><p>"+moment+"</p>"+
			"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Posts</span>"+
						"<span class='twPc-StatValue'>"+interactions+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Trend</span>"+
						"<span class='twPc-StatValue'>"+shareTrend+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Doubt Level</span>"+
						"<span class='twPc-StatValue'>"+doubt+"</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div><div class='btn-group' role='group' aria-label='...'><button type='button' id=\"button-"+json.identifier+"\" class='btn btn-primary' onclick='window.open(\"http://localhost:9000/super/wp4/rumourThread?thread="+json.identifier+"\")'>View Thread</button></div></div></div>";
	} else {
		aNewItem.innerHTML = "<div class='fff'><div class='thumbnail'><a href='#'><img src='"+image+"' alt=''></a></div><div class='caption'><h5>"+sourceText+"</h5><p>"+moment+"</p>"+
			"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Posts</span>"+
						"<span class='twPc-StatValue'>"+interactions+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Trend</span>"+
						"<span class='twPc-StatValue'>"+shareTrend+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Doubt Level</span>"+
						"<span class='twPc-StatValue'>"+doubt+"</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div><div class='btn-group' role='group' aria-label='...'><button type='button' id=\"button-"+json.identifier+"\" class='btn btn-primary' onclick='window.open(\"http://localhost:9000/super/wp4/rumourThread?thread="+json.identifier+"\")'>View Thread</button></div></div></div>";
	}        

	document.getElementById(currentPageID).appendChild(aNewItem);
	itemsInsertedInCurrentPage = itemsInsertedInCurrentPage+1;

	$("#myCarousel").carousel("pause").removeData();
	$("#myCarousel").carousel(0);
	$("#myCarousel").carousel('pause');	

	return aNewItem;
	
}

//load test data function
function loadItemTable(json, typelogo) {

	
	var identifier = json.sourcePost.identifier;
	var sourceText = json.sourcePost.text;
	var lang = json.sourcePost.metadata['lang'];

	var image = null; //"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg";
	if (json.hasOwnProperty('media')) {

		for ( var i = 0; i < json.media.length; i++ ) {


			var mediaItem = json.media[i];

			if (mediaItem.hasOwnProperty('description')) {
				if (mediaItem.description === "photo") {
	
					if (mediaItem.hasOwnProperty('url')) {
						if (image===null) image = mediaItem.url;
					}

				}
			}

		}
	}

	var timestamp = parseInt(json.sourcePost.timestamp)/1000;
	var moment = timeConverter(timestamp);

	var interactions = json.statisicalData.sharedCount;

	var shareTrend = "<span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span>";
	if ((parseFloat(json.statisicalData.growth10m)<5)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-down\" aria-hidden=\"true\"></span>";
	}
	if ((parseFloat(json.statisicalData.growth10m)>=5)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>";
	}
	if ((parseFloat(json.statisicalData.growth30m)*2)>parseFloat(interactions)) {
		shareTrend = "<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>"+"<span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>";
	}

	var doubt = json.statisicalData.doubtScore;
	doubt = doubt.toFixed(2);

	/*if (currentPageID===null || itemsInsertedInCurrentPage===itemsPerPage) {
			// create a new page
			pageNumber = pageNumber+ 1;			
			currentPageID = "pageList-"+pageNumber;		

			var aNewPage = document.createElement('div');
			if (pageNumber===1) {
              			aNewPage.className = "item active";
			} else {
				aNewPage.className = "item";
			}
              		aNewPage.innerHTML = "<ul id='"+currentPageID+"'class='thumbnails'>";
              		document.getElementById('rumour-carousel').appendChild(aNewPage);
			
                    	itemsInsertedInCurrentPage = 0;
	}*/

	var aNewItem = document.createElement('tr');
        aNewItem.setAttribute("id", identifier);

        	aNewItem.innerHTML = ""+
        		"<td><div class='thumbnail'><a href='#'><img src='"+typelogo+"' height='20' width='20' alt=''></a></div></td>"+
        		"<td>"+moment+"</td>"+
        		"<td>"+sourceText+"</td>"+
        		"<td>"+interactions+"</td>"+
        		"<td>"+shareTrend+"</td>"+
        		"<td>"+lang+"</td>"+
        		"<td>"+doubt+"</td>"+
        		"<td><div class='btn-group' role='group' aria-label='...'><button type='button' id=\"button-"+json.identifier+"\" class='btn btn-primary' onclick='showThread(\""+json.identifier+"\")'>View</button></div></td>";
	 

	document.getElementById("threadTableBody").appendChild(aNewItem);
	itemsInsertedInCurrentPage = itemsInsertedInCurrentPage+1;

	//$("#myCarousel").carousel("pause").removeData();
	//$("#myCarousel").carousel(0);
	//$("#myCarousel").carousel('pause');	

	
	
	return aNewItem;
	
}



function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  if (hour < 10) hour = "0"+hour;
  var min = a.getMinutes();
  if (min < 10) min = "0"+min;
  var sec = a.getSeconds();
  if (sec < 10) sec = "0"+sec;
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec +" UTC";
  return time;
}


function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}


