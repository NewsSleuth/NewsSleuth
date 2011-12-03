var win = null;
function AuthorWindow (author, info)
{
	win = window.open("", "authorInfoWindow", "status=1,width=500,height=300,scrollbars=yes, resizable=yes");
	win.addEventListener('beforeunload', windowClose, true);
	win.document.bgColor = '#F1EDC2';
	var style = win.content.document.createElement("link");
	style.id = "headertext-style";
	style.type = "text/css";
	style.rel = "stylesheet";
	style.href = "chrome://DisplayText/content/popup.css";
	
	var doc = win.content.document;
//	if (info === 'nopage')
//		info = 'No information found for ' + fixAuthor(author);
//	AuthorInfo.appendChild(doc.createTextNode(info));

	var div = doc.createElement('div');
	div.id = 'win_div_id';

	win.content.document.body.appendChild(style);
	win.content.document.body.appendChild(div);

	
	// Write publication info to window
	var pname = content.document.getElementById('HiddenPublication').value;
	if (pname && pname != 'none')
	{
		var PubName = doc.createElement('p');
		//var pname =  content.document.getElementById('HiddenPublication').value;

		PubName.appendChild(doc.createTextNode(pname));
		PubName.className = 'popupAuthorClass';
		div.appendChild(PubName);
		
		var pinfo= content.document.getElementById('publication_id');
		writeInfo(div, pinfo, 1);
		pinfo = content.document.getElementById('pSummary_id');
		writeInfo(div, pinfo, 0);
	}
	// Write author info to window
	var aname = content.document.getElementById('HiddenAuthor').value;
	if (aname && aname != 'none')
	{
		var AuthorName = doc.createElement('p');
		
		AuthorName.appendChild(doc.createTextNode(fixAuthor(aname)));
		AuthorName.className = "popupAuthorClass";
		div.appendChild(AuthorName);
		
		var ainfo = content.document.getElementById('info_id');
		writeInfo(div, ainfo, 1);
		ainfo = content.document.getElementById('aSummary_id');
		writeInfo(div, ainfo, 0);
	}
	
	popup = false;
}

function writeInfo(div, info, start)
{
	var doc = win.content.document,
		cn = info.childNodes;
	for (var i = start; i < cn.length; i++)
	{
		var content = cn[i].innerHTML;

		var p = doc.createElement('p');
		var copy = doc.createTextNode(content);
		p.appendChild(copy);
		div.appendChild(p);
	}
	
}

function windowClose() {
		win = null;
}