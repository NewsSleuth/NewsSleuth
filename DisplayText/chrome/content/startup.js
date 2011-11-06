
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

		
/*				if (afterId) {
					let elem = document.getElementById(afterId);  
					if (elem && elem.parentNode == toolbar)  
						before = elem.nextElementSibling;  
				}  
*/	  
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
	
		var head = content.document.getElementsByTagName('head')[0];
		var author = content.document.createElement('input');
		author.type = 'hidden';
		author.value = 'none';
		author.id = 'HiddenAuthor';
		head.appendChild(author);
		author.addEventListener("click", AuthorFound, true);
		
		if ( DisplayOnLoad ( ) )
		{
			// Check if page is on list of URLs
			var onList = CheckList( );
			if (onList)
			{
				AddPageStyle ( );
				// Display Author info on page
				EditPage (true);
			}
		}
		else if ( CheckList ( ) )
		{
			AddPageStyle ( );
			// Display 'show' option on page
			EditPage (false);
		}
    }
}  
window.addEventListener("load", function() { myExtension.init(); }, false);  
