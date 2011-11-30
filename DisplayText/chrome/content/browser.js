function TitleLocation ( ) { return "h1"; }
function boxId ( ) {return "InfoBoxId";}
function AuthorTag ( ) {return "AuthorInfo"; }
function AuthorId (  ) {return "AuthorParagraph"; }
function AuthorClass ( ) {return "InfoClass"}
function HideClass ( ) { return "HideClass"; }
function ShowClass ( ) { return "ShowClass"; }
function HideId ( ) { return "mylink"; }
function HideParagraphId ( ) { return "HideParagraph"; }

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
		callWikipediaAPI('Bill Clinton', "WSJ");	
	return;
/*
		var doc = content.document,
			top = doc.body.parentNode,
			bar = doc.createElement('div'),
			text = doc.createTextNode('testing');
			
		bar.className = 'InfoClass';
		
		bar.appendChild(text);
		top.insertBefore(bar, top.firstChild);
		
		var input = doc.createElement('input'),
			button = doc.createElement('input');
		button.type = 'button';
		button.value = 'test';
		
		bar.appendChild(input);
		bar.appendChild(button);
		*/
		content.document.addEventListener("mousedown", mouseHandler, true);
		return;
		
		
		var selectedText = content.getSelection().toString();
		callWikipediaAPI(selectedText, "WSJ");
		return;
	}
};
var lastElement;
function mouseHandler(event)
 {
	if (lastElement)
		lastElement.classList.remove('test');

	if (!event) event = window.event;
	lastElement = event.target || event.srcElement;

	lastElement.className += " test";
	//alert(lastElement.tagName);
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
	var doc = content.document;
	var AuthorElement = doc.getElementById('HiddenAuthor');
	var author = AuthorElement.value;
	if (author === 'none')
	{
		writeScripts();
		return;
	}
	else if (author === 'RSS error')
	{
		AuthorNotFound( );
		return;
	}
	author = fixAuthor(author);
	//alert("Found Author: " + author);
	
	callWikipediaAPI(author, "WSJ");
	//callWikipediaAPI("Bill Clinton");
}

function AuthorNotFound ( )
{
	var doc = content.document;
	var lookupDiv = doc.getElementById('lookup_id');
		
	var par = doc.createElement('p');
	par.id = 'lookupLabelId';
	var text = doc.createTextNode("Failed to access RSS feed. Enter author name for info");
	par.appendChild(text);
	lookupDiv.appendChild(par);
	
	par = doc.createElement('p');
	var input = doc.createElement('input');
	input.label = 'Author';
	input.id = 'authorInputId';
	par.appendChild(input);
	lookupDiv.appendChild(par);
	
	var button = doc.createElement('input');
	button.type = 'button';
	button.value = 'look up';
	button.id = 'lookupButtonId';
	lookupDiv.appendChild(button);
	
	button.addEventListener('click', lookUpAuthor, true);
	input.addEventListener('keypress', function(event) { checkReturn(event); }, false);

	lookupDiv.hidden = true;
	doc.getElementById('toggle_id').click();	
	
}
function checkReturn (e){
	if (e.keyCode === 13) {
		// return key hit
		content.document.getElementById('lookupButtonId').click();
	}
}

function lookUpAuthor ()
{
	var doc = content.document;
	var author = doc.getElementById('authorInputId').value;

	var hidden = doc.getElementById('HiddenAuthor');
	hidden.value = author;
	
	var toggle = doc.getElementById('toggle_id');
	toggle.click();

	callWikipediaAPI(fixAuthor(author), "WSJ");
}

function findAuthor(searchText, searchNode) {

    var regex = new RegExp(searchText, 'i'),
        childNodes = (searchNode || content.document.body).childNodes,
        cnLength = childNodes.length,
        excludes = 'html,head,style,title,link,meta,script,object,iframe';
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
	var pn = node.parentNode,
		tag = pn.tagName,
		cName = pn.className,
		ptag = pn.parentNode.tagName;
	alert(tag + " "  + cName);
	
	var doc = content.document,
		tElements = doc.getElementsByTagName(tag),
		cElements = doc.getElementsByClassName(cName),
		ptElements = doc.getElementsByTagName(ptag);

	alert("number of " + tag + " elements: " + tElements.length);
	alert("number of " + cName + " elements: " + cElements.length);
	alert("number of " + ptag + " elements: " + ptElements.length);

}

function addElements( )
{
	var doc = content.document;
	var top = content.document.body.parentNode;

	var jquery = content.document.createElement("script");
					jquery.type = "text/javascript";
					jquery.src = "chrome://DisplayText/content/jquery.js";
	var ext = content.document.createElement("script");
					ext.type = "text/javascript";
					ext.src = "chrome://DisplayText/content/messagebar.js";
	top.appendChild(jquery);
	top.appendChild(ext);

	var div = doc.createElement('div');
	div.id = boxId( );
	div.className = AuthorClass( );
	var TitleElement = doc.getElementsByTagName( TitleLocation() )[0];
	if (!doc.getElementById(boxId()))
	{
		TitleElement.parentNode.insertBefore(div, TitleElement.nextSibling);
		
		var AuthorDiv = doc.createElement('div');
		AuthorDiv.id = 'info_id';
		var LookupDiv = doc.createElement('div');
		LookupDiv.id = 'lookup_id';
		var ToggleDiv = doc.createElement('div');
		ToggleDiv.id = 'toggle_id';
		var togglePar = doc.createElement('p');
		togglePar.id = HideParagraphId();
		togglePar.className = HideClass();
		var toggleText =  doc.createTextNode('(hide)');
		ToggleDiv.appendChild(togglePar);
		togglePar.appendChild(toggleText);
		
		div.appendChild(AuthorDiv);
		div.appendChild(LookupDiv);
		div.appendChild(ToggleDiv);
	}
}

function writeScripts()
{
	popup = false;
								
	var head = content.document.getElementsByTagName('h1')[0];
	if (head)
	{
		
		var ext = content.document.createElement("script");
		ext.type = "text/javascript";
		ext.src = "chrome://DisplayText/content/extraction.js";

		head.appendChild(ext);
		
	}
	else
		alert("no head");
}

function EditPage (DisplayInfo)
{
	
	// Add information box framework to page
	addElements();

	// Get title element of page and call function to display info
	var TitleElement = content.document.getElementsByTagName( TitleLocation( ) )[0];
	if (TitleElement && DisplayInfo) 
	{
		writeScripts();
	}
}

function DisplayAuthorInfo (info)
{
	var doc = content.document;
	var div = doc.getElementById('info_id');
	
	var AuthorParagraph = doc.createElement('p');
	AuthorParagraph.id = AuthorId( );
//	AuthorParagraph.className = AuthorClass( );

	div.appendChild(AuthorParagraph);
	
	// Edit the 'info' for italics and bolded author name
	if (info === 'nopage') {
		var AuthorElement = content.document.getElementById('HiddenAuthor');
		var author = AuthorElement.value;
		var contents = "No information found for ";
		
		var italics = doc.createElement('i');
		var bold = doc.createElement('b');
		var AuthorName = doc.createTextNode(fixAuthor(author));
		bold.appendChild(AuthorName);
		var text = doc.createTextNode(contents);
		italics.appendChild(text);
		italics.appendChild(bold);
		AuthorParagraph.appendChild(italics);
	} else {

		var contents = info.toLowerCase();
		var author = doc.getElementById('HiddenAuthor').value.toLowerCase();
		var split = author.split(" ");
		var firstname = split[0];
		var lastname = split[split.length-1];
		var index = 0;
		var end;

		//alert(firstname+" " +lastname);
		var italics = doc.createElement('i');
		var fIndex = contents.indexOf(firstname);
		//alert('findex: '+fIndex);
		if (fIndex >= 0)
		{
			var text = doc.createTextNode(info.slice(0, fIndex));
			italics.appendChild(text);
			
			var lIndex = contents.indexOf(lastname);
			//alert('lindex: '+lIndex);
			if (lIndex > fIndex) {
				var namestr = contents.slice(fIndex, lIndex);
				var count = 0;
				for (var i=0; i<namestr.length; i++) {
					if (namestr[i] === ' ')
						count++;
				}
				if (count <= 2)
					end = lIndex + lastname.length;
				else
					end = fIndex + firstname.length;
			} else {
				end = fIndex + firstname.length;
			}
			
			var bold = doc.createElement('b');
			//alert(info.slice(fIndex, end));
			text = doc.createTextNode(info.slice(fIndex, end));
			bold.appendChild(text);
			italics.appendChild(bold);
			//alert(info.slice(end, info.length));
			text = doc.createTextNode(info.slice(end, info.length));
			italics.appendChild(text);
		}
		else
		{
			var text = doc.createTextNode(info);
			italics.appendChild(text);
		}		
		
		AuthorParagraph.appendChild(italics);
	}
	dump(AuthorParagraph + "\n");

	// Have the information slide down rather than just appear
	if(!div.hidden){
		div.hidden = true;
		div.click();
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
	
	var dSize = 4;
	var domain = url.indexOf('.com');
	if (domain == -1)
	{
		//alert("Doesn't contain '.com'");
		domain = url.indexOf('.net');
		if (domain == -1)
		{
			domain = url.indexOf('.org');
			if (domain == -1)
			{
				domain = url.indexOf('.co');
				dSize = 3;
			}
		}
	
	}
	var source = url.slice(start,domain + dSize);
	//alert (source);
	
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
