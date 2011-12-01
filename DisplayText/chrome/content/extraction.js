jQuery.noConflict();
jQuery(document).ready(function($){
	getSource();
	
	function getAuthor() {
		var authorRawT = "";
		//alert(authorRawT.length);

		var html = $("body").html();
		alert("body: "+html);
		

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
	
	function alertText(text) {
		alertQuote("'"+text+"'");
	}
	
	function getSource() {
		var source = getSourceFromCopyRight();
		source = fixSource(source);
		//alert(source);
		EditAuthorElement(null, source);
		$('#HiddenAuthor').trigger('click');
	}
	
	function getSourceFromCopyRight() {
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
	function XMLAccessError() {
//		alert("XML Access Error");
		EditAuthorElement('RSS error');
		// trigger extension code to start running
		$('#HiddenAuthor').trigger('click');
	};
	


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
			EditAuthorElement($author, 'none');
			
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
function EditAuthorElement(author, publication)
{
	var AuthorElement = content.document.getElementById('HiddenAuthor');
	//alert(AuthorElement.value);
	AuthorElement.value = author;
	var PublicationElement = content.document.getElementById('HiddenPublication');
	PublicationElement.value = publication;
}