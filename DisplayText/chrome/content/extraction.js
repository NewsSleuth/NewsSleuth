//alert("jquery");
jQuery.noConflict();
jQuery(document).ready(function($){
//	alert("extraction.js is running");

	function parseError() {
	
			alert("RSS access error!");
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
			error: parseError
			//need to do something on failure
		});
		
		function parseRSS(xml) {
			$source = $(xml).find("title").first().text();
			$source = $source.replace(/:.*$/, ""); //process source
	//			$('#out1').append("Source: "+$source+"<br/>");

			$(xml).find("item").find("title").each(function() {
				if ($(this).text()==$title) {
	//				alert("title match found");
	//					$('#out1').append("found match: ");
	//					$('#out1').append($(this).text()+"<br/>");

					$author = $(this).siblings("dc\\:creator").text();
	//				alert("Author: "+$author+"\nSource: "+$source);	
	//				alert("popup: "+popup);								
	//				test();
					//callWikipediaAPI($author);
	//					$('#out1').append("Author: "+$author+"<br/><br/>");
				};

			});
			alert("Author: "+$author+"\nSource: "+$source);
			//added
			$author = fixAuthor($author);
			dump("$author: " + $author + "\n");
			callWikipediaAPI($author/*"Tariq Ali"*/, false);
		};
	};
		

	//dummy

});
