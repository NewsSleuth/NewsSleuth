jQuery.noConflict();
jQuery(document).ready(function($){
	//test();
	
	function test() {
		alert($(".byline").text());
	}
	
	
	setSource();
	//$('#HiddenAuthor').trigger('click');
	setAuthor();
	
	function setAuthor() {
		//alert("setAuthor");
	
		var author = null;
		
		for (var attempt = 0; attempt < 3; attempt++) {
			if (attempt == 0) 
				author = getAuthorFromMeta();
			else if (attempt == 1)
				author = getAuthorByAttr();
			else
				author = getAuthorByRegex();
				
			if (author != null)
				break;
		}
		//alert(author);
		if (author == null) {
			doAuthorFromRSS();
		}
		else {
			match = /^(?:By\s+)?\s*([\w\s\-]*)/i.exec(author);
			//select.text().replace(/^By\s+/, "");
			if (match != null)
				author = match[1];
			EditAuthorElement(author);
			$('#HiddenAuthor').trigger('click');
		}
	}
	
	function setSource() {
		//alert("setSource");
	
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
		//alert(source);
		EditPublicationElement(source);
	}	
	
	function getSourceFromMeta() {
		//alert("getSourceFromMeta");
		var source = $("meta[name='source']").attr("content");
		if (source == null) {
			source = $("meta[property='og:site_name']").attr("content");
			if (source == null)
				return null;
		}
		return source;
	
	}
	
	function getSourceFromTitle() {
		//alert("getSourceFromTitle");
		var select = $("title");
		if (select.length == 0)
			return null;
		var title = select.text();
		//alert(title);
		var match = /([\w\s]*)$/.exec(title);
		//alert(match.length);
		if (match != null)
			return match[1];
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
		
		var text = $('body').text(); //foundin.text();
		

		var index = text.lastIndexOf("\u00a9");
		if (index == -1)
			return null;
		
		text = text.substr(index, 200);
		
		var match = /\u00a9[\W\s\d]*([\w ]*(?:\.\w+)?)/.exec(text);
		if (match != null)
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
			if (select == null) {
				EditAuthorElement(null);
				$('#HiddenAuthor').trigger('click');
				return null;
			}
			//alert(select.first().text().indexOf("\u00a0"));
			title = select.first().text().replace(/\u00a0/g, " ");
			//if og:title didn't work, get title from first h1
		};
		//alert('"'+title+'"');
		
		var $rss = $("link[type='application/rss+xml']").attr("href");
		if ($rss == null) {
			$rss = $("link[type='application/atom+xml']").attr("href");
			if ($rss == null) {
				EditAuthorElement(null);
				$('#HiddenAuthor').trigger('click');
				return null;
			}
		}
		
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
				var this_title = $(this).text();
				//alert('this: "'+this_title.toString()+'"\ntitle: "'+title.toString()+'"\n'+($(this).text().toString() == title.toString()));
				//alert(this_title.indexOf("\u00a0"));
				this_title =this_title.replace(/\u00a0/g, " ")
				if (this_title.toString()==title.toString()) {
					var select =$(this).siblings("dc\\:creator");
					if (select == null)
						select = $(this).siblings("author").children("name");
					if (select != null)
						author = select.text();
					//alert(author);
					return false;
				};

			});
			
			dump("author: " + author + "\n");

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
	
	function getAuthorByAttr() {
		//alert("getAuthorByAttr");
		var author = getAuthorAttribute();
		if (author == null) {
			author = getBylineAttribute();
			if (author == null) {
				//alert("if: "+String(author));
				return null;
			}
		}
		//alert("out: "+new String(author));
		return author;
	}
	
	function getAuthorAttribute() {
		var select = $("[id='author'],[class='author'],[name='author'],[rel='author']");

		if (select.length == 0) {
			select = $("[id='Author'],[class='Author'],[name='Author'],[rel='Author']");
			if (select.length == 0) {
				select = $("[id='AUTHOR'],[class='AUTHOR'],[name='AUTHOR'],[rel='AUTHOR']");
				if (select.length == 0)
					return null;
			}
		}
		return select.text();
	}
	
	function getBylineAttribute() {
		var select = $("[id='byline'],[class='byline'],[name='byline'],[rel='byline']");
		if (select.length == 0) {
			select = $("[id='Byline'],[class='Byline'],[name='Byline'],[rel='Byline']");
			if (select.length == 0) {
				select = $("[id='BYLINE'],[class='BYLINE'],[name='BYLINE'],[rel='BYLINE']");
				if (select.length == 0) {
					select = $("[id='ByLine'],[class='ByLine'],[name='ByLine'],[rel='ByLine']");
					if (select.length == 0)
						return null;
				}
			}
		}
		return select.text();
	}
	
	
	
	function getAuthorFromMeta() {
		//alert("getAuthorFromMeta");
		var author = $("meta[name='author']").attr("content");
		if (author == null)
			return null;
		return author;
	}
	
	function getAuthorByRegex() {
		//alert("getAuthorByRegex");
		//return null;

		var html = $("body").html();
		html = html.replace(/<\s*br\s*>/ig, "<br/>");
		//alert("body: "+html);
		
		
		var match = /<([^\/<]*)>\s*(?:(?:<[^<]*>)\s*)*\s*By\s+/i.exec(html);
		if (match != null) {
			var select = $(tagToSelector(match[1]));
			var author = null;
			select.each(function() {
				//alert($(this).text());
				if (/^By\s+/i.test($(this).text())) {
					//alert("match");
					var match = /^By\s+([\w\s\-]*)/i.exec($(this).text());
					if (match != null) {
						author = match[1].replace(/\s*show author\s*/i, "");
						//alert(author);
						return false;
					}
				}
			});
		
			return author;
		}
		else {
			//last tag before 1st <p>
			return null;
		}
	}
	
	function tagToSelector(tag) {
	
		tag = tag.replace(/^\s*/, '').replace(/\s*$/, '');
		//alert(tag);
		
		var selector = tag.split(/\s+/, 1)[0];
		//alert(selector);
		
		var re = new RegExp(/\s*([^=\s]*)\s*=\s*([^\s"']+|"[^"]*"|'[^']*')/g);
		while (re.lastIndex != tag.length) {
			var match = re.exec(tag);
			//alert(match.length);
			if (match == null)
				break;
			//alert(match[1]+'\n'+match[2]);
			if (match[1] == "id")
				selector += '#' + match[2].replace(/["']/g, "");
			else if (match[1] == "class")
				selector += '.' + match[2].replace(/["']/g, "");
			else
				selector += '['+match[1]+'='+match[2]+']';		
		};
		//alert(selector);
		return selector;
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
			//alert("parsing XML");
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

});

function replaceAcronyms(author) {
	author = author.replace(/^rt$/i, "Russia Today").replace(/^ap$/i, "Associated Press");
	return author;
}

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
	if (author != null)
		author = replaceAcronyms(author);

	EditElementValue('HiddenAuthor', author);
}

function EditPublicationElement(source) {dump('editpub');
	EditElementValue('HiddenPublication', source);
}
