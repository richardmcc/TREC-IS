var rumour1 = '{"identifier":"524922729485848576", "text":"Only photo I will tweet. CPR being performed on the soldier now. I heard four shots. #ottawa http:\/\/t.co\/cqdw1yx8AI", "image":"http://pbs.twimg.com/media/B0jmakYIEAEgg7S.jpg"}';
var rumour2 = '{"identifier":"524923462398513152", "text":"Shots fired on parliament hill after a man walked up with a gun. I\'m locked in a security office on parliament hill", "image":"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg"}';
var rumour3 = '{"identifier":"524923676484177920", "text":"BREAKING - Shooting on Parliament Hill. RCMP have weapons drawn #cdnpoli http:\/\/t.co\/38qOgXcuet", "image":"http://pbs.twimg.com/media/B0jnTWlIAAEAkrw.jpg"}';
var rumour4 = '{"identifier":"524924619812511746", "text":"Witness tells #CBCNews suspected shooter of uniformed soldier at #Ottawa\'s War Memorial was carrying rifle.", "image":"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg"}';
var rumour5 = '{"identifier":"524925050739490816", "text":"BREAKING NEWS: Soldier shot at National War Memorial in Ottawa http:\/\/t.co\/pp6hcfWcRwT", "image":"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg"}';
var rumour6 = '{"identifier":"524983581983375360", "text":"Police now say there were two shooting incidents in Ottawa: one at the war memorial, the other on Parliament Hill. http://t.co/q98AMohu7T", "image":"http://dcs.gla.ac.uk/~richardm/rumours/no_image_available.jpg"}';

function loadAllRumours() {
	loadThreadsDTTS("524922729485848576.thread");
	loadThreadsDTTS("524923462398513152.thread");
	loadThreadsDTTS("524923676484177920.thread");
	loadThreadsDTTS("524924619812511746.thread");
	loadThreadsDTTS("524925050739490816.thread");
	loadThreadsDTTS("524925215235911680.thread");
	loadThreadsDTTS("524925730053181440.thread");
	loadThreadsDTTS("524925987239120897.thread");
	loadThreadsDTTS("524926235030589440.thread");
	loadThreadsDTTS("524926472432410625.thread");
	loadThreadsDTTS("524927281048080385.thread");
	loadThreadsDTTS("524929497205055488.thread");
	loadThreadsDTTS("524931324763992064.thread");
	loadThreadsDTTS("524932056560963584.thread");
	loadThreadsDTTS("524932935137628160.thread");
	loadThreadsDTTS("524935485370929152.thread");
	loadThreadsDTTS("524936872666353664.thread");
	loadThreadsDTTS("524937542131793920.thread");
	loadThreadsDTTS("524940659778920448.thread");
	loadThreadsDTTS("524941132237910016.thread");
	loadThreadsDTTS("524942470472548352.thread");
	loadThreadsDTTS("524943490887991296.thread");
	loadThreadsDTTS("524944399890124801.thread");
	loadThreadsDTTS("524947416869388288.thread");
	loadThreadsDTTS("524947674164760577.thread");
	loadThreadsDTTS("524947867975561216.thread");
	loadThreadsDTTS("524948866773184512.thread");
	loadThreadsDTTS("524949443607412737.thread");
	loadThreadsDTTS("524952883343925249.thread");
	loadThreadsDTTS("524956129017995264.thread");
	loadThreadsDTTS("524959809402331137.thread");
	loadThreadsDTTS("524962142563610625.thread");
	loadThreadsDTTS("524964948683005952.thread");
	loadThreadsDTTS("524965775036387329.thread");
	loadThreadsDTTS("524966904885428226.thread");
	loadThreadsDTTS("524969201102901248.thread");
	loadThreadsDTTS("524970851675176960.thread");
	loadThreadsDTTS("524972443308683264.thread");
	loadThreadsDTTS("524975705206304769.thread");
	loadThreadsDTTS("524980744658382848.thread");
	loadThreadsDTTS("524981436252950528.thread");
	loadThreadsDTTS("524983581983375360.thread");
	loadThreadsDTTS("524990163446140928.thread");
	loadThreadsDTTS("524991576163250176.thread");
	loadThreadsDTTS("524993533212897281.thread");
	loadThreadsDTTS("524995771587108864.thread");
	loadThreadsDTTS("525003468659228672.thread");
	loadThreadsDTTS("525019752507658240.thread");
	loadThreadsDTTS("525023025792835585.thread");
	loadThreadsDTTS("525025279803424768.thread");
	loadThreadsDTTS("525025463648137216.thread");
	loadThreadsDTTS("525028734991343617.thread");
	loadThreadsDTTS("525032872647065600.thread");
	loadThreadsDTTS("525049639016615937.thread");
	loadThreadsDTTS("525056576038518785.thread");
	loadThreadsDTTS("525058976376193024.thread");
	loadThreadsDTTS("525060425184858112.thread");
	loadThreadsDTTS("525068915068923904.thread");

}


var jsonThreads;



function loadThreadsDTTS(filename) {

	$.getJSON("data/"+filename, function(json) {
    		//console.log(json); // this will show the info it in firebug console

		loadItem(json);

	});
}



