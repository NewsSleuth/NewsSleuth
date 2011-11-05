var CustomButton = {
	onCommand: function (event) {
		var doc = content.document;
		var popupElement = doc.getElementById("popupElement");
		popupElement.value = "true";
		
		HideText ( );
		var DelShow = doc.getElementById( HideParagraphId( ) );
	if (DelShow)
		DelShow.parentNode.removeChild(DelShow);
		var head = content.document.getElementsByTagName('h1')[0];
				if (head)
				{
					var d = content.document.createElement('div');
					d.id = "out1";
					
					var cont = content.document.createElement("script");
					cont.type = "text/javascript";
					cont.src = "chrome://DisplayText/content/jquery.js";
				
					var wiki = content.document.createElement("script");
					wiki.type = "text/javascript";
					wiki.src = "chrome://DisplayText/content/lookup.js";
					
					var  api= content.document.createElement("script");
					api.type = "text/javascript";
					api.src = "chrome://DisplayText/content/api.js";
					
					var  bro= content.document.createElement("script");
					bro.type = "text/javascript";
					bro.src = "chrome://DisplayText/content/browser.js";

					var c = content.document.createElement("script");
					c.type = "text/javascript";
					c.src = "chrome://DisplayText/content/extraction.js";
					
					var button = content.document.createElement("script");
					button.type = "text/javascript";
					button.src = "chrome://DisplayText/content/button.js";
					
					head.appendChild(d);
					head.appendChild(button);
					head.appendChild(bro);
					head.appendChild(api);
					head.appendChild(wiki);
					head.appendChild(cont);
					head.appendChild(c);
					
//					jQuery.noConflict();
//					jQuery(document).ready(function($){
//						extract();
//						});
					//callWikipediaAPI("Tariq Ali", false);
				}
				else
					alert("no head");
		
//		callWikipediaAPI("Bill Clinton", true);
//		DisplayPopupInfo( );
	}
}
