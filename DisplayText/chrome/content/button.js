var CustomButton = {
	onCommand: function (event) {
		var doc = content.document;

		popup = true;
		
		//HideText ( );
		//var toggle = doc.getElementById('info_id');
		//toggle.click();

		var AuthorElement = doc.getElementById('HiddenAuthor');
		var author = AuthorElement.value;
		if (author === 'none') {
			var body = content.document.body;
//			var head = content.document.getElementsByTagName('h1')[0];
			if (body)
			{
				var jquery = content.document.createElement("script");
				jquery.type = "text/javascript";
				jquery.src = "chrome://DisplayText/content/jquery.js";

				var ext = content.document.createElement("script");
				ext.type = "text/javascript";
				ext.src = "chrome://DisplayText/content/extraction.js";

				//body.appendChild(jquery);
				body.appendChild(ext);
			}
			else
				alert("no body");
		} else if (author === 'RSS error') {
			alert('rss error');
		} else {
			callWikipediaAPI(author);
		}
	//	popup = false;
	}
}
