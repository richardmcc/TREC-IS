
function renderDoubtStartButton(targetdiv, id, text, currentevent, assessed) {
	
	var aNewItem = document.createElement('div');
	aNewItem.setAttribute("id", id);
	aNewItem.setAttribute("text", text);
	if (assessed === "true") {
		aNewItem.setAttribute("assessed", "true");
		aNewItem.innerHTML = ""+
		"<ul class=\"list-group\"><li class=\"list-group-item\"><div class='btn-group' role='group' aria-label='...' style='padding-top: 5px'>"+
			"<button type='button' id=\"button-"+id+"\" class='btn btn-success' onclick='renderDoubtForm(\""+id+"\", \""+currentevent+"\")'>Already Assessed</button>" +
		"</div></li></ul>";
	} else {
		aNewItem.setAttribute("assessed", "false");
		aNewItem.innerHTML = ""+
		"<ul class=\"list-group\"><li class=\"list-group-item\"><div class='btn-group' role='group' aria-label='...' style='padding-top: 5px'>"+
			"<button type='button' id=\"button-"+id+"\" class='btn btn-danger' onclick='renderDoubtForm(\""+id+"\", \""+currentevent+"\")'>Click to Assess</button>" +
		"</div></li></ul>";
	}
	
	
	targetdiv.appendChild(aNewItem);
}


function renderDoubtForm(id, currentevent) {

		var button = document.getElementById(id);
		var text = button.getAttribute("text");
	
		var inputs = "<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p>To what degree do you trust the information expressed in the post?"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Evaluating Trust' data-placement='right' data-trigger='hover' data-content='We are looking for a subjective judgement here on the degree to which you would trust the information contained. Hint: you can click the source post text to open the tweet in Twitter, which shows more information (will be disabled in deployment)'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a></p>"+
			"<div class=\"form-group\" style=\"height: 30px\">"+
				"<label for=\"select\" class=\"col-lg-2 control-label\">Trust:<font color='red'>*</font></label>"+
				"<div class=\"col-lg-10\">"+
					"<select class=\"form-control\" id=\"doubtSelect-"+id+"\">"+
						"<option>Strongly Trust</option>"+
						"<option>Weak Trust</option>"+
						"<option>Neither Trust or Distrust</option>"+
						"<option>Weak Distrust</option>"+
						"<option>Strongly Distrust</option>"+
					"</select>"+
				"</div>"+
			"</div>" +
			"<div class=\"form-group has-primary\">"+
			  "<label class=\"control-label\" for=\"focusedInput\">Relevant Phrases?</label>"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Trust Phrases' data-placement='right' data-trigger='hover' data-content='When previously annotating events in English, we noted that there were common formulations or phrases that made it easy to doubt information in the text, e.g. phrases like \"are you sure\". If you note similar phrases in the texts, then copy and paste them into here.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a>"+
			  "<input class=\"form-control\" id=\"trustText-"+id+"\" value=\"None\" type=\"text\">"+
			"</div>"+
			"</li>"+
			"</ul>"+
			""+
			"<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p>Does the post express any sentiment?</p>"+
			"<div class=\"form-group\" style=\"height: 30px\">"+
				"<label for=\"select\" class=\"col-lg-5 control-label\">Sentiment:<font color='red'>*</font></label>"+
				"<div class=\"col-lg-7\">"+
					"<select class=\"form-control\" id=\"sentimentSelect-"+id+"\">"+
						"<option>No sentiment</option>"+
						"<option>Positive</option>"+
						"<option>Negative</option>"+
					"</select>"+
				"</div>"+
			"</div>" +
			"<div class=\"form-group has-primary\">"+
			  "<label class=\"control-label\" for=\"focusedInput\">Sentiment Subject?</label>"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Sentiment Subjects' data-placement='right' data-trigger='hover' data-content='By subject, we mean a person or organisation that the user is expressing sentiment about in the post. Only fill this in if postive/negative sentiment is being expressed and that sentiment has a defined target.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a>"+
			  "<input class=\"form-control\" id=\"sentimentSubjectText-"+id+"\" value=\"None\" type=\"text\">"+
			"</div>"+
			"</li>"+
			"</ul>"+
			"<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p><font size='2'><b><font color='red'>*</font></b>: Required</font></p>"+
			"</li>"+
			"</ul>";
	
 		vex.dialog.open({
            message: text,
            input: '' +
            	inputs+
            '',
            callback: function (data) {
            	if (!data) {
                    return console.log('Cancelled')
                }
            	
            	
            	var select1 = document.getElementById("doubtSelect-"+id);
            	var value1 = select1.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "threadlabel",
                    event: currentevent,
                    thread: id,
                    type: "doubt",
                    label: value1
                }));
            	
            	var select2 = document.getElementById("sentimentSelect-"+id);
            	var value2 = select2.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "threadlabel",
                    event: currentevent,
                    thread: id,
                    type: "sentiment",
                    label: value2
                }));
            	
            	var select3 = document.getElementById("sentimentSubjectText-"+id);
            	var value3 = select3.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "threadlabel",
                    event: currentevent,
                    thread: id,
                    type: "sentimentSubject",
                    label: value3
                }));
            	
            	var select4 = document.getElementById("trustText-"+id);
            	var value4 = select4.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "threadlabel",
                    event: currentevent,
                    thread: id,
                    type: "trustPhrase",
                    label: value4
                }));
            	
            	
            	var button = document.getElementById("button-"+id);
            	button.className = "btn btn-success";
            	button.innerHTML = "Already Assessed";
            	button.setAttribute("assessed", "true")
            }
        });
 		
 		$(document).ready(function(){
		       $('[data-toggle="popover"]').popover();
		   });	
		
	
}




function renderPostStartButton(targetdiv, id, text, currentevent, assessed) {
	
	var aNewItem = document.createElement('div');
	aNewItem.setAttribute("id", id);
	aNewItem.setAttribute("text", text);
	if (assessed === "true") {
		aNewItem.setAttribute("assessed", "true");
		aNewItem.innerHTML = ""+
		"<ul class=\"list-group\"><li class=\"list-group-item\"><div class='btn-group' role='group' aria-label='...' style='padding-top: 5px'>"+
			"<button type='button' id=\"button-"+id+"\" class='btn btn-success' onclick='renderDoubtForm(\""+id+"\", \""+currentevent+"\")'>Already Assessed</button>" +
		"</div></li></ul>";
	} else {
		aNewItem.setAttribute("assessed", "false");
		aNewItem.innerHTML = ""+
		"<ul class=\"list-group\"><li class=\"list-group-item\"><div class='btn-group' role='group' aria-label='...' style='padding-top: 5px'>"+
			"<button type='button' id=\"button-"+id+"\" class='btn btn-danger' onclick='renderPostForm(\""+id+"\", \""+currentevent+"\")'>Click to Assess</button>" +
		"</div></li></ul>";
	}
	
	
	targetdiv.appendChild(aNewItem);
}


function renderPostForm(id, currentevent) {

		var button = document.getElementById(id);
		var text = button.getAttribute("text");
	
		var inputs = "<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p>Does this post support or deny information in the source post?"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Relation To Source' data-placement='right' data-trigger='hover' data-content='We are looking for a to know whether the post actively supports or denies information in the source post. For example, maybe the post provides supporting evidence, or the user questions the veracity of the source post.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a></p>"+
			"<div class=\"form-group\" style=\"height: 30px\">"+
				"<label for=\"select\" class=\"col-lg-4 control-label\">Relation:<font color='red'>*</font></label>"+
				"<div class=\"col-lg-8\">"+
					"<select class=\"form-control\" id=\"doubtSelect-"+id+"\">"+
						"<option>None of the Below</option>"+
						"<option>Supports</option>"+
						"<option>Denies</option>"+
						"<option>Expresses Doubt</option>"+
						"<option>Requests Clarification</option>"+
					"</select>"+
				"</div>"+
			"</div>" +
			"<div class=\"form-group has-primary\">"+
			  "<label class=\"control-label\" for=\"focusedInput\">Relevant Phrases?</label>"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Support/Denial Phrases' data-placement='right' data-trigger='hover' data-content='In a similar way to the trust question, if you note any common formulations or phrases that make it obvious that the post is supporting or denying information, then copy and paste them into here.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a>"+
			  "<input class=\"form-control\" id=\"relationText-"+id+"\" value=\"None\" type=\"text\">"+
			"</div>"+
			"</li>"+
			"</ul>"+
			""+
			"<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p>Does the post express any sentiment?</p>"+
			"<div class=\"form-group\" style=\"height: 30px\">"+
				"<label for=\"select\" class=\"col-lg-5 control-label\">Sentiment:<font color='red'>*</font></label>"+
				"<div class=\"col-lg-7\">"+
					"<select class=\"form-control\" id=\"sentimentSelect-"+id+"\">"+
						"<option>No sentiment</option>"+
						"<option>Positive</option>"+
						"<option>Negative</option>"+
					"</select>"+
				"</div>"+
			"</div>" +
			"<div class=\"form-group has-primary\">"+
			  "<label class=\"control-label\" for=\"focusedInput\">Sentiment Subject?</label>"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Sentiment Subjects' data-placement='right' data-trigger='hover' data-content='By subject, we mean a person or organisation that the user is expressing sentiment about in the post. Only fill this in if postive/negative sentiment is being expressed and that sentiment has a defined target.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a>"+
			  "<input class=\"form-control\" id=\"sentimentSubjectText-"+id+"\" value=\"None\" type=\"text\">"+
			"</div>"+
			"</li>"+
			"</ul>"+
			""+
			"<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p>Is the tweet credible/trustworthy?"+"<a style='padding-left: 10px' href='#' data-toggle='popover' title='Estimating Credibiility' data-placement='right' data-trigger='hover' data-content='We are looking for a subjective view on whether you think the post is credible. We have provided some common credibility classes here for you to choose from. Credible: First-Hand Report - the user is providing a first-hand report. Credible: Expert - the post is credible because the poster appears to be an expert.  Credible: Competence - the post appears to be credible because of the users behavior. Credible: Goodwill - the post appears credible because the author has your best interest in mind. Credible: Linked Evidence - the post is credible because external evidence is linked to.'><span id='infoStream' class='glyphicon glyphicon-info-sign' aria-hidden='true'></span></a></p>"+
			"<div class=\"form-group\" style=\"height: 30px\">"+
				"<label for=\"select\" class=\"col-lg-4 control-label\">Credibility:<font color='red'>*</font></label>"+
				"<div class=\"col-lg-8\">"+
					"<select class=\"form-control\" id=\"credSelect-"+id+"\">"+
						"<option>Unable to tell/Not applicable</option>"+
						"<option>Not Credible</option>"+
						"<option>Credible: First-Hand Report</option>"+
						"<option>Credible: Expert</option>"+
						"<option>Credible: Competence</option>"+
						"<option>Credible: Goodwill</option>"+
						"<option>Credible: Linked Evidence</option>"+
					"</select>"+
				"</div>"+
			"</div>" +
			"</li>"+
			"</ul>"+
			"<ul class=\"list-group\">"+
			"<li class=\"list-group-item\">"+
			"<p><font size='2'><b><font color='red'>*</font></b>: Required</font></p>"+
			"</li>"+
			"</ul>";
	
 		vex.dialog.open({
            message: text,
            input: '' +
            	inputs+
            '',
            callback: function (data) {
            	if (!data) {
                    return console.log('Cancelled')
                }
            	
            	
            	var select1 = document.getElementById("doubtSelect-"+id);
            	var value1 = select1.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "postlabel",
                    event: currentevent,
                    thread: id,
                    type: "doubtrelation",
                    label: value1
                }));
            	
            	var select2 = document.getElementById("sentimentSelect-"+id);
            	var value2 = select2.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "postlabel",
                    event: currentevent,
                    thread: id,
                    type: "sentiment",
                    label: value2
                }));
            	
            	var select3 = document.getElementById("sentimentSubjectText-"+id);
            	var value3 = select3.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "postlabel",
                    event: currentevent,
                    thread: id,
                    type: "sentimentSubject",
                    label: value3
                }));
            	
            	var select4 = document.getElementById("credSelect-"+id);
            	var value4 = select4.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "postlabel",
                    event: currentevent,
                    thread: id,
                    type: "credibility",
                    label: value4
                }));
            	
            	var select5 = document.getElementById("relationText-"+id);
            	var value5 = select5.value;
            	//console.log(value1);
            	
            	ws.send(JSON.stringify({
                    messagetype: "postlabel",
                    event: currentevent,
                    thread: id,
                    type: "relationPhrases",
                    label: value5
                }));
            	
            	var button = document.getElementById("button-"+id);
            	button.className = "btn btn-success";
            	button.innerHTML = "Already Assessed";
            	button.setAttribute("assessed", "true")
            }
        });
		
 		$(document).ready(function(){
		       $('[data-toggle="popover"]').popover();
		   });	
}
