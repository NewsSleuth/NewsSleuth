jQuery.noConflict();
jQuery(document).ready(function($){
	extract();
	
	function XMLAccessError() {
		alert("XML Access Error");
		//need to recover from this
	};
	
	function YahooQuery($rss) {
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

	function extract() {
		dump("inside extract()\n");
		var $title = null;
		$title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if ($title==null) {
			$title = $("h1").first().text(); //if og:title didn't work, get title from first h1
			//what if no h1?
		};


		var $author = null;
		var $source = null;	//should get source from copyright too
		var $rss = null
		$rss = $("link[type='application/rss+xml']").attr("href");
		alert("Title: "+$title+"\nRSS: "+$rss);
	
	
		$.ajax({
			type: "GET",
			url: $rss,
			dataType: "xml",
			success: parseRSS,
			error: YahooQuery($rss)
		});
		
		function parseRSS(xml) {
			alert("parsing XML");
			$source = $(xml).find("title").first().text();
			$source = $source.replace(/:.*$/, ""); //process source

			$(xml).find("item").find("title").each(function() {
				if ($(this).text()==$title) {

					$author = $(this).siblings("dc\\:creator").text();
					alert("author found: "+$author);
				};

			});
			$author = fixAuthor($author);
			dump("$author: " + $author + "\n");
			callWikipediaAPI($author, false);

		};
	};

});