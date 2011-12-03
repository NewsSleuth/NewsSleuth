jQuery.noConflict();
jQuery(document).ready(function($){
	setSource();
	//$('#HiddenAuthor').trigger('click');
	setAuthor();
	
	function setAuthor() {
		var author = null;
		
		for (var attempt = 0; attempt < 2; attempt++) {
			if (attempt == 0) 
				author = getAuthorFromMeta();
			else
				author = getAuthorByRegex();
				
			if (author != null)
				break;
		}
		//alert(author);
		if (author == null) {
			author = doAuthorFromRSS();
		}
		else {	
			EditAuthorElement(author);
			$('#HiddenAuthor').trigger('click');
		}
	}
	
	function setSource() {
		var source = null;
		
		for (var attempt = 0; attempt < 3; attempt++) {
			if (attempt == 0) 
				source = getSourceFromMeta();
			else if (attempt == 1)
				source = getSourceFromCopyright();
			else
				source = getSourceFromTitle();
				
			if (source != null) {
				source = fixSource(source);
				break;
			}
		}
		
		EditPublicationElement(source);
	}	
	
	function getSourceFromMeta() {
		//alert("getSourceFromMeta");
		var source = $("meta[property='og:site_name']").attr("content");
		if (source == null)
			return null;
		return source;
	
	}
	
	function getSourceFromTitle() {
		//alert("getSourceFromTitle");
		return null;
	}
	
	function getSourceFromCopyright() {
		//alert("getSourceFromCopyright");
		var $div = $("<div>");

		$.expr[":"].containsEnc = function(a, b, c, d) {
			var decoded = $div.html(c[3]).text();
			
			return ~a.textContent.indexOf(decoded);
		};

		var foundin = $('*:containsEnc("&copy")').first();
		var text = foundin.text();

		var index = text.indexOf("\u00a9");
		if (index == -1)
			return null;
		
		text = text.substr(index, 200);
		
		var match = /\u00a9[\W\s\d]*([\w ]*(?:\.\w+)?)/.exec(text);
		if (match.length > 1)
			return match[1];
		return null;
	}
	
	function fixSource(source) {
		source = source.replace(/\s+(inc|llc)$/i, "");
		return source
	}
	
	function doAuthorFromRSS() {
		//alert("doAuthorFromRSS");
		var author = null;
		var title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if (title==null) {
			var select = $("h1");
			if (select == null)
				return null;
			title = select.first().text(); //if og:title didn't work, get title from first h1
		};
		//alert('"'+title+'"');
		
		var $rss = $("link[type='application/rss+xml']").attr("href");
		if ($rss == null)
			return null;
		
		$.ajax({
			type: "GET",
			url: $rss,
			dataType: "xml",
			success: parseRSS,
			error: YahooQuery
		});
		
		function parseRSS(xml) {
			//alert("parsing XML");
			
			$(xml).find("title").each(function() {
				//alert('this: "'+$(this).text().toString()+'"\ntitle: "'+title.toString()+'"\n'+($(this).text().toString() == title.toString()));
				if ($(this).text().toString()==title.toString()) {
					var select =$(this).siblings("dc\\:creator");
					if (select == null)
						select = $(this).siblings("author").children("name");
					if (select != null)
						author = select.text();
					//alert(author);
					return 10;
					return false;
				};

			});
			
			dump("author: " + author + "\n");
			// write author's name to hidden element on page for 
			//		extension to lookup
			if (author == null)
				XMLAccessError();
			else
				EditAuthorElement(author);
			
			//alert("author found: "+$author);
			// trigger extensions code to start running
			$('#HiddenAuthor').trigger('click');
		};
		
		function YahooQuery() {
			//use Yahoo Query Api to get XML
			var query = "select * from xml where url = "+ $rss;
			var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=xml";
			$.ajax({
				type: "GET",
				url: $rss,
				dataType: "xml",
				success: parseRSS,
				error: XMLAccessError
			});
		};
	};
	function XMLAccessError() {
		//alert("XML Access Error");
		EditAuthorElement('RSS error');
		$('#HiddenAuthor').trigger('click');
	};
	

	
	function getAuthorFromMeta() {
		//alert("getAuthorFromMeta");
		var author = $("meta[name='author']").attr("content");
		if (author == null)
			return null;
		return author;
	}
	
	function getAuthorByRegex() {
		//alert("getAuthorByRegex");
		return null;
		var authorRawT = "";
		//alert(authorRawT.length);

		var html = $("body").html();
		//alert("body: "+html);
		
		
		var byline = /(<[^\/<]*>)\s*(?:(?:<[^<]*>)\s*)*\s*By\s+/i.exec(html);
		var test = '<author id="monkey" class= "mainauthorstyle">';
		alert(test);
		
		var re = /<\s*(\w*)\s*/i;
		var match = re.exec(test);
		var query = match[1];
		alert(query);
		
		var att_re = /<\s*\w*\s*(?:(\w*)\s*=\s*([\w'"]*)\s*)*\s*>/igm;
		att_re.lastIndex = re.lastIndex;
		alert(match[1]+'\n'+match[2]);
		
		match = att_re.exec(test);
		alert(match[1]+'\n'+match[2]);
		
		
		//var t = $("nyt_byline");
		//alert(t.text());
		//<\s*(\w*)\s*(?:(\w*)\s*=\s*([\w'"]*)\s*)?\s*>?/
		
		

		//var match = />\s*by\s+([\w\-\s,]+)/i.exec(html);
		//alert(match[1]);
		//return match[1];

		// //huffington post//
		// if (authorRawT.length == 0) {
			// authorRawT = $("meta[name='author']").attr("content");
			// alert("var "+authorRawT);
			// //alert(".text() "+authorRawT.text());
		// };

	}
	
	function getSource() {
		var source = getSourceFromCopyRight();
		
		//alert(source);
		EditAuthorElement(null, source);
		$('#HiddenAuthor').trigger('click');
	}
	
	

	


	function extract() {
		dump("inside extract()\n");
		var $title = null;
		$title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if ($title==null) {
			$title = $("h1").first().text(); //if og:title didn't work, get title from first h1
			//what if no h1?
		};


		
		var $source = null;	//should get source from copyright too
		var $rss = null
		$rss = $("link[type='application/rss+xml']").attr("href");
		//alert("Title: "+$title+"\nRSS: "+$rss);
	
	
		$.ajax({
			type: "GET",
			url: $rss,
			dataType: "xml",
			success: parseRSS,
			error: YahooQuery
		});
		
		function parseRSS(xml) {
			alert("parsing XML");
			$source = $(xml).find("title").first().text();
			$source = $source.replace(/:.*$/, ""); //process source
			var $author = null;
			$(xml).find("title").each(function() {
				if ($(this).text()==$title) {

					$author = $(this).siblings("dc\\:creator").text();
					return false;
				};

			});
			
			dump("$author: " + $author + "\n");
			// write author's name to hidden element on page for 
			//		extension to lookup
			EditAuthorElement($author, 'WSJ');
			
			alert("author found: "+$author);
			// trigger extensions code to start running
			$('#HiddenAuthor').trigger('click');
		};
		
		function YahooQuery() {
			//use Yahoo Query Api to get XML
			var query = "select * from xml where url = "+ $rss;
			var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=xml";
			$.ajax({
				type: "GET",
				url: $rss,
				dataType: "xml",
				success: parseRSS,
				error: XMLAccessError
			});
		};
	};

});

function EditElementValue(id, value) {
	var Element = content.document.getElementById(id);
	if (value == null) {
		if (Element.value == "none")
			Element.value = value;
	}
	else
		Element.value = value;
	//alert(Element.value);
}

function EditAuthorElement(author) {dump('editauthor');
	EditElementValue('HiddenAuthor', author);
}

function EditPublicationElement(source) {dump('editpub');
	EditElementValue('HiddenPublication', source);
}

function EditAuthorElement(author, publication)
{dump('editauthorelement');
	var AuthorElement = content.document.getElementById('HiddenAuthor');
	//alert(AuthorElement.value);
	if (author == null) {
		if (AuthorElement.value == "none")
			AuthorElement.value = author;
	}
	else
		AuthorElement.value = author;

	var PublicationElement = content.document.getElementById('HiddenPublication');
	if (publication == null) {
		if (PublicationElement.value == "none")
			PublicationElement.value = publication;
	}
	else
		PublicationElement.value = publication;
}