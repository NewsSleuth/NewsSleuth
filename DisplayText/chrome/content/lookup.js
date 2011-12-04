function parseFirstThou(data)
{
	var result = new String("");
	var placeholder = new String("");
	var buffer = new String("");
	var count = 0;
	var braceIgnore = false;
	var bracketIgnore = false;
	var tagIgnore = false;
	var apostropheIgnore = false;
	var brackets = 0;
	var braces = 0;
	var tag = 0;
	var table = 0;
	var tableIgnore = false;
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
		if(data[i] === '{' && data[i+1] === '|'){
			table++;
		}
		if(data[i-1] === '}' && data[i-2] === '|'){
			if(table > 0){
				table--;
			}
			else{
				table = 0;
				buffer = new String("");
			}
		}
		if(data[i-1] === '}' && data[i-2] === '}'){
			if(braces > 0){
			braces--;
			if(data[i-3] === '}'){
				braces += .5;
			}
			if(data[i] === ';'){
				if(braces === 0){
					braceIgnore = false;
				}
				else braceIgnore = true;
				continue;
			}
			}
			else{
				braces = 0;
				buffer = new String("");
			}
		}
		if(data[i] === '{' && data[i+1] ==='{'){
			braces++;
		}
		if(data[i-1] === '>' && data[i-2] === 'f' && data[i-3] === 'e' && data[i-4] === 'r' && data[i-5] === '/' && data[i-6] === '<'){
			if(tag > 0){
				tag--;
			}
			else{
				tag = 0;
				buffer = new String("");
			}
		}
		if(tag > 0 && data[i-1] === '>' && data[i-2] === '/'){
			if(tag > 0){
				tag--;
			}
			else{
				tag = 0;
				buffer = new String("");
			}
		}
		if(data[i] === '<' && data[i+1] === 'r' && data[i+2] === 'e' && data[i+3] === 'f'){
			tag++;
		}
		if(data[i] === '[' && data[i+1] === '['){
			brackets++;
			if(data[i+2] === 'F' && data[i+3] === 'i' && data[i+4] === 'l' && data[i+5] === 'e' && data[i+6] === ':'){
				fileIgnore = true;
			}
			if(data[i+2] === 'I' && data[i+3] === 'm' && data[i+4] === 'a' && data[i+5] === 'g' && data[i+6] === 'e'){
				fileIgnore = true;
			}
		}
		if(data[i-1] === ']' && data[i-2] === ']'){
			if(brackets > 0){
				brackets--;
				if(data[i-3] === ']'){
					brackets += .5;
				}
				if(brackets === 0){
					fileIgnore = false;
				}
			}
			else{
				brackets = 0;
				buffer = new String("");
			}
		}
		if(data[i] === '<' && data[i+1] === '!' && data[i+2] === '-' && data[i+3] === '-'){
			comment++;
		}
		if(data[i-1] === '>' && data[i-2] === '-' && data[i-3] === '-'){
			if(comment > 0){
				comment--;
			}
			else{
				comment = 0;
				buffer = new String("");
			}
		}
		if(table === 0){
			tableIgnore = false;
		}
		else tableIgnore = true;
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

		if(tableIgnore === false && fileIgnore === false && tagIgnore === false && bracketIgnore === false && braceIgnore === false && apostropheIgnore === false && commentIgnore === false){
			buffer = String.concat(buffer, data[i]);
			count++;
		}
		else if(tableIgnore === false && fileIgnore === false && tagIgnore === false && bracketIgnore === false && apostropheIgnore === false && commentIgnore === false){
			if(data[i] === '{' && data[i+1] === '{' && data[i+2] === 'q' && data[i+3] === 'u' && data[i+4] === 'o' && data[i+5] === 't' && data[i+6] === 'e'){
				buffer = String.concat(buffer, " rmvplz.");
			}
		}
		else{
			result = String.concat(result, buffer);
			buffer = new String("");
		}
	}
	result = String.concat(result, buffer);
	//dump("\ni: " + i + "\n");
	//dump("\ncount: " + count + "\n");
	return result;
}

function removeBrackets(data)
{

	var result = new String("");
	var placeholder = new String("");
	var brackets = 0;
	var bracketIgnore = false;

	for(var i = 0; i < data.length; i++){
		if(data[i] === '&' && data[i+1] === 'm' && data[i+2] === 'd' && data[i+3] === 'a' && data[i+4] === 's' && data[i+5] === 'h'){
			i += 7;
			result = String.concat(result, '-');
		}
		if(data[i] === '&' && data[i+1] === 'n' && data[i+2] === 'b' && data[i+3] === 's' && data[i+4] === 'p'){
			i += 6;
			result = String.concat(result, '-');
		}
		if(data[i] === '&'){
			if(!bracketIgnore){
				result = String.concat(result, "and");
			}
			else{
				placeholder = String.concat(placeholder, "and");
			}
			i += 1;
		}
		if(data[i] === '%'){
			if(!bracketIgnore){
				result = String.concat(result, ' percent');
			}
			i++;
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

function firstP(data)
{
	var result = new String("");
	var beginning = true;
	for(var i = 0; i < data.length; i++){
		if(beginning && (data.charAt(i) === '\n' || data.charAt(i) === '\t' || data.charAt(i) === '\ ')){
		}
		else if(beginning === false && data.charAt(i) != '\n'){
			result = String.concat(result, data.charAt(i));
		}
		else if(beginning){
			beginning = false;
			result = String.concat(result, data.charAt(i));
		}
		else{
			break;
		}
	}
	return result;
}

/*
					*/
function controversiesP(data, isAuth)
{
	//dump("inside controversiesP\n");
	//dump("data.length: " + data.length + "\n");
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
					//dump(heading[x] + "\n");
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
	//dump("\ni: " + i + "\n");
	var result = new String("");
	var size = 0;
	condensed = new String("");
	for(x in headingArray){
		result = String.concat(result, headingArray[x]);
		//dump("\n" + x + "\n");
		//dump(headingArray[x]);
		size += headingArray[x].length;
	}
	//dump("\n" + size + "\n");
	for(x in headingArray){
		var max = (headingArray[x].length/size)*5000;
		//dump("max: " + max + "\n");
		condensed = String.concat(condensed, getFirst(headingArray[x], max));
		condensed = String.concat(condensed, "\n\n");
	}
	dump(condensed);
	var compression = 0;
	if(condensed.length > 0){
		compression = 40000/condensed.length;
		compression = Math.floor(compression);
	}
	else{
		numLookups++;
		dump("nothing to summarize- cutting off call\n");
		if(numLookups < paragraphCount){
			dump("calling controversiesP:\n" + infoArray[numLookups] + "\nisAuthArray[numLookups]: " + isAuthArray[numLookups] + "\nnumLookups: " + numLookups + "\n");
			controversiesP(infoArray[numLookups], isAuthArray[numLookups]);
		}
		return;
	}
	dump("compression: " + compression + "\n");
	if(compression > 100){
		compression = 100;
	}
	var pageUrl = new String("http://www.clips.ua.ac.be/cgi-bin/iris/daesosum.pl?compression=");
	pageUrl = String.concat(pageUrl, compression);
	pageUrl = String.concat(pageUrl, "&Text1=");
	pageUrl = String.concat(pageUrl, condensed);
	pageUrl = String.concat(pageUrl, "&Text2=''&Text3=''");
	jQuery.noConflict();
	jQuery.ajax({
		type: "GET",
		url: pageUrl,
		dataType: "html",
		success: function(html){
			successDump(html, isAuth);},
		error: errorDump,
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

function successDump(data, isAuth)
{
	dump("isAuth: " + isAuth + "\n");
	dump("success!\n");
//	dump("data: " + data + "\n");
	//dump(data);
	data = fixSpaces(data);
	data = parseSummary(data);
	dump(data);

	var doc = content.document;
	if (popup)
	{
		//second option
		AuthorWindow(wikipediaPage, data);
		DisplayHideOrShow (false);
	}
	else
	{
		//second option
		DisplayAuthorInfo(data, isAuth);
	}
	numLookups++;
	if(numLookups < paragraphCount){
		dump("calling controversiesP:\n" + infoArray[numLookups] + "\nisAuthArray[numLookups]: " + isAuthArray[numLookups] + "\nnumLookups: " + numLookups + "\n");
		controversiesP(infoArray[numLookups], isAuthArray[numLookups]);
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
	paragraphCount = 0;
	infoArray = new Array();
	isAuthArray = new Array();
	if(authorPage != null && publicationPage != null){
		dump("option 0: " + authorPage + " " + publicationPage + "\n");
		publicationData = "";
		//add in option for more (multiple authors)
		numLookups = 2;
		lookUpPage(authorPage, true);
		lookUpPage(publicationPage, false);
	}
	else if(publicationPage != null){
		dump("option 1: " + publicationPage + "\n");
		publicationData = "";
		numLookups = 1;
		lookUpPage(publicationPage, false);
		option1 = true;
		wikipediaPage = publicationPage;
	}
	else if(authorPage != null){
		dump("option 2: " + authorPage + "\n");
		//add in option for more (multiple authors)
		numLookups = 1;
		authorData = "";
		lookUpPage(authorPage, true);
		option2 = true;
	}
	else{
		return;
	}
}
function lookUpPage(wikipediaPage, isAuthor){
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
	if(wikipediaPage === null || wikipediaPage === undefined || wikipediaPage === "RSS error"){
		if (popup)
		{
			//second option
			AuthorWindow(null, "No information found.");
		}
		else
		{
			//second option
			DisplayAuthorInfo ("No information found.", isAuthor);
		}
	}
	
	var doc = content.document;
	
	var StoredInfo = doc.getElementById('HiddenInfo');	
//	if (StoredInfo.value === 'none')
	if (true)
	{
		var result;
		var remoteApi = JsMwApi("http://en.wikipedia.org/w/api.php", "local");
		//dump("inside if block\n");
		var pageUrl = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&titles=";
		pageUrl = String.concat(pageUrl, wikipediaPage);
		dump("wikipediaPage: " + wikipediaPage + "\n");
		jQuery.noConflict();
		jQuery.ajax({
				type: "GET",
				url: pageUrl,
				dataType: "html",
				error: errorDump,
				success: function(data){
				var isAuth;
				if(isAuthor){
					isAuth = true;
				}
				else{
					isAuth = false;
				}
				dump("isAuth: " + isAuth + "\n");
				//dump(data);
				res = parseWikiHtml(data);
				//dump("data: " + data + "\n");
				//dump("res:" + res + "\nres.length: "+ res.length + "\n");
			if(res.length < 10){
				dump("res.length < 10\n");
				//second option
				DisplayAuthorInfo('Information not found', isAuth);
				numLookups--;
				return;
			}
				var data;
				data = res;
				if(data[0] === '#' && (data[1] === 'R' || data[1] === 'r')){
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
					if(isAuth){
						lookUpPage(redirect, true);
					}
					else{
						lookUpPage(redirect, false);
					}
					return;
				}
				//dump(data);
				result = parseFirstThou(data);
				//dump(result);
				result = removeBrackets(result);
				//dump(result);
				
				isAuthArray[paragraphCount] = isAuth;
				infoArray[paragraphCount] = result;
				paragraphCount++;
				numLookups--;
				if(numLookups === 0){
					//dump("numLookups == 0\ninfoArray[numLookups]:\n" + infoArray[numLookups] + "\nisAuthArray[numLookups]:\n" + isAuthArray[numLookups] + "\n");
					controversiesP(infoArray[numLookups], isAuthArray[numLookups]);
				}
				else{
					dump("numLookups != 0: " + wikipediaPage + "\n");
				}
				result = firstP(result);
				//dump("first paragraph: \n" + result + "\n");

				StoredInfo.value = String.concat(StoredInfo.value, result);
							
				if (popup)
				{
					//second option
					AuthorWindow(wikipediaPage, result);
				}
				else
				{
					//second option
					DisplayAuthorInfo (result, isAuth);
				}
			}
		});
	
	}
	else
	{
		if (popup)
		{
			//second option
			AuthorWindow(wikipediaPage, StoredInfo.value);
		}
		else
		{
			//second option
			DisplayAuthorInfo (StoredInfo.value, isAuthor);
		}
	}
	
	
	//dummy
	//dump("gotJSON()\n");
}

function parseWikiHtml(data)
{
	var result = new String("");
	var count = 0;
	var i = 0;
	for(i = 0; i < data.length; i++){
		if(data[i] === '<' && data[i+1] === '/' && data[i+2] === 's' && data[i+3] === 'p' && data[i+4] === 'a' && data[i+5] === 'n' && data[i+6] === '>'){
			count++;
			if(count == 7){
				i += 7;
				break;
			}
		}
	}
	for(; i < data.length; i++){
		if(data[i] === '<' && data[i+1] === 's' && data[i+2] === 'p' && data[i+3] === 'a' && data[i+4] === 'n'){
			break;
		}
		else if(data[i] === '<' && data[i+1] === '/' && data[i+2] === 'a' && data[i+3] === '>'){
			i += 3;
		}
		else if(data[i] === '<'){
		}
		else if(data[i] === '>'){
		}
		else{
			if(data[i] === '&' && data[i+1] === 'a' && data[i+2] === 'm' && data[i+3] === 'p' && data[i+4] === ';'){
				i += 5;
				if(data[i] === 'q' && data[i+1] === 'u' && data[i+2] === 'o' && data[i+3] === 't' && data[i+4] === ';'){
					i += 4;
					result = String.concat(result, '"');
				}
				else if(data[i] === 'l' && data[i+1] === 't' && data[i+2] === ';'){
					i += 2;
					result = String.concat(result, '<');
				}
				else if(data[i] === 'g' && data[i+1] === 't' && data[i+2] === ';'){
					i += 2;
					result = String.concat(result, '>');
				}
				else if(data[i] === 'a' && data[i+1] === 'm' && data[i+2] === 'p' && data[i+3] === ';'){
					i += 3;
					result = String.concat(result, "&");
				}
				else{
					var toDump = new String("");
					for(; data[i] != ';'; i++){
						toDump = String.concat(toDump, data[i]);
					}
					dump("unrecognized symbol: " + toDump + "\n");
				}
			}
			else{
				result = String.concat(result, data[i]);
			}
		}
	}
	return result;
}
function fixAuthor(data)
{

	for(x in data){
		//dump(x + "\n\t" + data[x]);
	}
	//dump("\n" + data.length + "\n");
	var res = new String("");
	//dump(data.charAt(0));
	res = String.concat(res, String.toUpperCase(data.charAt(0)));
	for(var i = 1; i < data.length; i++){
		if(data.charAt(i-1) === ' '){
			res = String.concat(res, String.toUpperCase(data.charAt(i)));
		}
		else{
			res = String.concat(res, String.toLowerCase(data.charAt(i)));
		}
	}
	//dump("res: " + res + "\n");
	return res;
}
function AuthorId (  ) {return "AuthorParagraph"; }
