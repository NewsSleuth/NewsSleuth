//function TitleLocation ( ) { return "h1"; }
function boxId ( ) {return "InfoBoxId";}
function AuthorClass ( ) {return "InfoClass"}
function TitleLocation(TitleElement)
{
	var site = GetHost( );
	var file = GetLocPath ( );
	if ( !file.exists() )
		return;
	
	// Check if url is in file
	var fileContents = FileIO.read(file);
	var line = fileContents.split("\n"),
		len = line.length;
	var siteInFile = false;
	while(len--)
	{	
		var split = line[len].split(' ');
		if ( site === split[0] )
		{
			// Find and return the title element of page
			if(GetTitleElement(line[len], TitleElement))
				return true;
			siteInFile = true;
		}
	}
	//alert('Site is not in file');
	return siteInFile;
}
function GetTitleElement( path, TitleElement )
{
	var doc = content.document;
	var split = path.split(' '),
		len = split.length-1;

	if (len < 2) return false;

	var value = split[len--],
		type = split[len--];
	
	// get first element on path to title 
	if (type === 'tag')
		cn = doc.getElementsByTagName(value)[0];
	else if (type === 'class')
		cn = doc.getElementsByClassName(value)[0];
	else if (type === 'id')
		cn = doc.getElementById(value);
	
	// If there's more to the path continue until title element is found
	// Happens if element directly containing title isn't unique to page
	while(len > 1)
	{
		value = split[len--];
		type = split[len--];
		//alert(type + ' ' + value);
		var childNodes = cn.childNodes,
			size = childNodes.length;
		for (var i = 0; i < size; i++)
		{
			if (type === 'tag' && childNodes[i].tagName === value) {
				cn = childNodes[i];
				break;
			} else if (type === 'class' && childNodes[i].className === value) {
				cn = childNodes[i];
				break;
			} else if (type === 'id' && childNodes[i].id) {
				cn = childNodes[i];
				break;
			}
		}
	}
	// Set TitleElement to the element containing the title
	TitleElement.item = cn;
	if (cn) {
		return true;
	}
	return false;
}

var popup = false;
//These variables allow us to pass the wikipedia results to callback functions.
var authorData = new String("");
var publisherData = new String("");
//These variables allow the callback functions to know the state of the program,
//since we can't pass arguments in. Option lets callWikipediaAPI know how it 
//should call controversiesP. doAuthor lets successDump konw whether it should call
//controversiesP.
var option0 = false;
var option1 = false;
var option2 = false;
var doAuthor = false;

var DisplayText = {
	onCommand: function(event) {
		changeInfoLocation();
		return;
		
		var div = content.document.getElementById('lookup_id');
		var cn = div.childNodes;
		var len = cn.length;
		while(len--)
		{
			div.removeChild(cn[len]);
		}

		return; 
		createTopBar( );
		var doc = content.document;
		var bar = doc.getElementById('bar_id');
		var box = doc.createElement('div');
		box.id = 'bar_info_id';
		var top = doc.body;
		bar.appendChild(box);var ext = content.document.createElement("script");
					ext.type = "text/javascript";
					ext.src = "chrome://DisplayText/content/slideElement.js";	
		top.appendChild(ext);

//		callWikipediaAPI('Bill Clinton', "WSJ");	
	return;
		
	}
};

function changeInfoLocation ( )
{
	// remove box from page
	var div = content.document.getElementById(boxId());
	if (div)
	{
		div.parentNode.removeChild(div);
	}
	// createTopBar with different text
	text = 'Choose location to display info';
	createTopBar('', text);
	
}

function createTopBar (text1, text2)
{
	// creates bar at top of screen if extension can't find the title location on the page
	var doc = content.document,
		top = doc.body,
		bar = doc.createElement('div'),
		text = doc.createTextNode(text1);//'NewsSleuth was unable to find the title for this page. ');
			
	bar.className = 'topBarClass';
	bar.id = 'bar_id';
	
	bar.appendChild(text);
	top.insertBefore(bar, top.firstChild);
		
	var input = doc.createElement('a'),
		atext = doc.createTextNode(text2);//'Select title to view information');
	input.id = 'bar_a_id';
	input.appendChild(atext);
	input.addEventListener('click', selectTitle, true);
	
	bar.appendChild(input);
}

function selectTitle()
{
	var div = content.document.getElementById('bar_id'),
		cn = div.childNodes,
		len = cn.length;
	while(len--) {
		div.removeChild(cn[len]);
	}
	var text = content.document.createTextNode("click on the title of the article and select 'accept'");
	div.appendChild(text);
	
	content.document.addEventListener("mousedown", mouseHandler, true);
}

var lastElement, lastClass;
function mouseHandler(event)
 {
	// displays box around element clicked on by user when trying
	//   to select where they title is on page.
	if (lastElement && content.document.getElementById('titleSearchId'))
	{
		var accept = content.document.getElementById('titleSearchId');
		accept.parentNode.insertBefore(lastElement, accept);
		accept.parentNode.removeChild(accept);
	}
	if (!event) event = window.event;
	var element = (event.target || event.srcElement);
	// check if they clicked the accept button
	if (element.id === 'titleSearchButton') {
		setUpTitleLocation(lastElement);
		return;
	}
	lastElement = element;//event.target || event.srcElement;

	var pe = lastElement.parentNode,
		ne = lastElement.nextSibling;
	
	var div = content.document.createElement('div');
	div.className = 'titleSelect';
	div.id = 'titleSearchId';
	
	pe.insertBefore(div, lastElement);
	pe.removeChild(lastElement);
	div.appendChild(lastElement);

	var button = content.document.createElement('input');
	button.type = 'button';
	button.value = 'accept';//lastElement.tagName;
	button.id = 'titleSearchButton';
	//button.addEventListener('click', setUpTitleLocation, true);

	var par = content.document.createElement('p');
	par.className = 'titleSearchPar';
	par.appendChild(button);
	div.appendChild(par);
}

function setUpTitleLocation( element )
{
	var doc = content.document,
		cn = element,
		path = '',
		count = 4,
		unique = false;
	// Checks for an element that has a unique tag, class, or id that can be
	// used to find the title - checks at most 3 elements from title
	while (count--)
	{
		// check if title has a unique class name
		if (cn.className && doc.getElementsByClassName(cn.className).length === 1)
		{
			//alert('unique class: ' + cn.className);
			path += ' class ' + cn.className;
			unique = true;
			break;
		}
		else if (cn.id)
		{
			//alert('unique id: ' + cn.id);
			path += ' id ' + cn.id;
			unique = true;
			break;
		}
		else if (cn.tagName && doc.getElementsByTagName(cn.tagName).length === 1)
		{
			//alert('unique tag: ' + cn.tagName);
			path += ' tag ' + cn.tagName;
			unique = true;
			break;
		}
		
		// If cn doesn't have a unique identifier than move to element containing cn
		//   also have to check if there is a way to find cn within it's parent element
		//   ie. check if cn has a unique class, tag, or id within the parent element
		var parent = cn.parentNode,
			childNodes = parent.childNodes,
			length = childNodes.length,
			tagCount = 0,
			classCount = 0,
			cLoc = -1;
		while(length--) 
		{
			if (childNodes[length].tagName && childNodes[length].tagName === cn.tagName) {
				tagCount++;
			}
			if (childNodes[length].className && childNodes[length].className === cn.className) {
				classCount++;
			}
			if (childNodes[length] === cn) {
				cLoc = length;
				for (var i = 0; i < length; i++) {
					if (!childNodes[i].tagName)
						cLoc--;
				}
			}
		}
		
		if (tagCount === 1)
			path += ' tag ' + cn.tagName;
		else if (classCount === 1)
			path += ' class ' + cn.className;
		else if (cn.id)
			path += ' id ' + cn.id;
		else if (cLoc === 0) {
			path += ' tag ' + cn.tagName;
		}
		else
			break;
			
		cn = cn.parentNode;
	}

	//alert(unique + ": " + path);
	if (unique)
	{
		//alert('Using unique ' + type + ' for location');
		var file = GetLocPath( );
		if ( !file.exists() ) {
			FileIO.create(file);
		}
		var site = GetHost( );
		var entry = site + path;
		//alert(entry);
		FileIO.write(file, entry + '\n', 'a');
	}
	else
	{
		alert('not a unique element');
		var pn = element.parentNode;
		var div = content.document.createElement('div');
		div.id = boxId();
		pn.insertBefore(div, element.nextSibling);
	}
	
	doc.removeEventListener("mousedown", mouseHandler, true);	
	var bar_div = content.document.getElementById('bar_id');
	bar_div.parentNode.removeChild(bar_div);
	EditPage(true);	
}

function AddPageStyle ( )
{
	// Add style to page
	var HeadOfPage = content.document.getElementsByTagName("Head")[0];
	var style = content.document.createElement("link");
	style.id = "headertext-style";
	style.type = "text/css";
	style.rel = "stylesheet";
	style.href = "chrome://DisplayText/content/header-text.css";
	HeadOfPage.appendChild(style);
}



function AuthorFound ( )
{
	// Code runs when its triggered by the extraction code
	// or if triggered by slideElement.js
	var doc = content.document;
	var AuthorElement = doc.getElementById('HiddenAuthor');
	var author = AuthorElement.value;
	var publication = doc.getElementById('HiddenPublication').value;
	if (publication === 'none')
		publication = null;
	
/*	if (author === 'none')
	{
		// If author hasn't been lookup up yet
		writeScripts();
		return;
	}
	else */
	if (!author || author === 'none')
	{
		if (publication && publication != 'none'){
			callWikipediaAPI(null, publication);
		}

		AuthorNotFound( );
		return;
	}
	author = fixAuthor(author);
	
	callWikipediaAPI(author, publication);
//	callWikipediaAPI(author, "WSJ");
}

function AuthorNotFound ( )
{
	var doc = content.document;
//	var lookupDiv = doc.getElementById('lookup_id');
	var lookupDiv = doc.getElementById('info_id');
	
	var div = doc.createElement('div');
	div.id = 'lookupLabelId';
	var text = doc.createTextNode("Failed to access RSS feed. Enter author name for info");
	div.appendChild(text);
	lookupDiv.appendChild(div);
	
	div = doc.createElement('div');
	var input = doc.createElement('input');
	input.label = 'Author';
	input.id = 'authorInputId';
	div.appendChild(input);
	lookupDiv.appendChild(div);
	
	div = doc.createElement('div');
	var button = doc.createElement('input');
	button.type = 'button';
	button.value = 'look up';
	button.id = 'lookupButtonId';
	div.appendChild(button);
	lookupDiv.appendChild(div);
	
	button.addEventListener('click', lookUpAuthor, true);
	input.addEventListener('keypress', function(event) { checkReturn(event); }, false);

	if (DisplayOnLoad ( )) {
	//	setTimeout("content.document.getElementById('toggle_id').click();",100);	
	}
}

function checkReturn (e){
	// check if the user hit the return key
	if (e.keyCode === 13) {
		content.document.getElementById('lookupButtonId').click();
	}
}

function lookUpAuthor ()
{
	var doc = content.document;
	var author = doc.getElementById('authorInputId').value;
	if (author === '')
		return;
	
	var hidden = doc.getElementById('HiddenAuthor');
	hidden.value = author;
	
	var toggle = doc.getElementById('toggle_id');
	toggle.click();

	// Delete author lookup elements
	var div = doc.getElementById('info_id'),
		cn = div.childNodes,
		len = cn.length;
	while (len--)
	{
		div.removeChild(cn[len]);
	}

	//findAuthor(author);

	//	doc.getElementById('HiddenPublication').value = 'WSJ';
	callWikipediaAPI(fixAuthor(author), null);
}

function findAuthor(searchText, searchNode) {

    var regex = new RegExp(searchText, 'i'),
        childNodes = (searchNode || content.document.body).childNodes,
        cnLength = childNodes.length,
        excludes = 'html,head,style,title,link,script,object,iframe';
    while (cnLength--) {
        var currentNode = childNodes[cnLength];
        if (currentNode.nodeType === 1 &&
            (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
				arguments.callee(searchText, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
            continue;
        }

		checkElement(currentNode);
    }
}

function checkElement(node)
{
	var doc = content.document;
	var cn = node.parentNode;
	var path = '';
	var count = 0;
	var unique = false;
	while (count++ < 3)
	{
		if (doc.getElementsByTagName(cn.tagName).length === 1) {
			//alert('unique tag ' + cn.tagName);
			path += cn.tagName + ' ';
			unique = true;
			break;
		}/* else if (cn.className && doc.getElementsByClassName(cn.className).length === 1) {
			//alert('unique class ' + cn.className);
			path += cn.className + ' ';
			unique = true;
			break;
		} */else if (cn.id) {
			path += cn.id + ' ';
			unique = true;
			break;
		}
		
		var parent = cn.parentNode,
			childNodes = parent.childNodes,
			length = childNodes.length,
			tagCount = 0,
			classCount = 0;
		while(length--) 
		{
			if (childNodes[length].tagName && childNodes[length].tagName === cn.tagName) {
				tagCount++;
			}
			if (childNodes[length].className && childNodes[length].className === cn.className) {
				classCount++;
			}
		}
		if (tagCount === 1)
			path += cn.tagName + ' ';
		else if (classCount === 1)
			path += cn.className + ' ';
		else
			break;
//		path += cn.tagName + ' ';
		cn = cn.parentNode;
	}
	alert(unique + ": " + path);
	return;
}

function addElements( )
{
	var doc = content.document;
	var top = content.document.body.parentNode;

	var div = doc.getElementById(boxId( ));
	if (!div)
	{
		div = doc.createElement('div');
		div.id = boxId( );
		div.className = AuthorClass( );
			// retrieve location of title element and add author box after it
		var TitleElement,
		cn = new Object();

		if (!TitleLocation (cn))
			return;
		TitleElement = cn.item;
		TitleElement.parentNode.insertBefore(div, TitleElement.nextSibling);
	}
	
	// retrieve location of title element and add author box after it
//	var TitleElement,
//		cn = new Object();
//	if ( TitleLocation(cn) )
//	{
//		TitleElement = cn.item;
//		if (!doc.getElementById(boxId()))
//		{
			// set up framework for information to be inserted into later
//			TitleElement.parentNode.insertBefore(div, TitleElement.nextSibling);
			var ContentDiv = doc.createElement('div');
			ContentDiv.id = 'content_id';
			ContentDiv.hidden = true;
			
			var pubText = doc.createElement('div');
			pubText.appendChild(doc.createTextNode('Publication'));
			var PublicationDiv = doc.createElement('div');
			PublicationDiv.id = 'publication_id';
			
			var authorText = doc.createElement('div');
			authorText.appendChild(doc.createTextNode('Author'));
			var AuthorDiv = doc.createElement('div');
			AuthorDiv.id = 'info_id';
			
			var LookupDiv = doc.createElement('div');
			LookupDiv.id = 'lookup_id';
			LookupDiv.hidden = true;
			
			var ToggleDiv = doc.createElement('div');
			ToggleDiv.id = 'toggle_id';
			var toggleText =  doc.createTextNode('Show author & source information for this article');
			ToggleDiv.appendChild(toggleText);
			
			var aSummary = doc.createElement('div');
			aSummary.id = 'aSummary_id';
			aSummary.hidden = true;
			var pSummary = doc.createElement('div');
			pSummary.id = 'pSummary_id';
			pSummary.hidden = true;
			var aExpand = doc.createElement('div');
			aExpand.id = 'aExpand_id';
			var pExpand = doc.createElement('div');
			pExpand.id = 'pExpand_id';
			
			ContentDiv.appendChild(PublicationDiv);
			ContentDiv.appendChild(pSummary);
			ContentDiv.appendChild(pExpand);
			ContentDiv.appendChild(AuthorDiv);
			ContentDiv.appendChild(aSummary);
			ContentDiv.appendChild(aExpand);
			
			div.appendChild(ContentDiv);
			div.appendChild(LookupDiv);
			div.appendChild(ToggleDiv);
	//	}
//	}
//	else alert('title location not found');
	
	// write scripts for jquery and to handle the sliding function of div elements
	var jquery = content.document.createElement("script");
					jquery.type = "text/javascript";
					jquery.src = "chrome://DisplayText/content/jquery.js";
	var ext = content.document.createElement("script");
					ext.type = "text/javascript";
					ext.src = "chrome://DisplayText/content/slideElement.js";	
	top.appendChild(jquery);
	top.appendChild(ext);
}

function writeScripts()
{
	var body = content.document.body;
	if (body)
	{
		var ext = content.document.createElement("script");
		ext.type = "text/javascript";
		ext.src = "chrome://DisplayText/content/extraction.js";

		body.appendChild(ext);
	}
	else
		alert("no body");
}

function EditPage (DisplayInfo)
{
	var TitleElement, 
		element = new Object(),
		loc = false;
	// Retrieve the TitleElement
	loc = TitleLocation(element);
	TitleElement = element.item;
	
	// Display info if you know where the title is located or if
	//   box div is already on page which happens if they chose a 
	//   non unique title location
	if (TitleElement || content.document.getElementById(boxId( )))
	{
		// Add information box framework to page
		addElements();
		if (DisplayInfo) 
		{
			writeScripts();
		}
	}
	else if (!loc)
	{
		// Write location of title if at 'h1'
		if (content.document.getElementsByTagName('h1').length === 1)
		{
			var site = GetHost( );
			var file = GetLocPath( );
			if ( !file.exists() ) {
				FileIO.create(file);
			}
			var entry = site + ' tag h1';
			FileIO.write(file, entry + '\n', 'a');
			EditPage(DisplayInfo);
		} 
		else
		{
			//alert('unknown title location');
			var text1 = 'NewsSleuth was unable to find the title for this page. ';
			var text2 = 'Select title to view information';
			createTopBar (text1, text2);
		}
	}
}
var testdisplay = true;
function DisplayAuthorInfo (info, page)
{
	//alert(info);
	if (!info || info == "") {	
		return;
	}
	var doc = content.document;

	// Display author name or publisher name at top of columns 
/*	var row = doc.getElementById('row1_id');
	if (row.firstChild.innerHTML === '') {
		var p;
		if ( (p = doc.getElementById('HiddenPublication').value) != 'none')
			row.firstChild.innerHTML = p;
	}
	if (row.lastChild.innerHTML === '') {
		var p;
		if ( (p = doc.getElementById('HiddenAuthor').value) != 'none')
			row.lastChild.innerHTML = fixAuthor(p);
	} */

	if (testdisplay)
		page = 'publication';
	else
		page = 'author'
	testdisplay = !testdisplay;
	
	var div, nameValue;
	var summary = false;
	if (page === 'publication')
	{
		nameValue = doc.getElementById('HiddenPublication').value;
		div = doc.getElementById('publication_id');
		if (div.childNodes.length > 0)
		{
			summary = true;
			div = doc.getElementById('pSummary_id');
			// add option to expand summary
			var exp = doc.getElementById('pExpand_id');
			exp.appendChild(doc.createTextNode('Expand'));
		}
		
	}
	else 
	{
		nameValue = fixAuthor(doc.getElementById('HiddenAuthor').value);
		div = doc.getElementById('info_id');
		if (div.childNodes.length > 0)
		{
			summary = true;
			div = doc.getElementById('aSummary_id');
			// add option to expand summary
			var exp = doc.getElementById('aExpand_id');
			exp.appendChild(doc.createTextNode('Expand'));
		}
	}
	
	// Edit the 'info' to bold author name
	if (info === 'nopage') {
			var name = doc.createElement('p');
			name.id = 'name_id';
			name.appendChild(doc.createTextNode(nameValue));
			div.appendChild(name);
		// Displays 'No information found for author' message
		var AuthorElement = content.document.getElementById('HiddenAuthor');
		var author = AuthorElement.value;
		var contents = "No information found for ";
		var text = doc.createTextNode(contents);
		
		var bold = doc.createElement('b');
		var AuthorName = doc.createTextNode(fixAuthor(author));
		bold.appendChild(AuthorName);
		
		div.appendChild(text);
		div.appendChild(bold);
	} else {
		// Displays author's information
		var contents = info.toLowerCase(),
			author = doc.getElementById('HiddenAuthor').value.toLowerCase(),
			split = author.split(" "),
			firstname = split[0],
			lastname = split[split.length-1],
			index = 0,
			end;
//		var par = doc.createElement('p');
//		div.appendChild(par);

		if (summary)
		{
			var offset;
			start = info.indexOf('[');
			if (start === 0)
			{
				offset = 1;
				while( start < info.length)
				{
					end = info.indexOf('[', start+offset);
					if (end === -1)
						end = info.length;
					else
					{
						// check if '[' is a split or just a bracket within text
						var splitBracket = false;
						var closeBracket = info.indexOf(']', end);
						if ( (closeBracket - end) < 2)
							splitBracket = true;
						if (!splitBracket)
						{
							offset++;
							continue;
						}
					}
					
					line = info.substr(start, end - start);
					var p = doc.createElement('p');
					p.appendChild(doc.createTextNode(line));
					div.appendChild(p);
					
					offset = 1;
					start = end;
				}
			}
			else
			{
				// write info as 1 paragraph
				var p = doc.createElement('p');
				p.appendChild(doc.createTextNode(info));
				div.appendChild(p);
			}
		}
		else
		{
			//var n = doc.getElementById('HiddenAuthor').value;
			var name = doc.createElement('p');
			name.id = 'name_id';
			name.appendChild(doc.createTextNode(nameValue));
			
			var p = doc.createElement('p');
			var copy = doc.createTextNode(info);
			p.appendChild(copy);
			div.appendChild(name);
			div.appendChild(p);
		}
		
		// Search for first name of author
/*		var fIndex = contents.indexOf(firstname);
		if (fIndex >= 0)
		{
			// append text unbolded up until first name
			var text = doc.createTextNode(info.slice(0, fIndex));
			par.appendChild(text);

			// Search for last name and if last name is within 3 words of
			//   first name then bold everything from first to last name
			//   assumes anything in between is the middle name or initial
			var lIndex = contents.indexOf(lastname);
			if (lIndex > fIndex) {
				var namestr = contents.slice(fIndex, lIndex);
				var count = 0;
				for (var i=0; i<namestr.length; i++) {
					if (namestr[i] === ' ')
						count++;
				}
				if (count <= 3)
					end = lIndex + lastname.length;
				else
					end = fIndex + firstname.length;
			} else {
				end = fIndex + firstname.length;
			}
			
			// append text bolded up until last name
			var bold = doc.createElement('b');
			text = doc.createTextNode(info.slice(fIndex, end));
			bold.appendChild(text);
			par.appendChild(bold);
			// append text unbolded for rest of info
			text = doc.createTextNode(info.slice(end, info.length));
			par.appendChild(text);
		}
		else
		{
			var text = doc.createTextNode(info);
			par.appendChild(text);
		}
		*/
		
	}

	// Have the information slide down rather than just appear
	div = doc.getElementById('content_id');
	if(div.hidden){
		doc.getElementById('toggle_id').click();
		div.hidden = false;
	}
}

 
function DisplayOnLoad ( )
// Check if preferences are set to display info when page loads
{
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("NewsSleuth.");
	return prefs.getBoolPref("DisplayOnLoad");
}
 
var SetPreferences = {
	onCommand: function(event) {
		// Check preferences to set initial state of checkbox
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
		var DisplayOnLoad = prefs.getBoolPref("DisplayOnLoad");

		var arg;
		if (DisplayOnLoad)
			arg = true;
		else
			arg = false;
			
		var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
		var win = window.openDialog(
				'chrome://DisplayText/content/menubox.xul',	
				'prefWindow',
				strWindowFeatures,
				arg);
	}
}

function CheckList ( )
// Checks user's list of sites they want author information displayed for
{
	dump("inside CheckList()\n");
	var URL = GetHost( );
	
	var file = GetPath( );
	if ( !file.exists() )
	{
		dump("file doesn't exist\n");
		return;
	}
	
	dump("file exists\n");
	// Check if url is in file
	var fileContents = FileIO.read(file);
	var line = fileContents.split("\n");
	for (var i=0; i < line.length; i++)
	{
		if ( URL == line[i] )
		{
			//alert('Site is in file');
			return true;
		}
	}
	dump("returning false\n");
	//alert('Site is not in file');
	return false;
}
 
function GetHost ( )
{
	// Retrieve current URL
	var url = window.content.location.href;
	
	// Shorten URL to just the host url
	var start = 0;
	var http = url.indexOf('http');
	if (http !== -1)
		start = 7;
	url = url.slice(start, url.length);
	var end = url.indexOf('/');
	if (end == -1)
	{
		domain = url.length;
	}

	var source = url.slice(0,end);
	//alert (source + ': ' + start + ' ' + end);
	
	return source;
}

function GetPath ( )
{
	// Returns path to profile directory
	var file = DirIO.get("ProfD"); 
	file.append("extensions");
//	file.append("newssleuth@news.sleuthdir");
//	if (!file.exists())
//		DirIO.create(file);

	file.append("SiteList.txt");
	return file;	
}

function GetLocPath( ) 
{
	var file = DirIO.get("ProfD");
	file.append("extensions");
//	file.append("newssleuth@news.sleuth");
//	if (!file.exists())
//		DirIO.create(file);
	file.append("TitleLocation.txt");
	return file;
}

var AddSite = {
	onCommand: function(event) {
	
		var file = GetPath ( );		
		if ( !file.exists() )
		{
			FileIO.create(file);
		}
		
		// Retrieve current URL
		var url = GetHost( );
		//alert (url);
	
		// Check if url is already on file
		var fileContents = FileIO.read(file);
		var line = fileContents.split("\n");
		
		var duplicate = false;
		for (var i=0; i < line.length; i++)
		{
			if ( url == line[i] )
			{
				alert ("URL already in file");
				duplicate = true;
				break;
			}
		}
		if (!duplicate)
		{
			FileIO.write(file, url + '\n', 'a');
		} else return;
		
		// Write location of title if at 'h1'
		if (content.document.getElementsByTagName('h1').length === 1)
		{
			var file = GetLocPath( );
			if ( !file.exists() ) {
				FileIO.create(file);
			}
			var entry = url + ' tag h1';
			FileIO.write(file, entry + '\n', 'a');
		}
	}
}

var RemoveSite = {
	onCommand: function(event) {
		var file = GetPath( );
		if (!file.exists())
		{
			alert ("File doesn't exist");
			return;
		}
		var URL = GetHost( );
		var fileContents = FileIO.read(file);
		var lines = fileContents.split("\n");
		var first = true;
		for (var i = 0; i < lines.length - 1; i++)
		{
			if ( URL != lines[i] )
			{
				if (first)
				{
					FileIO.write(file, lines[i] + '\n');
					first = false;
				}
				else
					FileIO.write(file, lines[i] + '\n', 'a');
			} 
			else 
			{
				//alert('Not writing back to file');
			}
		}
	}
}

var DisplaySiteList = {
	onCommand: function(event) {		
		// Find Path to SiteList.txt
		var file = GetPath( );
		
		if (!file.exists() )
		{
			alert("File doesn't exist");
		} else {
			var fileContents = FileIO.read(file);
			var line = fileContents.split("\n");
			
			var file = GetPath( );
		
			if (!file.exists() )
			{
				alert("File doesn't exist");
			} else {
				var fileContents = FileIO.read(file);		
			}
			var width = 500,
				height = 350,
				xcor = (screen.availWidth/2) - width/2;
				ycor = (screen.availHeight/2) - height/2;
//			var strWindowFeatures = "width=500, height=350, chrome=yes, centerscreen=true";
			var strWindowFeatures = 'width='+width+', height='+350+', top='+ycor+', left='+xcor;
			var win = window.openDialog(
						'chrome://DisplayText/content/sites.xul',	
							'prefWindow', strWindowFeatures , fileContents);
		
		}
	}
}
