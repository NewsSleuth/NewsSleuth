//alert("jquery");
jQuery.noConflict();
jQuery(document).ready(function($){
	alert("extraction.js is running");
	



	
	
	function parseError() {
	
			alert("RSS access error!");
	};

	
	extract();
//<link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="http://www.counterpunch.org/feed/" />
	function extract() {
		var $title = null;
		$title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if ($title==null) {
			$title = $("h1").first().text(); //if og:title didn't work, get title from first h1
		};
//		$('#out1').append("Title: "+$title+"<br/>");
		alert("Title: "+$title);

		var $author = null;
		var $source = null;	//should get source from copyright too
		var $rss = null
		$rss = $("link[type='application/rss+xml']").attr("href");
//		$('#out1').append("RSS: "+$rss+"<br/>");
		alert("RSS: "+$rss);
	
	
		$.ajax({
			type: "GET",
			url: $rss, //why doesn't it work if I put in $rss?
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
					alert("title match found");
	//					$('#out1').append("found match: ");
	//					$('#out1').append($(this).text()+"<br/>");

					$author = $(this).siblings("dc\\:creator").text();
	//					$('#out1').append("Author: "+$author+"<br/><br/>");
				};

			});
			alert("Author: "+$author+"\nSource: "+$source);
			//added
			callWikipediaAPI($author, false);
		};
	};
		

	

});
