var DisplayText = {
	onCommand: function(event) {
		// Append text to end of web page
		var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
	 
		// Add event listener for mouse click
		//content.document.addEventListener("mousedown", mouseHandler, true);
	}
};

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
    },  
	
    onPageLoad: function(aEvent) {  
		if ( DisplayOnLoad ( ) )
		{
			var doc = aEvent.originalTarget; // doc is document that triggered the event  
			var win = doc.defaultView;       // win is the window for the doc
			
			// Return if not top window
			if (win != win.top) return;  
			
			// Check if page is on list of URLs
			var onList = CheckList( );
			if (onList)
			{
				DisplayAuthorInfo ( true );
			}
			//alert("page is loaded \n" +doc.location.href);  
		}
		else if ( CheckList ( ) )
		{
			// Display 'show' option on page
			DisplayAuthorInfo ( false );
		}
    }  
}  
window.addEventListener("load", function() { myExtension.init(); }, false);  
 
function DisplayPopupInfo ( )
{	
	my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
	var headertext2 = content.document.createTextNode("Popup window information")
	my_window.content.document.body.appendChild(headertext2)
}

function DisplayAuthorInfo ( DisplayInfo )
{
	// Displays text to webpage right after the 1st 'h1' tagged element for now
	
	var doc = content.document;
	// Remove hide option if already there
	var DelHide = doc.getElementById('mylink');
	if (DelHide)
		DelHide.parentNode.removeChild(DelHide);

	if (DisplayInfo) 
	{
		// Add text after first 'h1' element of page
		var paragraph = doc.createElement('p');
		var theNewParagraph = doc.createElement('AuthorInfo');
		theNewParagraph.id = 'AuthorParagraph';
		var theTextOfTheParagraph = doc.createTextNode('Some content.');
		theNewParagraph.appendChild(theTextOfTheParagraph);
		paragraph.appendChild(theNewParagraph);
		var header = doc.getElementsByTagName("h1");
		header[0].appendChild(paragraph);
	}
	
	// Add hide option after text
	var hide = doc.createElement('a');
	var hideElement = doc.createElement('HideElement');
	hide.id = "mylink";
	var hideText = doc.createTextNode('Hide');
	hideText.id = "hideTextId";
	hideElement.appendChild(hideText);
	hide.appendChild(hideElement);
	header[0].appendChild(hide);
	//theNewParagraph.appendChild(hide);
	
	var hb = doc.getElementById('mylink');
	hb.addEventListener('click', ShowText, true);
	
	// Add style to page
	var ai = content.document.getElementsByTagName("Head")[0];
	var style = content.document.createElement("link");
	style.id = "headertext-style";
	style.type = "text/css";
	style.rel = "stylesheet";
	style.href = "chrome://DisplayText/content/header-text.css";
	ai.appendChild(style);
}
 
 
function ShowText ( )
{
	// Toggles showing and hiding of the author information
	var doc = content.document;
	var text = doc.getElementById('AuthorParagraph');
	if (!text)
		DisplayAuthorInfo ( true );
	else
	{
		HideText ( );
	}
}

function HideText ( )
// Hides the author text on the page
{	
	var doc = content.document;
	var text = doc.getElementById('AuthorParagraph');
	if (text)
	{
		text.parentNode.removeChild(text);
		//var hide = doc.getElementById('mylink');
		//hide.nodeValue = "show";
		var DelHide = doc.getElementById('mylink');
		if (DelHide)
			DelHide.parentNode.removeChild(DelHide);
			
		var header = doc.getElementsByTagName("h1");
		var hide = doc.createElement('a');
		var hideElement = doc.createElement('HideElement');
		hide.id = "mylink";
		var hideText = doc.createTextNode('Show');
		hideText.id = "hideTextId";
		hideElement.appendChild(hideText);
		hide.appendChild(hideElement);
		header[0].appendChild(hide);
		var hb = doc.getElementById('mylink');
		hb.addEventListener('click', ShowText, true);
	}
}
 
function DisplayOnLoad ( ) 
// Check if preferences are set to display info when page loads
{
	var file = GetPrefPath ( );
	
	if (!file.exists( ))
		return false;
		
	var fileContents = FileIO.read(file);
	var lines = fileContents.split("\n");
	
	if (lines[0] == "true")
		return true;
	else
		return false;
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
		
		// Retrieve preference file and create one if it doesn't exist yet
		var file = GetPrefPath ( );
		if (!file.exists( ))
		{
			FileIO.create(file);
			file = GetPrefPath ( );
			var initChecked = true;
			FileIO.write(file, initChecked, 'a');
		}
		
		var fileContents = FileIO.read(file);
		var lines = fileContents.split("\n");
		
		// Set initial state of checkbox to match preference stored in prefFile
		var cb = doc.getElementsByTagName('input')[0];
		if (lines[0] == "true")
			cb.checked = true;
		else
			cb.checked = false;
		
		// Add event handler for when box is checked
		cb.addEventListener('click', ClickHandler, true);
	}
}
 function ClickHandler() 
 // Handles event for when the preference checkbox is clicked
 {
	var checkbox = my_window.content.document.getElementsByTagName('input');
	var checked = checkbox[0].checked;
	
	// Write new preference to file
	var file = GetPrefPath( );
	if (!file.exists( ))
		return;
		
	var fileContents = FileIO.read(file);
	var lines = fileContents.split("\n");
	
	var pref;
	if (checked) {
		pref = "true";
		//alert ('true');
	} else {
		pref = "false";
		//alert ('false');
	}
	FileIO.write(file, pref);	
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

let DisplaySiteList = {
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

let AddSite = {
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

let RemoveSite = {
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
		for (var i = 0; i < lines.length; i++)
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