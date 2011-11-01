
var checkbox = {
	onCommand: function(checked) {
		// Sets 'DisplayOnLoad' pref when checked or unchecked from preference window
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("NewsSleuth.");
		
		prefs.setBoolPref("DisplayOnLoad", checked);
	}
}