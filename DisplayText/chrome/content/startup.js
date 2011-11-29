
// Adds event listener to run every time a new page loads
var myExtension = {
    init: function() {
			  dump("init\n");
        // The event can be DOMContentLoaded, pageshow, pagehide, load or unload.  
        if(gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
		
		setUpDefaultSiteList ( );
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("NewsSleuth.");
		var firstrun = prefs.getBoolPref("firstrun");
		if (firstrun) {
			var toolbarId = "nav-bar";
			var id = "custom-button-1";
			var afterId = "unified-back-forward-button"; // "reload-button"	"urlbar-container"
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
	
					dump("onPageLoad()\n");
		// Check if site is on list
		if ( CheckList( ) )
		{
			dump("checklist\n");
			var head = content.document.getElementsByTagName('head')[0];
			var author = content.document.createElement('input');
			author.type = 'hidden';
			author.value = 'none';
			author.id = 'HiddenAuthor';
			head.appendChild(author);
			author.addEventListener("click", AuthorFound, true);
			
			var storedInfo = content.document.createElement('input');
			storedInfo.type = 'hidden';
			storedInfo.value = 'none';
			storedInfo.id = 'HiddenInfo';
			head.appendChild(storedInfo);
			
			AddPageStyle ( );
			if ( DisplayOnLoad ( ) )
				EditPage (true);
			else
				EditPage (false);
		}
    }
}  
window.addEventListener("load", function() { myExtension.init(); }, false);  

var sites = ['www.counterpunch.org', 'www.nytimes.com', 'www.huffingtonpost.com'];

function setUpDefaultSiteList ( )
{
	var file = DirIO.get("ProfD"); 
	file.append("extensions");
//	file.append("newssleuth@news.sleuthdir");
//	if (!file.exists())
//		DirIO.create(file);

	file.append("SiteList.txt");
	
	if ( !file.exists() ) {
		FileIO.create(file);
	} else {
		return;
	}
	
	FileIO.write(file, sites[0] + '\n');
	for (var i = 1; i < sites.length; i++) {
		FileIO.write(file, sites[i] + '\n', 'a');
	}
}
