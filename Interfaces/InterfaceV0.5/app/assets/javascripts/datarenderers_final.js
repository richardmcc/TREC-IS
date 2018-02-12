// social media generic renderers SUPER


// render a source tweet stored as a SUPER post
function renderSource(post, target) {

	var timestamp = parseInt(post.timestamp)/1000;
	var moment = timeConverter(timestamp);
	var retweets = 	post.metadata['retweet_count'];

	var verified = post.metadata['user.verified'];
	if (verified==="true") verified="<span class='glyphicon glyphicon-ok-sign' aria-hidden='true'></span>";
	else verified="<span class='glyphicon glyphicon-remove-sign' aria-hidden='true'></span>";

	var friends = post.metadata['user.friends_count'];
	var followers = post.metadata['user.friends_count'];
	var statuses = post.metadata['user.statuses_count'];
	var userCreatedAt = post.metadata['user.created_at'];


	var credibility = parseFloat(post.metadata['risf.credibility.1']);
	credibility=credibility.toFixed(2);

	var sentiment = post.metadata.sentiment;
	if (sentiment==="positive") sentiment="<font color='green'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></font>";
	else if (sentiment==="negative") sentiment="<font color='red'><span class='glyphicon glyphicon-thumbs-down' aria-hidden='true'></span></font>";
	else if (sentiment==="neutral") sentiment="<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>";

	var aNewItem = document.createElement('div');
        aNewItem.innerHTML = "<span class='label label-default'>Source Post</span><div class='list-group'>"+
	"<a href='#' class='list-group-item active'><h5 class='list-group-item-heading'>"+post.text+"</h5>"+
	"<p>"+moment+"</p>"+
	"</a>"+
	"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Verified</span>"+
						"<span class='twPc-StatValue'>"+verified+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Retweets</span>"+
						"<span class='twPc-StatValue'>"+retweets+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Credibility</span>"+
						"<span class='twPc-StatValue'>"+credibility	+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Sentiment</span>"+
						"<span class='twPc-StatValue'>"+sentiment+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>User Followers</span>"+
						"<span class='twPc-StatValue'>"+followers+"</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div></div<";
	
        document.getElementById(target).appendChild(aNewItem);

}

function renderThreadStats(thread, target) {

	var interactions = parseInt(thread.statisicalData['sharedCount'])+parseInt(thread.statisicalData['threadsize']);
	var replies = thread.statisicalData['threadsize'];
	var positivePosts = thread.statisicalData['positivePosts'];
	var negativePosts = thread.statisicalData['negativePosts'];
	

	var aNewItem = document.createElement('div');
        aNewItem.innerHTML = "<span class='label label-default'>Thread Statistics</span><div class='list-group'>"+
	"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Interations</span>"+
						"<span class='twPc-StatValue'>"+interactions+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Replies</span>"+
						"<span class='twPc-StatValue'>"+replies+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Positive Sentiment</span>"+
						"<span class='twPc-StatValue'>"+positivePosts+" posts</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Negative Sentiment</span>"+
						"<span class='twPc-StatValue'>"+negativePosts+" posts</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div></div<";
	
        document.getElementById(target).appendChild(aNewItem);

}

function renderThreadGrowth(thread, target) {

	var growth1h = thread.statisicalData['growth1h'];
	var growth30m = thread.statisicalData['growth30m'];
	var growth10m = thread.statisicalData['growth10m'];
	var sharedCount = thread.statisicalData['sharedCount'];
	
	var shareTrend = "Finished";
	if ((parseFloat(thread.statisicalData.growth10m)<5)) {
		shareTrend = "Low Activity";
	}
	if ((parseFloat(thread.statisicalData.growth10m)>=5)) {
		shareTrend = "Active";
	}
	if ((parseFloat(thread.statisicalData.growth30m)*2)>parseFloat(sharedCount)) {
		shareTrend = "Bursting";
	}

	var aNewItem = document.createElement('div');
        aNewItem.innerHTML = "<span class='label label-default'>Activity Statistics</span><div class='list-group'>"+
	"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>10min Activity</span>"+
						"<span class='twPc-StatValue'>"+growth10m+" posts</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>30min Activity</span>"+
						"<span class='twPc-StatValue'>"+growth30m+" posts</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Spread</span>"+
						"<span class='twPc-StatValue'>"+growth1h+" posts/hour</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Status</span>"+
						"<span class='twPc-StatValue'>"+shareTrend+"</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div></div<";
	
        document.getElementById(target).appendChild(aNewItem);

}

function renderRISFInfo(thread, target) {

	var doubtScore = thread.statisicalData['doubtScore'];
	var threadsize = thread.statisicalData['threadsize'];
	var credibleScore = thread.statisicalData['credibleScore'];
	
	var credibilityLabel = "Low";
	if (parseFloat(credibleScore)>(parseFloat(threadsize)/4)) credibilityLabel = "Medium";
	if (parseFloat(credibleScore)>(parseFloat(threadsize)/2)) credibilityLabel = "High";


	var doubtLabel = "Low";
	if (parseFloat(doubtScore)>(parseFloat(threadsize)/4)) doubtLabel = "Medium";
	if (parseFloat(doubtScore)>(parseFloat(threadsize)/2)) doubtLabel = "High";


	var aNewItem = document.createElement('div');
        aNewItem.innerHTML = "<span class='label label-default'>Rumour / Credibility Analysis</span><div class='list-group'>"+
	"<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Aggregate Doubt Level</span>"+
						"<span class='twPc-StatValue'>"+parseFloat(doubtScore).toFixed(2)+" ("+doubtLabel+")</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Aggregate Credibility</span>"+
						"<span class='twPc-StatValue'>"+parseFloat(credibleScore).toFixed(2)+" ("+credibilityLabel+")</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div></div<";
	
        document.getElementById(target).appendChild(aNewItem);

}


function renderReplies(thread, target) {

	var replies = thread.replies;

	var timeline = document.createElement('div');

	addTimelineLine();


	var previousDateUnix = parseFloat(thread.sourcePost.timestamp)/1000;
	var previousDate = time10minConverter(previousDateUnix);
	//addTimelineTimestamp(previousDate);

	addTimelineItemMedia(thread.sourcePost)	

	
	

	for ( var i = 0; i < replies.length; i++ ) {
		var replyPost = replies[i];

		var currentDateUnix = parseFloat(replyPost.timestamp)/1000;
		var currentDate = time10minConverter(currentDateUnix);
		if (currentDate===previousDate) {
			// do nothing
		} else {
			addTimelineTimestamp(currentDate+" (+"+timeDiff(previousDateUnix, currentDateUnix)+")");
			previousDate = currentDate;
		}
		

		addTimelineItem(replyPost);
		addTimelineItemMedia(replyPost)
	}

	

	timeline.innerHTML = "<span class='label label-default'>Thread Timeline</span><div class='timeline'>"+timelineBuffer+"</div>";

	document.getElementById(target).appendChild(timeline);

}

var timelineBuffer = "";

function addTimelineItem(post) {

	var text  = post.text;
	var retweets = 	post.metadata['retweet_count'];

	var verified = post.metadata['user.verified'];
	if (verified==="true") verified="<span class='glyphicon glyphicon-ok-sign' aria-hidden='true'></span>";
	else verified="<span class='glyphicon glyphicon-remove-sign' aria-hidden='true'></span>";

	var friends = post.metadata['user.friends_count'];
	var followers = post.metadata['user.friends_count'];
	var statuses = post.metadata['user.statuses_count'];
	var userCreatedAt = post.metadata['user.created_at'];

	var doubt = parseFloat(post.metadata['risf.doubt.1']);
	if (doubt>0.6) doubt="<span class='glyphicon glyphicon-question-sign' aria-hidden='true'></span>";
	else doubt="<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>";


	var credibility = post.metadata['risf.credibility.label'];
	if (credibility==="unverified") credibility="<font color='red'>Low</font>";
	else credibility="<font color='green'>Medium</font>";;

	var sentiment = post.metadata.sentiment;
	if (sentiment==="positive") sentiment="<font color='green'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></font>";
	else if (sentiment==="negative") sentiment="<font color='red'><span class='glyphicon glyphicon-thumbs-down' aria-hidden='true'></span></font>";
	else if (sentiment==="neutral") sentiment="<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>";


	var html = "<article class='panel panel-primary'>"+
            "<div class='panel-heading icon'>"+
                "<i class='glyphicon glyphicon-comment'></i>"+
            "</div>"+
            "<div class='panel-body'>"+
                text+
                "<div class='twPc-divStats'>"+
			"<ul class='twPc-Arrange'>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Verified</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+verified+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Retweets</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+retweets+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Doubt</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+doubt+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Credibility</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+credibility	+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>Sentiment</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+sentiment+"</span>"+
					"</a>"+
				"</li>"+
				"<li class='twPc-ArrangeSizeFit'>"+
					"<a href=''>"+
						"<span class='twPc-StatLabel twPc-block'>User Followers</span>"+
						"<span class='twPc-StatValue' style='font-size: 14px'>"+followers+"</span>"+
					"</a>"+
				"</li>"+
			"</ul>"+
		"</div>"+
	     "</div>"+
        "</article>";

	timelineBuffer =timelineBuffer+html;	

}

function addTimelineItemMedia(post) {

	if (post.metadata.hasOwnProperty('entities.media')) {

		var mediaArray = JSON.parse(post.metadata['entities.media']);

		for ( var i = 0; i < mediaArray.length; i++ ) {

			var mediaItem = mediaArray[i];

			var transformedURL = mediaItem.media_url.replace("http://", "").replace(".", "_").replace(".", "_").replace(".", "_").replace(".", "_").replace(".", "_"); ; 

			if (document.getElementById(transformedURL)===null) {

				if (mediaItem.type==="photo") {

				var photo = "<article class='panel panel-primary'>"+
            					"<div class='panel-heading icon'>"+
                					"<i class='glyphicon glyphicon-picture'></i>"+
            					"</div>"+
            					"<div class='panel-body'>"+
							"<div class='fff'><div id='"+transformedURL+"' class='thumbnail'><a href='"+mediaItem.media_url+"'><img src='"+mediaItem.media_url+"' alt=''></a></div>"+
						"</div>"+
        				     "</article>";

				timelineBuffer =timelineBuffer+photo;

				}

			}

			
		}
	}

}

function addTimelineLine() {

	var html = "<div class='line text-muted'></div>";

	timelineBuffer =timelineBuffer+html;

}

function addTimelineTimestamp(time) {

	var html = "<div class='separator text-muted'><time>"+time+"</time></div>";

	timelineBuffer =timelineBuffer+html;

}

function time10minConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  if (hour < 10) hour = "0"+hour;
  var min = a.getMinutes();
  if (min < 10) min = "0";
  else min = (""+(min/10)).substring(0,1)+"0";
  if (min==="0") min = "00";
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
  return time;
}

function timeDiff( tstart, tend ) {
  var diff = Math.floor((tend - tstart)), units = [
    { d: 60, l: "seconds" },
    { d: 60, l: "minutes" },
    { d: 24, l: "hours" },
    { d: 7, l: "days" }
  ];

  var s = '';
  for (var i = 0; i < units.length; ++i) {
    if ((diff % units[i].d)>0) s = (diff % units[i].d) + " " + units[i].l + " " + s;
    diff = Math.floor(diff / units[i].d);
  }
  return s;
}

