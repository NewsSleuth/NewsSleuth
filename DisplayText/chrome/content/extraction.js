jQuery.noConflict();
jQuery(document).ready(function($){

	setSource();
	setAuthor();
	
	function setAuthor() {
		getAuthorFromMeta();
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
			if (source != null)
				break;
		}
		EditPublicationElement(source);
	}	
	
	function getSourceFromMeta() {
		var source = $("meta[name='source']").attr("content");
		if (source == null) {
			source = $("meta[property='og:site_name']").attr("content");
			if (source == null)
				return null;
		}
		return source;
	
	}
	
	function getSourceFromTitle() {
		var select = $("title");
		if (select.length == 0)
			return null;
		var title = select.text();
		var match = /([\w\s\.]*)$/.exec(title);
		if (match != null)
			return match[1];
		return null;
	}
	
	function getSourceFromCopyright() {
		var $div = $("<div>");

		$.expr[":"].containsEnc = function(a, b, c, d) {
			var decoded = $div.html(c[3]).text();
			
			return ~a.textContent.indexOf(decoded);
		};

		//var foundin = $('*:containsEnc("&copy")').first();
		
		var text = $("body").clone().find("script").remove().end().text();
		

		var index = text.lastIndexOf("\u00a9");
		if (index == -1) {
			index = text.lastIndexOf("Copyright");
			if (index == -1)
				return null;
		}
		
		var slice = text.substr(index, 200);
		
		var match = /(?:\u00a9\s*|copyright\s*)+[^<A-z]*([\w\u00a0 ]+(?:\.\w+)?)/i.exec(slice);
		if (match != null) {
			var author = match[1].replace(/\s*All\s*Rights\s*Reserved\.*\s*/ig,"");
			if (author.length == 0 || /^\s+$/.test(author))
				return null;
			else
				return author;
		}
		return null;
	}
	
	function getAuthorFromRSS() {
		var author = null;
		var title = $("meta[property='og:title']").attr("content"); //get title from og:title
		if (title==null) {
			var select = $("h1");
			if (select == null) {
				getAuthorByAttr();
				return;
			}
			title = select.first().text().replace(/\u00a0/g, " ");
		};
		
		var $rss = $("link[type='application/rss+xml']").attr("href");
		if ($rss == null) {
			$rss = $("link[type='application/atom+xml']").attr("href");
			if ($rss == null) {
				getAuthorByAttr();
				return;
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
			
			$(xml).find("title").each(function() {
				var this_title = $(this).text();

				this_title =this_title.replace(/\u00a0/g, " ")
				if (this_title.toString()==title.toString()) {
					var select =$(this).siblings("dc\\:creator");
					if (select.length == 0) {
						select = $(this).siblings("author").children("name");
						if (select.length == 0)
							select = $(this).siblings("author");
					}
					if (select.length > 0)
						author = select.text();
					return false;
				};

			});
			
			dump("author: " + author + "\n");

			if (author == null || /^\w*$/.test(author))
				getAuthorByAttr();
			else
				setAuthorAndClick(author);
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
				error: getAuthorByAttr
			});
		};
	};
	function XMLAccessError() {
		setAuthorAndClick('RSS error');
	};
	
	function getAuthorByAttr() {
		
		var author = getBylineAttribute();
		if (author == null) {
			author = getAuthorAttribute();
			if (author == null) {
				getAuthorByRegex();
				return;
			}
		}
		else if (/\d/.test(author)){
			var author2 = getAuthorAttribute();
			if (author2 != null) {
				setAuthorAndClick(author2);
				return;
			}
		}
		setAuthorAndClick(author);
	}
	
	function getAuthorAttribute() {
		var select = $("body [id='author'],body [class='author'],body [name='author'],body [rel='author'],body [href*=author]");
		if (select.length == 0)
			return null;

		return select.first().text();
	}
	
	function getBylineAttribute() {
		var select = $("body [id='byline'],body [class='byline'],body [name='byline'],body [rel='byline']");
		if (select.length == 0)
			return null;

		return select.text();
	}
	
	
	
	function getAuthorFromMeta() {
		var author = $("meta[name='author']").attr("content");
		if (author == null)
			getAuthorFromRSS();
		else {
			setAuthorAndClick(author);
		}
	}
	
	function getAuthorByRegex() {

		var html = $("body").html();
		html = html.replace(/<\s*br\s*>/ig, "<br/>");
		
		var match = /<([^\/<]*)>(\s*By[:\s]+)/i.exec(html);		
		
		if (match != null) {
			var select = $(tagToSelector(match[1]));
			var author = null;
			select.each(function() {

				if ($(this).text().indexOf(match[2]) == 0) {
					author = $(this).text().replace(/\s*show author\s*/i, "")
					.replace(match[2],"").trim().split(/[\n\r]/)[0];
					return false;
				}
			});
			if (author == null)
				XMLAccessError();
			else {
				setAuthorAndClick(author);
			}
		}
		else {
			XMLAccessError();
		}
	}
	
	function tagToSelector(tag) {
	
		tag = tag.replace(/^\s*/, '').replace(/\s*$/, '');
		//alert(tag);
		
		var selector = tag.split(/\s+/, 1)[0];
		
		var re = new RegExp(/\s*([^=\s]*)\s*=\s*([^\s"']+|"[^"]*"|'[^']*')/g);
		while (re.lastIndex != tag.length) {
			var match = re.exec(tag);
			if (match == null)
				break;
			if (match[1] == "id")
				selector += '#' + match[2].replace(/["']/g, "");
			else if (match[1] == "class")
				selector += '.' + match[2].replace(/["']/g, "");
			else
				selector += '['+match[1]+'='+match[2]+']';		
		};
		return selector;
	}
	
	function setAuthorAndClick(author) {
		author = author.replace(/^(?:By[\s:]+)?\s*((?:[\s\-\.]?[A-Z]?[a-z]?)+).*$/i, "$1")
		.replace(/\.$/,"").replace(/[ \u00a0]+/, " ").split(/\s+and\s+/)[0];

		EditAuthorElement(author);
		$('#HiddenAuthor').trigger('click');
	}
});

function replaceAcronyms(author) {
	author = author.replace(/^\s*rt\s*$/i, "Russia Today")
	.replace(/^\s*ap\s*$/i, "Associated Press")
	.replace(/^\s*afp\s*$/i, "Agence France-Presse");
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
}

function EditAuthorElement(author) {dump('editauthor');
	if (author != null)
		author = replaceAcronyms(author);

	EditElementValue('HiddenAuthor', author);
}



function EditPublicationElement(source) {dump('editpub');
	if (source != null)
		source = source.trim().replace(/\s+(inc|llc)$/i, "")
		.replace(/^www\./i, "");
	EditElementValue('HiddenPublication', source);
}
