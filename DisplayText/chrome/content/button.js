var CustomButton = {
	onCommand: function (event) {
		var doc = content.document;

		popup = true;
		
		//HideText ( );
		//var toggle = doc.getElementById('info_id');
		//toggle.click();

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

				//head.appendChild(jquery);
				head.appendChild(ext);
			}
			else
				alert("no head");
				
		}
	}
}
