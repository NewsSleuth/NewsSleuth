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
	var commentIgnore = false;
	var comment = 0;
	var fileIgnore = false;
	var limit = 100000
	for(var i = 0; count < limit && i < data.length; i++){
		
		if(data[i] === '\'' && data[i+1] === '\'' && data[i+2] === '\''){
			apostropheIgnore = true;
		}
		if(data[i-1] === '\'' && data[i-2] === '\'' && data[i-3] === '\''){
			apostropheIgnore = false;
		}
		if(data[i-1] === '}' && data[i-2] === '}'){
			braces--;
			if(data[i-3] === '}'){
				braces += .5;
			}
		}
		if(data[i] === '{' && data[i+1] ==='{'){
			braces++;
		}
		if(data[i-1] === '>' && data[i-2] === 'f' && data[i-3] === 'e' && data[i-4] === 'r' && data[i-5] === '/' && data[i-6] === '<'){
			tag--;
		}
		if(tag > 0 && data[i-1] === '>' && data[i-2] === '/'){
			tag--;
		}
		if(data[i] === '<' && data[i+1] === 'r' && data[i+2] === 'e' && data[i+3] === 'f'){
			tag++;
		}
		if(data[i] === '[' && data[i+1] === '['){
			brackets++;
			if(data[i+2] === 'F' && data[i+3] === 'i' && data[i+4] === 'l' && data[i+5] === 'e' && data[i+6] === ':'){
				fileIgnore = true;
			}
		}
		if(data[i-1] === ']' && data[i-2] === ']'){
			brackets--;
			if(data[i-3] === ']'){
				brackets += .5;
			}
			if(brackets === 0){
				fileIgnore = false;
			}
		}
		if(data[i] === '<' && data[i+1] === '!' && data[i+2] === '-' && data[i+3] === '-'){
			comment++;
		}
		if(data[i-1] === '>' && data[i-2] === '-' && data[i-3] === '-'){
			comment--;
		}
		if(braces === 0){
			braceIgnore = false;
		}
		else braceIgnore = true;
		if(tag === 0){
			tagIgnore = false;
		}
		else tagIgnore = true;
		if(comment === 0){
			commentIgnore = false;
		}
		else commentIgnore = true;
		if(brackets === 0){
			bracketIgnore = false;
		}
		else{
			if(tagIgnore === false && fileIgnore === false && braceIgnore === false && apostropheIgnore === false){
			}
			else{
				bracketIgnore = true;
			}
		}

		if(fileIgnore === false && tagIgnore === false && bracketIgnore === false && braceIgnore === false && apostropheIgnore === false && commentIgnore === false){
			result = String.concat(result, data[i]);
			count++;
		}
	}
	dump("\ni: " + i + "\n");
	dump("\ncount: " + count + "\n");
	return result;
}

function removeBrackets(data){

	dump("removing brackets\n");
	var result = new String("");
	var placeholder = new String("");
	var brackets = 0;
	var bracketIgnore = false;

	for(var i = 0; i < data.length; i++){
		if(data[i] === '[' && data[i+1] === '['){
			brackets++;
		}
		if(data[i-1] === ']' && data[i-2] === ']'){
			brackets--;
			if(brackets === 0){
				result = String.concat(result, placeholder);
				placeholder = new String("");
			}
		}
		if(brackets > 0){
			bracketIgnore = true;
		}else bracketIgnore = false;
		if(bracketIgnore === false){
			result = String.concat(result, data[i]);
		}
		else{
			if(data[i] === '[' || data[i] === ']'){
			}
			else if(data[i] === '|'){
				placeholder = new String("");
			}
			else{
				placeholder = String.concat(placeholder, data[i]);
			}
		}
	}
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



function callWikipediaAPI(wikipediaPage) {
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
	
	var doc = content.document;
	
	var StoredInfo = doc.getElementById('HiddenInfo');	
	if (StoredInfo.value === 'none')
	{
		var result;
		var remoteApi = JsMwApi("http://en.wikipedia.org/w/api.php", "local");
		dump("inside if block\n");
		remoteApi({action: "query", prop: "revisions", rvprop: "content", titles: wikipediaPage}, function (res){
			dump("inside callback for jsmwapi\n");
			for(var page in res.query.pages){
				//alert(res.query.pages[page].title);
				dump("page: " + page);
				if (page === '-1') {
					//alert("negative page");
					StoredInfo.value = 'nopage';
					DisplayAuthorInfo('nopage');
					return;
				}
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
				result = parseFirstThou(data);
				result = removeBrackets(result);
				dump("result:\n" + result + "\n");
				result = firstP(result);
				dump("first paragraph: \n" + result + "\n");

				StoredInfo.value = result;
							
				if (popup)
				{
					AuthorWindow(wikipediaPage, result);
				}
				else
				{
					DisplayAuthorInfo (result);
				}
			}
		});
	
	}
	else
	{
		// alert("Stored: " + StoredInfo);
		if (popup)
		{
			AuthorWindow(wikipediaPage, StoredInfo.value);
		}
		else
		{
			DisplayAuthorInfo (StoredInfo.value);
		}
	}
	
	
	//dummy
	dump("gotJSON()\n");
}

function fixAuthor(data){

	for(x in data){
		dump(x + "\n\t" + data[x]);
	}
	dump("\n" + data.length + "\n");
	var res = new String("");
	dump(data.charAt(0));
	res = String.concat(res, String.toUpperCase(data.charAt(0)));
	for(var i = 1; i < data.length; i++){
		if(data.charAt(i-1) === ' '){
			res = String.concat(res, String.toUpperCase(data.charAt(i)));
		}
		else{
			res = String.concat(res, String.toLowerCase(data.charAt(i)));
		}
	}
	dump("res: " + res + "\n");
	return res;
}
function AuthorId (  ) {return "AuthorParagraph"; }
