
var checkbox = {
	onCommand: function(checked) {
		// Sets 'DisplayOnLoad' pref when checked or unchecked from preference window
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("NewsSleuth.");
		
		prefs.setBoolPref("DisplayOnLoad", checked);
	}
}


var addNewSite = {
	onCommand: function(site) {

		var inputbox = document.getElementById('addsiteid');
		inputbox.value = '';
	
		var wwwIndex = site.indexOf('www.');
		if (wwwIndex === -1) 
		{
			// append 'www.' to beginning of site name
			var www = 'www.'
			site = www.concat(site);
		}
		else if (wwwIndex !== 0)
		{
			// site wasn't written properly
			alert("Use form: 'www.nytimes.com'");
			return;
		}
		//alert(site);
		
		// Add site to file
		var file = GetPath ( );		
		if ( !file.exists() )
		{
			FileIO.create(file);
		}
		
		// Check if site is already on file
		var fileContents = FileIO.read(file);
		var line = fileContents.split("\n");
		
		for (var i=0; i < line.length; i++)
		{
			if ( site == line[i] )
			{
				alert ("site is already in file");
				return;
			}
		}
		FileIO.write(file, site + '\n', 'a');
		
		// Update list of sites in popup window
		var sitebox = document.getElementById('sitebox');
		var row = document.createElement('listitem');
	    row.setAttribute('label', site);
	    
  	    list.appendChild(row);
//		sitebox.value += site + '\n';
		
	}
}

function removeSiteHandle (index)
{
	if (index === -1)
		return;

	var list = document.getElementById('sitebox');
	var siteItem = list.getItemAtIndex(index);
	var site = siteItem.label;
	
	list.removeItemAt(index);
	
	var file = GetPath( );
	if (!file.exists())
	{
		alert ("File doesn't exist");
		return;
	}

	var fileContents = FileIO.read(file);
	var lines = fileContents.split("\n");
	var first = true;
	for (var i = 0; i < lines.length - 1; i++)
	{
		if ( site != lines[i] )
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
	
	// Disable button
	document.getElementById('buttonid').disabled=true;
}




