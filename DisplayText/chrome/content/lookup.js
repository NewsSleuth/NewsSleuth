let DisplayText = {
	onCommand: function(event){

//jquery = loadjQuery(iangardiner);
	 
		// Append text to end of web page
		var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
	 
		// Create a new window to display text
/*		my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
		//my_window = window.open("", "mywindow1");
		var headertext2 = content.document.createTextNode("Popup window information")
		my_window.content.document.body.appendChild(headertext2)
*/
		dump("Text displayed\n");

		// Add text after first 'h1' element of page
		var doc = content.document;
		var theNewParagraph = doc.createElement('p');
		var theTextOfTheParagraph = doc.createTextNode('Some content.');
		theNewParagraph.appendChild(theTextOfTheParagraph);
		var header = doc.getElementsByTagName("h1");
		//header[0].appendChild(theNewParagraph);

		dump("about to call wikipedia\n");
		
		callWikipediaAPI("Bill Clinton");

	}
};


function callWikipediaAPI(wikipediaPage, TitleElement, author) {

	dump("callWikipediaAPI\n");
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse

	var remoteApi = JsMwApi("http://en.wikipedia.org/w/api.php", "local");
	remoteApi({action: "query", prop: "revisions", rvprop: "content", titles: wikipediaPage}, function (res, TitleElement, author){ 
		dump("inside callback for jsmwapi\n");
	    for(var page in res.query.pages){
	        //alert(res.query.pages[page].title);
			dump("page: " + page);
			for(x in res.query.pages[page]){
				dump(x + "\n\t" + res.query.pages[page][x] + "\n");
			}
			for(x in res.query.pages[page]["revisions"]){
				dump("\t" + x + "\n\t\t" + res.query.pages[page]["revisions"][x] + "\n");
				for(y in res.query.pages[page]["revisions"][x]){
					//dump("\t\t" + y + "\n\t\t" + res.query.pages[page]["revisions"][x][y] + "\n");
				}
			}
			var data;
			var count = 0;
			for(i in res.query.pages[page]["revisions"][0]){
				data = res.query.pages[page]["revisions"][0][i];
				for(j in res.query.pages[page]["revisions"][0][i]){
					//data[count++] = res.query.pages[page]["revisions"][0][i][j];
				}
			}
			var result = parseFirstThou(data);
			dump("result:\n" + result + "\n");
			result = firstP(result);
			dump("first paragraph: \n" + result + "\n");
			author.AuthorInfo = result;
			//TitleElement.
			dump("changed AuthorInfo\n");
		}
	});

	dump("gotJSON()\n");
}

function parseFirstThou(data){

	var result = new String("");
	var placeholder = new String("");
	var count = 0;
	var braceIgnore = false;
	var bracketIgnore = false;
	var tagIgnore = false;
	var apostropheIgnore = false;
	var brackets = 0;
	var braces = 0;
	var tag = 0;
	var file = 0;
	for(var i = 0; count < 3000 && i < data.length; i++){
		
		if(data[i] === '\'' && data[i+1] === '\'' && data[i+2] === '\''){
			apostropheIgnore = true;
		}
		if(data[i-1] === '\'' && data[i-2] === '\'' && data[i-3] === '\''){
			apostropheIgnore = false;
		}
		if(data[i-1] === '}' && data[i-2] === '}'){
			braces--;
		}
		if(data[i] === '{' && data[i+1] ==='{'){
			braces++;
		}
		if(data[i-1] === '>' && data[i-2] === 'f' && data[i-3] === 'e' && data[i-4] === 'r' && data[i-5] === '/' && data[i-6] === '<'){
			tag--;
		}
		if(data[i] === '<' && data[i+1] === 'r' && data[i+2] === 'e' && data[i+3] === 'f' && data[i+4] === '>'){
			tag++;
		}
		if(data[i] === '[' && data[i+1] === '['){
			brackets++;
		}
		if(data[i-1] === ']' && data[i-2] === ']'){
			brackets--;
		}
		if(braces === 0){
			braceIgnore = false;
		}
		else braceIgnore = true;
		if(tag === 0){
			tagIgnore = false;
		}
		else tagIgnore = true;
		if(brackets === 0){
			bracketIgnore = false;
		}
		else{
			if(tagIgnore === false && braceIgnore === false && apostropheIgnore === false){
			}
			else{
				bracketIgnore = true;
			}
		}

		if(tagIgnore === false && bracketIgnore === false && braceIgnore === false && apostropheIgnore === false){
			result = String.concat(result, data[i]);
			count++;
		}
	}
	dump("\ncount: " + count + "\n");
	return result;
}


function firstP(data){
	var result = new String("");
	var beginning = true;
	for(var i = 0; i < data.length; i++){
		if(beginning && (data.charAt(i) === '\n' || data.charAt(i) === '\t' || data.charAt(i) === '\ ')){
			dump("space\n");
		}
		else if(beginning === false && data.charAt(i) != '\n'){
			result = String.concat(result, data.charAt(i));
		}
		else if(beginning){
			beginning = false;
			result = String.concat(result, data.charAt(i));
		}
		else{
			dump("break\n");
			break;
		}
	}
	return result;
}


