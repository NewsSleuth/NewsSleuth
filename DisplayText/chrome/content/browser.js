function TitleLocation ( ) { return "h1"; }
function boxId ( ) {return "InfoBoxId";}
function AuthorTag ( ) {return "AuthorInfo"; }
function AuthorId (  ) {return "AuthorParagraph"; }
function AuthorClass ( ) {return "InfoClass"}
function HideClass ( ) { return "HideClass"; }
function ShowClass ( ) { return "ShowClass"; }
function HideId ( ) { return "mylink"; }
function HideParagraphId ( ) { return "HideParagraph"; }

var StoredInfo = null;
var popup = false;

var DisplayText = {
	onCommand: function(event) {
		callWikipediaAPI ("Bill Clinton");
	}
};

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
	author = fixAuthor(author);
	//alert("Found Author: " + author);
	
	callWikipediaAPI(author);
}

function EditPage( DisplayInfo )
{
	var doc = content.document;
	// Remove 'show' option if on page - will be replaced by 'hide' 
	//			inside bordered element
	var DelShow = doc.getElementById( HideParagraphId( ) );
	if (DelShow)
		DelShow.parentNode.removeChild(DelShow);
	
	// Get title element of page and call function to display info
	var TitleElement = doc.getElementsByTagName( TitleLocation( ) )[0];
	if (TitleElement) 
	{
		if (DisplayInfo) 
		{
			popup = false;
			var AuthorElement = doc.getElementById('HiddenAuthor');
			var author = AuthorElement.value;
			if (author !== 'none') {
				callWikipediaAPI(author);
			} else {					
				var head = content.document.getElementsByTagName('h1')[0];
				if (head)
				{
					var jquery = content.document.createElement("script");
					jquery.type = "text/javascript";
					jquery.src = "chrome://DisplayText/content/jquery.js";

					var ext = content.document.createElement("script");
					ext.type = "text/javascript";
					ext.src = "chrome://DisplayText/content/extraction.js";

					head.appendChild(jquery);
					head.appendChild(ext);
					
				}
				else
					alert("no head");
			}
		}
		else 
		{
			DisplayHideOrShow (false);
		}
		
	}
}

function DisplayAuthorInfo (info)
{
	var doc = content.document;

	var div = doc.createElement('div');
	div.id = boxId ( );
	div.className = AuthorClass( );
	
	var AuthorParagraph = doc.createElement('p');
	AuthorParagraph.id = AuthorId( );
	AuthorParagraph.className = AuthorClass( );
	div.appendChild(AuthorParagraph);
	
	var TitleElement = doc.getElementsByTagName( TitleLocation() )[0];
//	TitleElement.appendChild(AuthorParagraph);
	TitleElement.parentNode.insertBefore(div, TitleElement.nextSibling);
	
	var AuthorText = doc.createTextNode(info);
	AuthorParagraph.appendChild(AuthorText);
	
	dump(AuthorParagraph + "\n");

	DisplayHideOrShow (true);
}

function DisplayHideOrShow ( hide )
{
	// Add 'hide' or 'show' option on page
	var doc = content.document;
	var HideParagraph = doc.createElement('p');
//	HideParagraph.className = HideClass( );
	HideParagraph.id = HideParagraphId( );
	var HideElement = doc.createElement('a');
	HideElement.id = HideId( );
//	HideElement.className = HideClass ( );
	
	var hideText;
	if (hide) {	
		hideText = doc.createTextNode('(HIDE)');
		HideParagraph.className = HideClass( );
	} else {
		hideText = doc.createTextNode('Show');
		HideParagraph.className = ShowClass( );
	}
	
	HideElement.appendChild(hideText);
	HideParagraph.appendChild(HideElement);
	
	if (hide)
	{
		var AuthorPar = doc.getElementById(AuthorId());
		AuthorPar.parentNode.appendChild(HideParagraph);
//		AuthorPar.parentNode.insertBefore(HideParagraph, AuthorPar.nextSibling);
	}
	else
	{
		var TitleElement = doc.getElementsByTagName( TitleLocation( ) )[0];
		//TitleElement.appendChild(HideParagraph);
		TitleElement.parentNode.insertBefore(HideParagraph, TitleElement.nextSibling);
	}
	
	// Add event listener to hide/show text
	HideElement.addEventListener('click', HideShowHandler, true);
}
 
function HideShowHandler ( )
{
	// Called when user clicks 'hide' or 'show' 
	// Toggles showing and hiding of the author information
	var doc = content.document;
	var text = doc.getElementsByClassName( AuthorClass( ) )[0];
	if (!text)
		EditPage( true );
	else
		HideText( );
}

function HideText ( )
// Hides the author text on the page
{
	var doc = content.document;
	var text = doc.getElementById( boxId( ) );
	if (text)
	{
		text.parentNode.removeChild(text);
		EditPage(false);
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

		if (DisplayOnLoad)
		{
			var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
			window.openDialog(
					'chrome://DisplayText/content/menubox.xul',	
					'showmore',
					strWindowFeatures,
					"testing");
		} else {
			var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
			window.openDialog(
					'chrome://DisplayText/content/menubox2.xul',	
					'showmore',
					strWindowFeatures);			
		}
	}
}
	
function CheckList ( )
// Checks user's list of sites they want author information displayed for
{
	var URL = GetHost( );
	
	var file = GetPath( );
	if ( !file.exists() )
		return;
	
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
	//alert('Site is not in file');
	return false;
}
 
function GetHost ( )
{
	// Retrieve current URL
	var url = window.content.location.href;
	
	// Shorten URL to just the host url
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
	var source = url.slice(0,domain + dSize);
	//alert (source);
	return source;
}

function GetPath ( )
{
	// Returns path to profile directory
	var file = DirIO.get("ProfD"); 
	//file.append("extensions"); // extensions subfolder of profile directory
	//file.append("helloworld@myksdffdsw.masdfasdf"); // subfolder of your extension (that's your extension ID) of extensions directory
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
			
			DisplaySiteWindow (line);			
		}
	}
}