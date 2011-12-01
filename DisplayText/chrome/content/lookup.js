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
		else if(fileIgnore === false && tagIgnore === false && bracketIgnore === false && apostropheIgnore === false && commentIgnore === false){
			if(data[i] === '{' && data[i+1] === '{' && data[i+2] === 'q' && data[i+3] === 'u' && data[i+4] === 'o' && data[i+5] === 't' && data[i+6] === 'e'){
				result = String.concat(result, " rmvplz.");
			}
		}
	}
	dump("\ni: " + i + "\n");
	dump("\ncount: " + count + "\n");
	return result;
}

function removeBrackets(data)
{

	//dump("removing brackets\n");
	var result = new String("");
	var placeholder = new String("");
	var brackets = 0;
	var bracketIgnore = false;

	for(var i = 0; i < data.length; i++){
		if(data[i] === '&' && data[i+1] === 'm' && data[i+2] === 'd'){
			i += 7;
			result = String.concat(result, '-');
		}
		if(data[i] === '&' && data[i+1] === 'n' && data[i+2] === 'b'){
			i += 6;
			result = String.concat(result, '-');
		}
		if(data[i] === '&'){
			result = String.concat(result, "and");
			i += 1;
		}
		if(data[i] === '<' && data[i+1] === 'b' && data[i+2] === 'l' && data[i+3] === 'o'){
			i += 12;
			result = String.concat(result, '"');
		}
		if(data[i] === '<' && data[i+1] === '/' && data[i+2] === 'b' && data[i+3] === 'l' && data[i+4] === 'o'){
			i += 13;
			result = String.concat(result, '"');
		}
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
		if(data[i] === '\'' && data[i+1] === '\''){
			i++;
		}
		else if(bracketIgnore === false){
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

function controversiesP(data)
{
	dump("inside controversiesP\n");
	dump("data.length: " + data.length + "\n");
	firstParagraph = firstP(data);
	var controversyExists = false;
	var paragraph1 = new String("");
	var paragraph2 = new String("");
	var paragraph3 = new String("");
	var count = 0;
	var subHeading = false;
	var i = 0;
	var headingArray = new Array();
	var currentHeading;
	for(i = 0; i < data.length; i++){
		if(data[i] === '=' && data[i+1] === '='){
			if(data[i+2] === '='){
				i = i + 3;
				if(controversyExists){
					currentHeading = new String("");
					for(; data[i] != '=' || data[i+1] != '='; i++){
						currentHeading = String.concat(currentHeading, data.charAt(i));
					}
					if(headingArray[currentHeading] != undefined){
						currentHeading = String.concat(currentHeading, "0");
					}
					headingArray[currentHeading] = new String();
					i = i+3;
					count = 0;
				}
				else{
					subHeading = (subHeading)? false : true;
				}
			}
			else{
				i = i+2;
				var heading = [];
				var j = 0;
				heading[j] = new String("");
				//dump("Headings:\n");
				currentHeading = new String("");
				for(; data[i] != '=' || data[i+1] != '='; i++){
					if(data[i] === ' '){
						j++;
						heading[j] = new String("");
					}
					else{ heading[j] = String.concat(heading[j], data.charAt(i));}
					currentHeading = String.concat(currentHeading, data[i]);
				}
				i = i + 2;
				if(headingArray[currentHeading] != undefined){
					currentHeading = String.concat(currentHeading, "0");
				}
				for(x in heading){
					dump(heading[x] + "\n");
					heading[x] = String.toLowerCase(heading[x]);
					if(heading[x].search("controvers") > -1 || heading[x].search("critic") > -1 || heading[x].search("view") > -1 || heading[x].search("opinion") > -1 || heading[x].search("position") > -1 || heading[x].search("politic") > -1 || heading[x].search("bias") > -1 || heading[x].search("editorial") > -1){
						headingArray[currentHeading] = new String("");
						count = 0;
						controversyExists = true;
					}
				}
				if(count != 0){
					controversyExists = false;
				}
			}
		}
//for some reason it doesn't like it when I send more than about 6000 characters. Maybe the URL is too long
//or maybe there's a bug somewhere. It doesn't matter how the characters are divided up among the strings.
		if(controversyExists && !subHeading){
			if(count < 5000){
				headingArray[currentHeading] = String.concat(headingArray[currentHeading], data.charAt(i));
				if(data[i] === '\n' || data[i] === '\r'){
					headingArray[currentHeading] = String.concat(headingArray[currentHeading], ' ');
					count++;
				}
				count = count+1;
			}
		}
	}
	dump("\ni: " + i + "\n");
	var result = new String("");
	var size = 0;
	condensed = new String("");
	for(x in headingArray){
		result = String.concat(result, headingArray[x]);
		dump("\n" + x + "\n");
		dump(headingArray[x]);
		size += headingArray[x].length;
	}
	dump("\n" + size + "\n");
	for(x in headingArray){
		var max = (headingArray[x].length/size)*5000;
		dump("max: " + max + "\n");
		condensed = String.concat(condensed, getFirst(headingArray[x], max));
		condensed = String.concat(condensed, "\n\n");
	}
	dump(condensed);
	var compression = 10;
	//paragraph = new String("To be or not to be? That is the question. Whether 'tis nobler in the mind to suffer the slings");
	var pageUrl = new String("http://www.clips.ua.ac.be/cgi-bin/iris/daesosum.pl?compression=10&Text1=");
	pageUrl = String.concat(pageUrl, condensed);
	pageUrl = String.concat(pageUrl, "&Text2=&Text3=");
	jQuery.noConflict();
	jQuery.ajax({
		type: "GET",
		url: pageUrl,
		dataType: "html",
		success: successDump,
		error: errorDump
		});
}

function getFirst(par, max)
{
	var result = new String("");
	var temp = new String("");
	for(var i = 0; i < par.length && i < max; i++){
		temp = String.concat(temp, par[i]);
		if(par[i] === '.'){
			result = String.concat(result, temp);
			temp = new String("");
		}
	}
	return result;
}

function successDump(data)
{
	dump("success!\n");
	dump(data);
	data = fixSpaces(data);
	data = parseSummary(data);
	dump(data);

	var doc = content.document;
	var StoredInfo = doc.getElementById('HiddenInfo');
	StoredInfo.value = String.concat(StoredInfo.value, data);
	if (popup)
	{
		AuthorWindow(wikipediaPage, data);
		DisplayHideOrShow (false);
	}
	else
	{
		DisplayAuthorInfo(data);
	}
	if(doAuthor){
		doAuthor = false;
		controversiesP(publisherData);
	}
}

function errorDump(data)
{
	doAuthor = false;
	dump("error!\n");
}

function fixSpaces(data)
{

	var result = new String("");
	var brackets = 0;

	for(var i = 0; i < data.length; i++){
		if(data[i] === ' ' &&  (data[i+1] === '.' || data[i+1] === ',' || data[i+1] === ':' || data[i+1] === ';' || data[i+1] === '?' || data[i+1] === '!')){
			i++;
		}
		result = String.concat(result, data[i]);
	}
	return result;
}

function parseSummary(data)
{
	var result = new String("");
	var i = 0;
	for(i = 0; i < data.length; i++){
		if(data[i] === '[' && data[i+1] === '1' && data[i+2] === ']'){
			break;
		}
	}
	i += 3;
	for(; i < data.length; i++){
		if(data[i] === '<' && data[i+1] === 'H'){
			break;
		}
		if(data[i] === '[' && data[i+2] === ']'){
			i += 3;
		}
		if(data[i] === '<' && data[i+1] === 'b'){
			i += 3;
			result = String.concat(result, ' ');
		}
		else{
			result = String.concat(result, data[i]);
		}
	}
	data = result;
	result = new String("");
	var quote = false;
	for(i = 0; i < data.length; i++){
		if(data[i+1] === '"' && quote){
			if(data[i] === ' '){
			i++;
			quote = false;
			result = String.concat(result, '"');
			continue;
			}
			else{
				result = String.concat(result, String.concat(data[i], '"'));
				quote = false;
				i++;
				continue;
			}
		}
		if(data[i] === '"' && !quote){
			quote = true;
			i++;
			result = String.concat(result, '"');
			continue;
		}
		if(data[i] === ' ' && data[i-1] === '('){
			continue;
		}
		if(data[i] === ' ' && i < data.length-1 && data[i+1] === ')'){
			continue;
		}
		result = String.concat(result, data[i]);
	}
	return result;
}

//if either argument is null, doesn't do that call
function callWikipediaAPI(authorPage, publicationPage) {
	var wikipediaPage = authorPage;
	if(authorPage != null && publicationPage != null){
		publicationData = "";
		option0 = true;
		doAuthor = true;
		callWikipediaAPI(authorPage, null);
		wikipediaPage = publicationPage;
	}
	else if(publicationPage != null){
		publicationData = "";
		option1 = true;
		wikipediaPage = publicationPage;
	}
	else if(authorPage != null){
		authorData = "";
		option2 = true;
	}
	else{
		return;
	}
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
	if(wikipediaPage === null || wikipediaPage === undefined){
		if (popup)
		{
			AuthorWindow(wikipediaPage, "No information found.");
		}
		else
		{
			DisplayAuthorInfo ("No information found.");
		}
	}
	
	var doc = content.document;
	
	var StoredInfo = doc.getElementById('HiddenInfo');	
	if (StoredInfo.value === 'none')
	{
		var result;
		var remoteApi = JsMwApi("http://en.wikipedia.org/w/api.php", "local");
		dump("inside if block\n");
		remoteApi({action: "query", prop: "revisions", rvprop: "content", titles: wikipediaPage}, function (res){
			dump("inside callback for jsmwapi\n");
			if(res.query === undefined){
				DisplayAuthorInfo('Information not found');
				return;
			}
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
				for(i in res.query.pages[page]["revisions"][0]){
					data = res.query.pages[page]["revisions"][0][i];
				}
				if(data[0] === '#' && data[1] === 'R'){
					var i = 0;
					var redirect = new String("");
					for(i = 0; i < data.length; i++){
						if(data[i-2] === '['){
							break;
						}
					}
					for(; i < data.length; i++){
						if(data[i] === ']'){
							break;
						}
						redirect = String.concat(redirect, data[i]);
					}
					//redirect handling is broken for the time being
					//the program is not independent of order of callbacks
					if(option2){
						callWikipediaAPI(redirect, null);
					}
					else if(option0){
						callWikipediaAPI(null, redirect);
					}
					else{
						callWikipediaAPI(null, redirect);
					}
					return;
				}
				result = parseFirstThou(data);
				result = removeBrackets(result);
//				dump("result:\n" + result + "\n");
				if(option2){
					option2 = false;
					dump("option2\n");
					authorData = result;
					if(!doAuthor){
						controversiesP(authorData);
					}
				}
				else if(option0){
					option0 = false;
					dump("option0\n");
					publisherData = result;
					controversiesP(authorData);
				}
				else if(option1){
					option1 = false;
					publisherData = result;
					controversiesP(publisherData);
				}
				result = firstP(result);
				dump("first paragraph: \n" + result + "\n");

				StoredInfo.value = String.concat(StoredInfo.value, result);
							
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
