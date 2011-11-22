function AuthorWindow (author, info)
{	
	my_window = window.open("", "authorInfoWindow", "status=1,width=500,height=300");
	my_window.document.bgColor = '#F1EDC2';
	var style = my_window.content.document.createElement("link");
	style.id = "headertext-style";
	style.type = "text/css";
	style.rel = "stylesheet";
	style.href = "chrome://DisplayText/content/popup.css";
	
	var NamePara = my_window.content.document.createElement('p');
	NamePara.className = "popupAuthorClass";
	var NameText = my_window.content.document.createTextNode(author);
	NamePara.appendChild(NameText);
	
	var InfoPara = my_window.content.document.createElement('p');
	InfoPara.id = "popupInfo";
	InfoPara.className = "poupInfoClass";
	var content = my_window.content.document.createTextNode(info);
	InfoPara.appendChild(content);
	
	var a = my_window.content.document.createElement('p');
	a.appendChild(NamePara);
	a.appendChild(InfoPara);			

	my_window.content.document.body.appendChild(style);
	my_window.content.document.body.appendChild(a);
	
	
	popup = false;
}
