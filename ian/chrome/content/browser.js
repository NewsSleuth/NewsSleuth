let DisplayText = {
	onCommand: function(event){

//jquery = loadjQuery(iangardiner);
	 
		// Append text to end of web page
/*		var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
*/	 
		// Create a new window to display text
		my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
		//my_window = window.open("", "mywindow1");
		var headertext2 = content.document.createTextNode("Popup window information")
		my_window.content.document.body.appendChild(headertext2)

		dump("Text displayed\n");

		// Add text after first 'h1' element of page
		var doc = content.document;
		var theNewParagraph = doc.createElement('p');
		var theTextOfTheParagraph = doc.createTextNode('Some content.');
		theNewParagraph.appendChild(theTextOfTheParagraph);
		var header = doc.getElementsByTagName("h1");
		//header[0].appendChild(theNewParagraph);

		dump("about to call wikipedia\n");
		
		callWikipediaAPI("Gregg Hartsuff");

	}
};


var wikipediaHTMLResult = function(data) {
	dump("wikipediaHTMLResult\n");
/*	document.write("<p>Inside callback</p>");
	document.write("Text data: " + data);
	var readData;
	var i = 0;
	for(x in data){
		for(y in data[x]){
			for(z in data[x][y]){
				readData += data[x][y][z];
			}
		}
	}
	var arrayData = jQuery.makeArray(readData);
	var newData = new Array();
	var ignore = false;
	var i = 0;
	for(x in readData){
		if(i > 100000){
			break;
		}
		i++;
		if(readData[x]=== '<'){
			ignore = true;
		}
		else if(readData[x] === '>'){
			ignore = false;
		}
		else if(readData[x]==='"'){
			if(ignore){
				newData[x] = "";
			}
			else{
				newData[x] = "&quot;";
			}
		}
		else{
			if(ignore){
				newData[x] = "";
			}
			else{
				newData[x] = readData[x];
			}
		}
	}
	i = 0;
	for(x in newData){
		document.write(newData[x]);
		i++;
	}
	document.write("<p>"+i+"</p>");
*/};
function callWikipediaAPI(wikipediaPage) {
/*	dump("var jQuery\n");
	var jQuery = jquery;
	var $ = function(selector,context){
		   return new jQuery.fn.init(selector,context||window._content.document);
	};
	dump("$.fn = $.prototype\n");
	$.fn = $.prototype = jQuery.fn;
	dump("iangardiner\n");
	env = window._content.document;
*/

	dump("callWikipediaAPI\n");
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
	$.getJSON("http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?", {page:wikipediaPage, prop:"text|images", uselang:"en"}, function() {dump("success?\n");} )
		.error(function() { dump("error?\n"); } );
//	jqxhr.error(function() {dump("error?\n");} );
//	dump(jqxhr + "\n");
	jqxhr = $.get('http://www.wikipedia.org/w/api.php?action=raw&prop=revisions$rvprop=content&format=xml&titles=Philosophy', function(data) {
			dump("success2?\n");
			for(x in data){
				dump(x + "\n");
				dump(jqxhr[x] + "\n");
				}
			dump("title: " + data.title + "\n");
			}, 'xml');
	$.ajax({
		url: "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?",
		dataType: 'json',
		data: {page:wikipediaPage, prop:"text|images", uselang:"en"},
		success: function() {dump("success in ajax");},
		error: function() {dump("error in ajax");}
	});
	var url = "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?";
	var page = "baseball"

	$.getJSON(url, { 
		  page: page, 
	    prop:"text|images", 
		  uselang:"en"
	  }, function(data) {
	    var $container = $("body")

	  // append title
	  $container.append(data['parse']['title']);

    // append page text
    $container.append(data['parse']['text']['*']);    

  // append images
	  var images = data['parse']['images'];
    $.each(images, function(i, src){
    // note: the path of these images is somewhat obscured
    // filenames are all that is supplied (no path)
    $container.append(src)
	dump("container: " + $container + "\n");
	  })
});

//	for(x in jqxhr){
//		dump(x + "\n");
//		dump(jqxhr[x] + "\n");
//	}
/*	var info = jquery.get('http://www.wikipedia.org/w/api.php?action=query&prop=revisions$rvprop=content&format=xml&titles=Main%20Page', function(data) {
			dump('Get1 was performed.\n');
			for(x in data){
				dump("\n\ndata from element " + x + ":\n" + data[x] + "\n");
				for(y in data[x]){
					dump("data from element " + y + " in " + x + ":\n" + data[x][y] + "\n");
					for(z in data[x][y]){
						dump(data[x][y][z] + x + y + z + "\n");
					}
				}
			}
		});
*/
/*	for(x in info){
		dump(x + "\n");
		//dump(info[x] + "\n");
		for(y in info[x]){
			dump(y + "\n");
		}
	}
*/	dump("gotJSON()\n");
}

function loadjQuery(context){
	dump("loadjQuery\n");
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://ian/content/jquery.js",context);
	
	dump("var jQuery =\n");
	var jQuery = window.jQuery.noConflict(true);
	dump("exiting1 loadjQuery\n");
	if( typeof(jQuery.fn._init) == 'undefined') { jQuery.fn._init = jQuery.fn.init; }
	dump("exiting2 loadjQuery\n");
	return jQuery;
}


