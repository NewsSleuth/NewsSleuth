function TitleLocation ( ) { return "h1"; }
function AuthorTag ( ) {return "AuthorInfo"; }
function AuthorId (  ) {return "AuthorParagraph"; }
function AuthorClass ( ) {return "InfoClass"}
function HideClass ( ) { return "HideClass"; }
function HideId ( ) { return "mylink"; }
function HideParagraphId ( ) { return "HideParagraph"; }

var DisplayText = {
	onCommand: function(event) {
	
		var head = content.document.getElementsByTagName('h1')[0];
		if (head)
		{	
			var d = content.document.createElement('div');
			d.id = "out1";
			
			var cont = content.document.createElement("script");
			cont.type = "text/javascript";
			cont.src = "chrome://DisplayText/content/jquery.js";
		
			var c = content.document.createElement("script");
			c.type = "text/javascript";
			c.src = "chrome://DisplayText/content/extraction.js";
			
			head.appendChild(d);
			head.appendChild(cont);
			head.appendChild(c);
		}
		else
			alert("no head");
		
		// Append text to end of web page
	/*	var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
	 */
		// Add event listener for mouse click
		//content.document.addEventListener("mousedown", mouseHandler, true);	

//		var value = myExtension.RetrieveAuthorInfo( );
//		alert (value);
		//findAndReplace("Ethan Samuel Bronner","something");
	}
};

var StoredInfo = null;

function callWikipediaAPI(wikipediaPage, popup) {

	dump("callWikipediaAPI\n");
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
	
	// Check if author's information has already been stored for this page
	// If not on a newpage than info should be stored in 'StoredInfo'
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("NewsSleuth.");
	var NewPage = prefs.getBoolPref("newpage");

	if (NewPage)
	{
		//alert("Looking up info");
		var result;
		var remoteApi = JsMwApi("http://en.wikipedia.org/w/api.php", "local");
		remoteApi({action: "query", prop: "revisions", rvprop: "content", titles: wikipediaPage}, function (res){ 
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
				result = parseFirstThou(data);
				dump("result:\n" + result + "\n");
				result = firstP(result);
				dump("first paragraph: \n" + result + "\n");
				
				StoredInfo = result;
				prefs.setBoolPref("newpage", false);
				
				if (popup)
				{
					my_window = window.open("", "mywindow1", "status=1,width=500,height=400");
					var headertext2 = content.document.createTextNode(result);
					my_window.content.document.body.appendChild(headertext2);
				}
				else
				{
					// Display content on page
					var doc = content.document;
					var AuthorParagraph = doc.getElementById(AuthorId());
					var AuthorText = doc.createTextNode(result);
					
					AuthorParagraph.appendChild(AuthorText);
					DisplayHideOrShow (true);
				}
			}
		});
	
	}
	else
	{
		//alert("Stored: " + StoredInfo);
		if (popup)
		{
			my_window = window.open("", "mywindow1", "status=1,width=500,height=300");
			var NamePara = content.document.createElement('p');
			NamePara.id = "popupName";
			var NameText = content.document.createTextNode("Bill Clinton");
			NamePara.appendChild(NameText);
			
			var InfoPara = content.document.createElement('p');
			InfoPara.id = "popupInfo";
			var headertext2 = content.document.createTextNode(StoredInfo);
			InfoPara.appendChild(headertext2);
			
			my_window.content.document.body.appendChild(NamePara);			
			my_window.content.document.body.appendChild(headertext2);
			//my_window.content.document.bgColor = '#0000FF';
		}
		else
		{
			var AuthorText = content.document.createTextNode(StoredInfo);
			var AuthorParagraph = content.document.getElementById(AuthorId());
			AuthorParagraph.appendChild(AuthorText);
			DisplayHideOrShow (true);
		}
	}
	
	
	
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


function findAndReplace(searchText, replacement, searchNode) {
    if (!searchText || typeof replacement === 'undefined') {
        // Throw error here if you want...
        return;
    }
    var regex = typeof searchText === 'string' ?
                new RegExp(searchText, 'g') : searchText,
        childNodes = (searchNode || content.document.body).childNodes,
        cnLength = childNodes.length,
        excludes = 'html,head,style,title,link,meta,script,object,iframe';
    while (cnLength--) {
        var currentNode = childNodes[cnLength];
        if (currentNode.nodeType === 1 &&
            (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
				arguments.callee(searchText, replacement, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
            continue;
        }
		alert (currentNode.parentNode.tagName);
		
        var parent = currentNode.parentNode,
            frag = (function(){
			    var html = currentNode.data.replace(regex, replacement),
                    wrap = content.document.createElement('div'),
                    frag = content.document.createDocumentFragment();
                wrap.innerHTML = html;
                while (wrap.firstChild) {
                    frag.appendChild(wrap.firstChild);
                }
                return frag;
            })();
        parent.insertBefore(frag, currentNode);
        parent.removeChild(currentNode);
    }
}

 function mouseHandler(event)
 {
	// Displays tag for element clicked on
	if (!event) event = window.event;
	var elementId = (event.target || event.srcElement).id;
	var elementTag	= (event.target || event.srcElement).tagName;
	var elementClass = (event.target || event.srcElement).className;	
	alert (elementTag);
	
	var doc = content.document;
	var selectedElement = doc.getElementById(elementId);
	//selectedElement.parentNode.removeChild(selectedElement);
	
//alert(elementId);
 }


 
// Adds event listener to run every time a new page loads
var myExtension = {
    init: function() {  
        // The event can be DOMContentLoaded, pageshow, pagehide, load or unload.  
        if(gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
			
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
		var firstrun = prefs.getBoolPref("firstrun");
		if (firstrun) {
			alert("firstrun");
	
			var toolbarId = "nav-bar";
			var id = "custom-button-1";
			var afterId = "stop";
			if (!document.getElementById(id)) {  
				var toolbar = document.getElementById(toolbarId);  
	  
				var before = toolbar.firstChild;  
				if (afterId) {  
					let elem = document.getElementById(afterId);  
					if (elem && elem.parentNode == toolbar)  
						before = elem.nextElementSibling;  
				}  
	  
				toolbar.insertItem(id, before);  
				toolbar.setAttribute("currentset", toolbar.currentSet);  
				document.persist(toolbar.id, "currentset");  
	  
				if (toolbarId == "addon-bar")  
					toolbar.collapsed = false;
			}
			prefs.setBoolPref("firstrun", false);
		}  
    },  
	
    onPageLoad: function(aEvent) {  
		var doc = aEvent.originalTarget; // doc is document that triggered the event  
		var win = doc.defaultView;       // win is the window for the doc
		
		// Return if not top window
		if (win != win.top) return;	
	
		// Set 'newpage' pref to true
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
		prefs.setBoolPref("newpage", true);
		
		if ( DisplayOnLoad ( ) )
		{
			// Check if page is on list of URLs
			var onList = CheckList( );
			if (onList)
			{
				AddPageStyle ( );
				// Display Author info on page
				DisplayAuthorInfo (true);
			}
		}
		else if ( CheckList ( ) )
		{
			AddPageStyle ( );
			// Display 'show' option on page
			DisplayAuthorInfo (false);
		}
    }
}  
window.addEventListener("load", function() { myExtension.init(); }, false);  

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

function DisplayAuthorInfo ( DisplayInfo )
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
			var check = doc.getElementById(AuthorId());
			if (!check)
			{
				// Create new paragraph and insert text in it
				var AuthorParagraph = doc.createElement('p');
				AuthorParagraph.id = AuthorId( );
				AuthorParagraph.className = AuthorClass( );
				
				TitleElement.appendChild(AuthorParagraph);
				
				callWikipediaAPI("Bill Clinton", false);
			}
		}
		else 
		{
			DisplayHideOrShow (false);
		}
		
	}
}

function DisplayHideOrShow ( hide )
{
	// Add 'hide' or 'show' option on page
	var doc = content.document;
	var HideParagraph = doc.createElement('p');
	HideParagraph.id = HideParagraphId( );
	var HideElement = doc.createElement('a');
	HideElement.id = HideId( );
	HideElement.className = HideClass ( );
	
	var hideText;
	if (hide)
		hideText = doc.createTextNode('(HIDE)');
	else
		hideText = doc.createTextNode('Show');
	
	HideElement.appendChild(hideText);
	HideParagraph.appendChild(HideElement);
	
	if (hide)
	{	
		var AuthorPar = doc.getElementById(AuthorId());
		AuthorPar.appendChild(HideParagraph);
	}
	else
	{
		var TitleElement = doc.getElementsByTagName( TitleLocation( ) )[0];
		TitleElement.appendChild(HideParagraph);
	}
	
	// Add event listener to hide/show text
	HideElement.addEventListener('click', ShowText, true);
}
 
function ShowText ( )
{
	// Called when user clicks 'hide' or 'show' 
	// Toggles showing and hiding of the author information
	var doc = content.document;
	var text = doc.getElementsByClassName( AuthorClass( ) )[0];
	if (!text)
		DisplayAuthorInfo( true );
	else
		HideText( );
}

function HideText ( )
// Hides the author text on the page
{
	var doc = content.document;
	var text = doc.getElementById( AuthorId( ) );
	if (text)
	{
		text.parentNode.removeChild(text);
		DisplayAuthorInfo(false);
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
		// Create pop-up window to display preferences
		my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
		var doc = my_window.content.document.body;
		
		// Create check box
		var checkbox = content.document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = "checkboxName";
		checkbox.id = "myID";
		checkbox.checked = checkbox.defaultChecked = true; // make it checked now and by default

		// Create label for checkbox
		var label = content.document.createElement('label');
		label.htmlFor = "id";
		label.appendChild(content.document.createTextNode('Display info when page loads'));
		
		//alert (checkbox.checked);
		doc.appendChild(checkbox);
		doc.appendChild(label);
	
		// Check preferences to set initial state of checkbox
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
		var DisplayOnLoad = prefs.getBoolPref("DisplayOnLoad");
		
		var checkBox = doc.getElementsByTagName('input')[0];
		checkBox.checked = DisplayOnLoad;
		
		// Add event handler for when box is checked
		var cb = doc.getElementsByTagName('input')[0];
		cb.addEventListener('click', ClickHandler, true);
	}
}
 function ClickHandler() 
 // Handles event for when the preference checkbox is clicked
 {
	var checkbox = my_window.content.document.getElementsByTagName('input')[0];
	var checked = checkbox.checked;
	
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
	
	prefs.setBoolPref("DisplayOnLoad", checked);
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
			
			// Create a new window to display text
			my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
			var URLData = content.document.createTextNode(line);
			my_window.content.document.body.appendChild(URLData);
			
		}
	}
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

function GetPrefPath( )
{
	// Return path to preference file
	var file = DirIO.get("ProfD");
	file.append("NewsSleuthPref.txt");
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



var FileIO = {

		localfileCID  : '@mozilla.org/file/local;1',
		localfileIID  : Components.interfaces.nsILocalFile,

		finstreamCID  : '@mozilla.org/network/file-input-stream;1',
		finstreamIID  : Components.interfaces.nsIFileInputStream,

		foutstreamCID : '@mozilla.org/network/file-output-stream;1',
		foutstreamIID : Components.interfaces.nsIFileOutputStream,

		sinstreamCID  : '@mozilla.org/scriptableinputstream;1',
		sinstreamIID  : Components.interfaces.nsIScriptableInputStream,

		suniconvCID   : '@mozilla.org/intl/scriptableunicodeconverter',
		suniconvIID   : Components.interfaces.nsIScriptableUnicodeConverter,

		open   : function(path) {
			try {
				var file = Components.classes[this.localfileCID]
								.createInstance(this.localfileIID);
				file.initWithPath(path);
				return file;
			}
			catch(e) {
				return false;
			}
		},

		read   : function(file, charset) {
			try {
				var data     = new String();
				var fiStream = Components.classes[this.finstreamCID]
									.createInstance(this.finstreamIID);
				var siStream = Components.classes[this.sinstreamCID]
									.createInstance(this.sinstreamIID);
				fiStream.init(file, 1, 0, false);
				siStream.init(fiStream);
				data += siStream.read(-1);
				siStream.close();
				fiStream.close();
				if (charset) {
					data = this.toUnicode(charset, data);
				}
				return data;
			} 
			catch(e) {
				return false;
			}
		},

		write  : function(file, data, mode, charset) {
			try {
				var foStream = Components.classes[this.foutstreamCID]
									.createInstance(this.foutstreamIID);
				if (charset) {
					data = this.fromUnicode(charset, data);
				}
				var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
				if (mode == 'a') {
					flags = 0x02 | 0x10; // wronly | append
				}
				foStream.init(file, flags, 0664, 0);
				foStream.write(data, data.length);
				// foStream.flush();
				foStream.close();
				return true;
			}
			catch(e) {
				return false;
			}
		},

		create : function(file) {
			try {
				file.create(0x00, 0664);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		unlink : function(file) {
			try {
				file.remove(false);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		path   : function(file) {
			try {
				return 'file:///' + file.path.replace(/\\/g, '\/')
							.replace(/^\s*\/?/, '').replace(/\ /g, '%20');
			}
			catch(e) {
				return false;
			}
		},

		toUnicode   : function(charset, data) {
			try{
				var uniConv = Components.classes[this.suniconvCID]
									.createInstance(this.suniconvIID);
				uniConv.charset = charset;
				data = uniConv.ConvertToUnicode(data);
			} 
			catch(e) {
				// foobar!
			}
			return data;
		},

		fromUnicode : function(charset, data) {
			try {
				var uniConv = Components.classes[this.suniconvCID]
									.createInstance(this.suniconvIID);
				uniConv.charset = charset;
				data = uniConv.ConvertFromUnicode(data);
				// data += uniConv.Finish();
			}
			catch(e) {
				// foobar!
			}
			return data;
		}

	}
	
	// Example use:
	// var dir = DirIO.open('/test');
	// if (dir.exists()) {
	// 	alert(DirIO.path(dir));
	// 	var arr = DirIO.read(dir, true), i;
	// 	if (arr) {
	// 		for (i = 0; i < arr.length; ++i) {
	// 			alert(arr[i].path);
	// 		}
	// 	}
	// }
	// else {
	// 	var rv = DirIO.create(dir);
	// 	alert('Directory create: ' + rv);
	// }

	// ---------------------------------------------
	// ----------------- Nota Bene -----------------
	// ---------------------------------------------
	// Some possible types for get are:
	// 	'ProfD'				= profile
	// 	'DefProfRt'			= user (e.g., /root/.mozilla)
	// 	'UChrm'				= %profile%/chrome
	// 	'DefRt'				= installation
	// 	'PrfDef'				= %installation%/defaults/pref
	// 	'ProfDefNoLoc'		= %installation%/defaults/profile
	// 	'APlugns'			= %installation%/plugins
	// 	'AChrom'				= %installation%/chrome
	// 	'ComsD'				= %installation%/components
	// 	'CurProcD'			= installation (usually)
	// 	'Home'				= OS root (e.g., /root)
	// 	'TmpD'				= OS tmp (e.g., /tmp)

	var DirIO = {

		sep        : '/',

		dirservCID : '@mozilla.org/file/directory_service;1',
	
		propsIID   : Components.interfaces.nsIProperties,
	
		fileIID    : Components.interfaces.nsIFile,

		get    : function(type) {
			try {
				var dir = Components.classes[this.dirservCID]
								.createInstance(this.propsIID)
								.get(type, this.fileIID);
				return dir;
			}
			catch(e) {
				return false;
			}
		},

		open   : function(path) {
			return FileIO.open(path);
		},

		create : function(dir) {
			try {
				dir.create(0x01, 0664);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		read   : function(dir, recursive) {
			var list = new Array();
			try {
				if (dir.isDirectory()) {
					if (recursive == null) {
						recursive = false;
					}
					var files = dir.directoryEntries;
					list = this._read(files, recursive);
				}
			}
			catch(e) {
				// foobar!
			}
			return list;
		},

		_read  : function(dirEntry, recursive) {
			var list = new Array();
			try {
				while (dirEntry.hasMoreElements()) {
					list.push(dirEntry.getNext()
									.QueryInterface(FileIO.localfileIID));
				}
				if (recursive) {
					var list2 = new Array();
					for (var i = 0; i < list.length; ++i) {
						if (list[i].isDirectory()) {
							files = list[i].directoryEntries;
							list2 = this._read(files, recursive);
						}
					}
					for (i = 0; i < list2.length; ++i) {
						list.push(list2[i]);
					}
				}
			}
			catch(e) {
			   // foobar!
			}
			return list;
		},

		unlink : function(dir, recursive) {
			try {
				if (recursive == null) {
					recursive = false;
				}
				dir.remove(recursive);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		path   : function (dir) {
			return FileIO.path(dir);
		},

		split  : function(str, join) {
			var arr = str.split(/\/|\\/), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										join : '');
			}
			return str;
		},

		join   : function(str, split) {
			var arr = str.split(split), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										this.sep : '');
			}
			return str;
		}
	
	}