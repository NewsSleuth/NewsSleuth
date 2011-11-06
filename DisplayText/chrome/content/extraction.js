jQuery.noConflict();
jQuery(document).ready(function($){
	
	function XMLAccessError() {
		alert("XML Access Error");
		//need to recover from this
	};
	
	function YahooQuery($rss) {
		//use Yahoo Query Api to get XML
		var query = "select * from xml where url = "+ $rss";
		var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=xml";
		$.ajax({
			type: "GET",
			url: $rss,
			dataType: "xml",
			success: parseRSS,
			error: XMLAccessError
		});
	};

	extract();
//<link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="http://www.counterpunch.org/feed/" />
	function extract() {
		dump("inside extract()\n");
		var $title = null;
		$title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if ($title==null) {
			$title = $("h1").first().text(); //if og:title didn't work, get title from first h1
		};
//		$('#out1').append("Title: "+$title+"<br/>");
//		alert("Title: "+$title);

		var $author = null;
		var $source = null;	//should get source from copyright too
		var $rss = null
		$rss = $("link[type='application/rss+xml']").attr("href");
//		$rss = "http://www.umich.edu/~malvi/tariq.xml" //for demo
//		$('#out1').append("RSS: "+$rss+"<br/>");
		alert("Title: "+$title+"\nRSS: "+$rss);
	
	
		$.ajax({
			type: "GET",
			url: $rss,
			dataType: "xml",
			success: parseRSS,
			error: YahooQuery($rss)
		});
		
		function parseRSS(xml) {
			$source = $(xml).find("title").first().text();
			$source = $source.replace(/:.*$/, ""); //process source

			$(xml).find("item").find("title").each(function() {
				if ($(this).text()==$title) {

					$author = $(this).siblings("dc\\:creator").text();

				};

			});
			$author = fixAuthor($author);
			dump("$author: " + $author + "\n");
			callWikipediaAPI($author, false);

		};
	};
		

	//dummy

});