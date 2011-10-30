/** See talk page for details **/
 
//JsMwApi documentation is at http://en.wiktionary.org/wiki/User_talk:Conrad.Irwin/Api.js
function JsMwApi (api_url, request_type) {
 
	if (!api_url) 
	{
		if (typeof(wgEnableAPI) === 'undefined' || wgEnableAPI == false)
			throw "Local API is not usable.";
 
		api_url = wgScriptPath + "/api.php";
	}
 
	if (!request_type)
	{
		if (api_url.indexOf('http://') == 0 || api_url.indexOf('https://') == 0)
			request_type = "remote";
		else
			request_type = "local";
	}
	function call_api (query, callback)
	{
		if(!query || !callback)
			throw "Insufficient parameters for API call";
 
		query = serialise_query(query);
 
		if(request_type == "remote")
			request_remote(api_url, query, callback, call_api.on_error || default_on_error);
		else
			request_local(api_url, query, callback, call_api.on_error || default_on_error);
 
	}
 
	var default_on_error = JsMwApi.prototype.on_error || function (xhr, callback, res)
	{
		if (typeof(console) != 'undefined')
			console.log([xhr, res]);
 
		callback(null);
	}
 
	function get_xhr () 
	{
		try{
			return new XMLHttpRequest();
		}catch(e){ try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){ try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}catch(e){
			throw "Could not create an XmlHttpRequest";
		}}}
	}
 
	function request_local (url, query, callback, on_error)
	{
		var xhr = get_xhr();
 
		xhr.open('POST', url + '?format=json', true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");                  
		xhr.send(query);
		xhr.onreadystatechange = function ()
		{
			if (xhr.readyState == 4)
			{
				var res;
				if (xhr.status != 200)
					res = {error: {
						code: '_badresponse', 
						info: xhr.status + " " + xhr.statusText
					}};
				else
				{
					try
					{
						res = JSON.parse("("+xhr.responseText+")");
					}
					catch(e)
					{
						res = {error: {
							code: '_badresult',
							info: "The server returned an incorrectly formatted response"
						}};
					}
				}
				if (!res || res.error || res.warnings)
					on_error(xhr, callback, res);
				else
					callback(res);
			}
		}
	}
 
	function request_remote (url, query, callback, on_error)
	{
		if(! window.__JsMwApi__counter)
			window.__JsMwApi__counter = 0;
 
		var cbname = '__JsMwApi__callback' + window.__JsMwApi__counter++; 
 
		window[cbname] = function (res)
		{
			if (res.error || res.warnings)
				on_error(null, callback, res);
			else
				callback(res);
		}
 
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', url + '?format=json&callback=window.' + cbname + '&' + query);
		document.getElementsByTagName('head')[0].appendChild(script);
	}
 
	function serialise_query (obj)
	{
		var amp = "";
		var out = "";
		if (String(obj) === obj)
		{
			out = obj;
		}
		else if (obj instanceof Array)
		{
			for (var i=0; i < obj.length; i++)
			{
				out += amp + serialise_query(obj[i]);
				amp = (out == '' || out.charAt(out.length-1) == '&') ? '' : '&';
			}
		}
		else if (obj instanceof Object)
		{
			for (var k in obj)
			{
				if (obj[k] === true)
					out += amp + encodeURIComponent(k) + '=1';
				else if (obj[k] === false)
					continue;
				else if (obj[k] instanceof Array)
					out += amp + encodeURIComponent(k) + '=' + encodeURIComponent(obj[k].join('|'));
				else if (obj[k] instanceof Object)
					throw "API parameters may not be objects";
				else
					out += amp + encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
				amp = '&';
			}
		}
		else if (typeof(obj) !== 'undefined' && obj !== null)
		{
			throw "An API query can only be a string or an object";
		}
		return out;
	}
 
	// Make JSON.parse work
	var JSON = (typeof JSON == 'undefined' ? new Object() : JSON);
 
	if (typeof JSON.parse != 'function')
		JSON.parse = function (json) { return eval('(' + json + ')'); };
 
	// Allow .prototype. extensions
	if (JsMwApi.prototype)
	{
		for (var i in JsMwApi.prototype)
		{
			call_api[i] = JsMwApi.prototype[i];
		}
	}
	return call_api;
}
 
JsMwApi.prototype.page = function (title) {
 
	function call_with_page (params, callback)
	{
		call_with_page.api([params, {title: title, titles: title}], callback);
	}
 
	call_with_page.api = this;
 
	call_with_page.edit = function (params, edit_function)
	{
		if (typeof(params) == 'function')
		{
			edit_function = params;
			params = null;
		}
		params = [params, {
			action: "query", 
			prop: ["info", "revisions"], 
			intoken: "edit", 
			rvprop: ["content", "timestamp"]
		}];
 
		call_with_page(params, function (res)
		{
			if (!res || !res.query || !res.query.pages)
				return edit_function(null);
 
			// Get the first (and only) page from res.query.pages
			for (var pageid in res.query.pages) break;
			var page = res.query.pages[pageid];
 
			var text = page.revisions ? page.revisions[0]['*'] : '';
 
			function save_function (ntext, params, post_save)
			{
				if (typeof(params) == 'function')
				{
					post_save = params;
					params = null;
				}
				params = [params, {
					action: "edit",
					text: ntext,
					token: page.edittoken,
					starttimestamp: page.starttimestamp,
					basetimestamp: (page.revisions ? page.revisions[0].timestamp : false)
				}];
 
				call_with_page(params, post_save);
			}
 
			edit_function(text, save_function, res);
 
		});
	}
 
	call_with_page.parse = function (to_parse, callback)
	{
		if (typeof to_parse == "function")
		{
			callback = to_parse;
			to_parse = null;
		}
		var params = (to_parse == null ? {page: title} : {title: title, text: to_parse});
 
		call_with_page.api([{action: "parse", pst: true}, params], function (res)
		{
			if (!res || !res.parse || !res.parse.text)
				callback(null, res);
			else
				callback(res.parse.text['*'], res);
		})
	}
 
	call_with_page.parseFragment = function (to_parse, callback)
	{
		call_with_page.parse("<div>\n" + to_parse + "</div>", function (parsed, res)
		{
			callback(parsed ? parsed.replace(/^<div>\n?/,'').replace(/(\s*\n)?<\/div>\n*(<!--[^>]*-->\s*)?$/,'') : parsed, res);
		})
	}
 
	return call_with_page;
}
/**
 * Storage of "string" preferences.
 */
function CookiePreferences (context)
{
	//Repeated calls with the same context should get the same preferences object.
	if (arguments.callee[context])
		return arguments.callee[context];
	else
		arguments.callee[context] = this;
 
	/**
	 * Change the value of a preference and store into a cookie.
	 */
	this.set = function (name, value)
	{
		if (value === null || storage[name] === value)
			return;
		storage[name] = value;
		updateCookie();
	}
 
	/**
	 * Get the value of a preference from the cookie or default
	 *
	 * If the preference isn't set, return the second argument or undefined.
	 */
	this.get = function (name, def)
	{
		if (storage[name])
			return storage[name];
		else if (defaults[name])
			return defaults[name];
		else
			return def;
	}
 
	/**
	 * let the default for get(name) be value for this session
	 */
	this.setDefault = function(name, value)
	{
		defaults[name] = value;
	}
 
	var storage = {};
	var defaults = {};
 
	// Save storage into the cookie.
	function updateCookie ()
	{
		var value = "";
		for (var name in storage)
		{
			value += '&' + encodeURIComponent(name) + "=" + encodeURIComponent(storage[name]);
		}
 
		setCookie('preferences' + context, value)
	}
 
	// Load storage from the cookie.
	// NOTE: If you wish to update the cookie format, both loading and storing
	// must continue to work for 30 days.
	function updateStorage ()
	{
		var value = getCookie('preferences' + context, value) || '';
		var pairs = value.split('&');
 
		for (var i=1; i < pairs.length; i++)
		{
			var val = pairs[i].split('=');
 
			if (storage[val[0]] === val[1])
				continue;
 
			storage[val[0]] = val[1];
		}
	}
 
	//__init__
	updateStorage();
}
/**
 * A generic page editor for the current page.
 *
 * This is a singleton and it displays a small interface in the top left after
 * the first edit has been registered.
 *
 * @public
 * this.page
 * this.addEdit
 * this.error
 *
 */
function Editor ()
{
	//Singleton
	if (arguments.callee.instance)
		return arguments.callee.instance
	else
		arguments.callee.instance = this;
 
	// @public - the JsMwApi object for the current page
	this.page = JsMwApi().page(wgPageName);
 
	// get the current text of the article and call the callback with it
	// NOTE: This function also acts as a loose non-re-entrant lock to protect currentText.
	this.withCurrentText = function(callback)
	{
		if (callbacks.length == 0)
		{
			callbacks = [callback];
			for (var i=0; i<callbacks.length; i++)
			{
				callbacks[i](currentText);
			}
			return callbacks = [];
		} 
 
		if (callbacks.length > 0) 
		{
			return callbacks.push(callback);
		}
 
		callbacks = [callback];
		thiz.page.edit(function (text, _save)
		{
			if (text === null)
				return thiz.error("Could not connect to server");
 
			currentText = originalText = text;
			saveCallback = _save;
 
			for (var i=0; i<callbacks.length; i++)
			{
				callbacks[i](currentText);
			}
			callbacks = [];
 
		});
	}
	// A decorator for withCurrentText
	function performSequentially(f)
	{
		return (function () 
		{
			var the_arguments = arguments;
			thiz.withCurrentText(function ()
			{
				f.apply(thiz, the_arguments);
			});
		});
	}
 
	// add an edit to the editstack
	function addEdit(edit, node, fromRedo)
	{
		withPresenceShowing(false, function ()
		{
			if (node)
			{
				nodestack.push(node);
				node.style.cssText = "border: 2px #00FF00 dashed;"
			}
 
			if (! fromRedo)
				redostack = [];
 
			var ntext = false;
			try
			{
				ntext = edit.edit(currentText);
 
				if (ntext && ntext != currentText)
				{
					edit.redo();
					currentText = ntext;
				}
				else
					return false;
			}
			catch (e)
			{
				this.error("ERROR:" + e);
			}
 
			editstack.push(edit);
		});
	}
	this.addEdit = performSequentially(addEdit);
 
	// display an error to the user
	this.error = function (message)
	{ 
		if (!errorlog)
		{
			errorlog = newNode('ul',{style: "background-color: #FFDDDD; margin: 0px -10px -10px -10px; padding: 10px;"});
			withPresenceShowing(true, function (presence)
			{
				presence.appendChild(errorlog);
			});
		}
		errorlog.appendChild(newNode('li', message));
	}
 
 
	var thiz = this; // this is set incorrectly when private functions are used as callbacks.
 
	var editstack = []; // A list of the edits that have been applied to get currentText
	var redostack = []; // A list of the edits that have been recently undone.
	var nodestack = []; // A lst of nodes to which we have added highlighting
	var callbacks = {}; // A list of onload callbacks (initially .length == undefined)
 
	var originalText = ""; // What was the contents of the page before we fiddled?
	var currentText = ""; // What is the contents now?
 
	var saveCallback; // The callback returned by the api's edit function to save.
 
	var errorlog; // The ul for sticking errors in.
	var savelog; // The ul for save messages.
 
	//Move an edit from the editstack to the redostack 
	function undo ()
	{
		if (editstack.length == 0)
			return false;
		var edit = editstack.pop();
		redostack.push(edit);
		edit.undo();
 
		var text = originalText;
		for (var i=0; i < editstack.length; i++)
		{
			var ntext = false;
			try
			{
				ntext = editstack[i].edit(text);
			}
			catch (e)
			{
				thiz.error("ERROR:" + e);
			}
			if (ntext && ntext != text)
			{
				text = ntext;
			}
			else
			{
				editstack[i].undo();
				editstack = editstack.splice(0, i);
				break;
			}
		}
		currentText = text;
		return true;
	}
	this.undo = performSequentially(undo);
 
	//Move an edit from the redostack to the editstack
	function redo ()
	{
		if (redostack.length == 0)
			return;
		var edit = redostack.pop();
		addEdit(edit, null, true);
	}
	this.redo = performSequentially(redo);
 
	function withPresenceShowing(broken, callback)
	{
		if (arguments.callee.presence)
		{
			arguments.callee.presence.style.display = "block";
			return callback(arguments.callee.presence);
		}
 
		var presence = newNode('div',{'style':"position: fixed; top:0px; left: 0px; background-color: #00FF00; z-index: 10;padding: 30px;"})
		//Fix fixed positioning for IE6/
		/*@cc_on
			@if (@_jscript_version <= 5.6)
				presence.style.cssText = "position: absolute; top: expression((dummy = (document.documentElement.scrollTop || document.body.scrollTop || 0)) + 'px'); background-color: #00FF00; z-index: 10000; padding: 30px;"
			@end
		@*/
		window.setTimeout(function () {
			presence.style.backgroundColor = "#CCCCFF";
			presence.style.padding = "10px";
		}, 400);
 
		presence.appendChild(newNode('div',{'style':"position: relative; top:0px; left:0px; margin: -10px; color: #0000FF;cursor:pointer;", click:performSequentially(close)},"X"))
		document.body.insertBefore(presence, document.body.firstChild);
 
		var contents = newNode('p', {style: 'text-align: center'},
			newNode('b', "Page Editing"), newNode('br'));
 
		if (!broken)
		{
			contents.appendChild(newNode('button',"Save Changes", {'title':'Save your changes ['+mw.util.tooltipAccessKeyPrefix+'s]','accesskey':'s','click': save}));
			contents.appendChild(newNode('br'));
			contents.appendChild(newNode('button',"Undo", {'title':'Undo last change ['+mw.util.tooltipAccessKeyPrefix+'z]','accesskey':'z','click': thiz.undo}));
			contents.appendChild(newNode('button', "Redo", {'click':thiz.redo}));
		}
		presence.appendChild(contents);
 
		arguments.callee.presence = presence;
		callback(presence);
	}
 
	// Remove the button
	function close ()
	{
		while (undo())
			;
 
		withPresenceShowing(true, function (presence)
		{
			presence.style.display = "none";
			if (errorlog)
			{
				errorlog.parentNode.removeChild(errorlog);
				errorlog = false;
			}
		});
	}
 
	//Send the currentText back to the server to save.
	function save ()
	{
		thiz.withCurrentText(function ()
		{
			if (editstack.length == 0)
				return;
 
			var cleanup_callbacks = callbacks;
			callbacks = [];
			var sum = {};
			for (var i=0; i<editstack.length; i++)
			{
				sum[editstack[i].summary] = true;
				if (editstack[i].after_save)
					cleanup_callbacks.push(editstack[i].after_save);
			}
			var summary = "";
			for (var name in sum)
			{
				summary += name + " ";
			}
			editstack = [];
			redostack = [];
			var saveLi = newNode('li', 'Saving:' + summary + "...");
			withPresenceShowing(false, function (presence)
			{
				if (! savelog)
				{
					savelog = newNode('ul', {style: "background-color: #DDFFDD; margin: 0px -10px -10px -10px; padding: 10px;"});
					presence.appendChild(savelog);
				}
				savelog.appendChild(saveLi);
 
				if (originalText == currentText)
					return thiz.error("No changes were made to the page.");
 
				else if (!currentText)
					return thiz.error("ERROR: page has become blank.");
			});
 
			originalText = currentText;
			var nst = []
			var node;
			while (node = nodestack.pop())
			{
				nst.push(node);
			}
			saveCallback(currentText, {summary: summary + "([[WT:EDIT|Assisted]])"}, function (res)
			{
				if (res == null)
					return thiz.error("An error occurred while saving.");
 
				try {
					saveLi.appendChild(newNode('span', newNode('b', " Saved "),
						newNode('a', {'href': wgScript + 
						'?title=' + encodeURIComponent(wgPageName) + 
						'&diff=' + encodeURIComponent(res.edit.newrevid) +
						'&oldid=' + encodeURIComponent(res.edit.oldrevid)}, "(Show changes)")));
				}catch(e){
					if (res.error)
					{
						thiz.error("Not saved: " + String(res.error.info));
					}
					else
					{
						thiz.error(newNode('p',String(e)));
					}
				}
 
				for (var i=0; i < nst.length; i++)
					nst[i].style.cssText = "background-color: #0F0;border: 2px #0F0 solid;";
 
				window.setTimeout(function () {
					var node;
					while (node = nst.pop())
						node.style.cssText = "";
				}, 400);
 
				// restore any callbacks that were waiting for currentText before we started
				for (var i=0; i < cleanup_callbacks.length; i++)
					thiz.withCurrentText(cleanup_callbacks[i]);
 
			});
		});
	}
}
 
var util = {
 
	getVanillaIndexOf: function (str, text, pos)
	{
		if (!pos)
			pos = 0;
		var cpos = 0, tpos = 0, wpos = 0, spos = 0;
		do
		{
			cpos = text.indexOf('<!--', pos);
			tpos = text.indexOf('{'+'{', pos);
			wpos = text.indexOf('<nowiki>', pos);
			spos = text.indexOf(str, pos);
 
			pos = Math.min(
				Math.min(
					cpos == -1 ? Infinity : cpos , 
					tpos == -1 ? Infinity : tpos
				), 
				Math.min(
					wpos == -1 ? Infinity : wpos,
					spos == -1 ? Infinity : spos
				)
			)
 
			if (pos == spos)
				return pos == Infinity ? -1 : pos;
 
			else if (pos == cpos)
				pos = text.indexOf('-->', pos) + 3;
 
			else if (pos == wpos)
				pos = text.indexOf('</nowiki>', pos) + 9;
 
			else if (pos == tpos) //FIXME
				pos = text.indexOf('}}', pos) + 2;
 
 
		} while (pos < Infinity)
		return -1;
	},
 
	validateNoWikisyntax: function(field, nonempty)
	{
		return function(txt, error)
		{
			if(/[\[\{\|#\}\]]/.test(txt))
				return error("Please don't use wiki markup ([]{}#|) in the " + field +".");
			if(nonempty && !txt)
				return error("Please specify a " + field + ".");
			return txt;
		}
	},
 
	escapeRe: function(txt)
	{
		return txt.replace(/([\\{}(\|)[\].?*+])/g, "\\$1");
	},
 
	// pos is a position in the line containing the gloss
	getWikitextGloss: function (txt, pos)
	{
		var g_start = txt.lastIndexOf('\n{'+'{trans-top', pos) + 1; 
		var g_end = txt.indexOf('\n', pos);
		var g_line = txt.substr(g_start, g_end - g_start);
		g_line = g_line.replace("{"+"{trans-top}}", "{"+"{trans-top|Translations}}");
		return g_line.replace(/\{\{trans-top\|(.*)\}\}/, "$1");
	},
 
	// get [start_pos, end_pos] of position of wikitext for trans_table containing node in text
	getTransTable: function (text, node, recursive)
	{
		var gloss = util.getTransGloss(node);
		var pos = 0;
		var transect = [];
		while(pos > -1)
		{
			pos = util.getVanillaIndexOf('{'+'{trans-top', text, pos+1)	// }}
			if (pos > -1 && util.matchGloss(util.getWikitextGloss(text, pos), gloss))
			{
				transect.push(pos);
			}
		}
		if (transect.length > 1)
		{
			var poss = transect;
			transect = [];
			for (var i=0; i<poss.length; i++)
			{
				pos = poss[i];
				if (util.matchGloss(gloss, util.getWikitextGloss(text, pos)))
				{
					transect.push(pos);
				}
			}
 
			if (transect.length > 1 && !recursive)
				transect = util.tieBreakTransTable(text, transect, node);
		}
		if (transect.length == 1)
		{
			pos = transect[0];
			pos = util.getVanillaIndexOf("\n", text, pos) + 1;
			var endpos = text.indexOf('{'+'{trans-bottom}}', pos); 
			if (endpos > -1 && pos > 0)
				return [pos, endpos];
		}
 
		return false;
	},
 
	// try to narrow down the correct poss if multiple matching trans tables
	tieBreakTransTable: function (text, poss, node)
	{
		if (node.nodeName.toLowerCase() == 'div')
		{
			while (node && !(node.className && node.className.indexOf('NavFrame') > -1))
				node = node.parentNode;
 
			var nodes = node.getElementsByTagName('table');
			if (! nodes.length)
				return poss;
 
			node = nodes[0];
		}
		else
		{
			while (node && node.nodeName.toLowerCase() != 'table')
				node = node.parentNode;
		}
 
		var tables = document.getElementsByTagName('table');
		var before_count = 0;
		var after_count = 0;
		var is_found = false;
		for (var i=0; i < tables.length; i++)
		{
			if (tables[i].className.indexOf('translations') >= 0)
			{
				var gloss = util.getTransGloss(tables[i]);
				if (gloss == "Translations to be checked")
					continue;
 
				if (tables[i] == node)
				{
					is_found = true;
					continue;
				}
 
				var pos = util.getTransTable(text, tables[i], true);
 
				if (pos)
				{
					for (var j=0; j < poss.length; j++)
					{
						if (poss[j] == pos)
							return util.tieBreakTransTable(poss.splice(j, 1), node);
					}
				}
				else
				{
					var matched = 0;
					for (var j=0; j < poss.length; j++)
					{
						if (util.matchGloss(util.getWikitextGloss(text, poss[j]), gloss) &&
							 util.matchGloss(gloss, util.getWikitextGloss(text, poss[j])))
						{
							matched++;
						}
					}
					if (matched == poss.length) 
					{
						if (is_found)
							after_count++;
						else
							before_count++;
					}
				}
			}
		}
 
		if (before_count + 1 + after_count == poss.length)
			return [poss[before_count]];
		else
			return poss;
	},
 
	matchGloss: function (line, gloss)
	{
		if (gloss.match(/^ *$/))
			return !!(line.match(/\{\{trans-top\| *\}\}/) || line.match(/^ *$/));
 
		var words = gloss.split(/\W+/);
		var pos = 0;
		for (var i=0; i < words.length; i++)
		{
			pos = line.indexOf(words[i], pos);
			if (pos == -1)
				return false;
		}
		return pos > -1;
	},
 
	//User:Karelklic
	getTransGlossText: function (node) {
		var ret = '';
		var children = node.childNodes;
		for (var i=0; i<children.length; i++)
		{
			if (children[i].nodeType == 3)
				ret += children[i].nodeValue;
			else if (children[i].nodeName.match(/^(i|b)$/i) || children[i].className.indexOf('wt-edit-recurse') > -1)
				ret += util.getTransGlossText(children[i]);
			else if (ret.match(/\w$/)) //Prevent new words from being created across node boundaries
				ret += " ";
		}
		// all characters except a-zA-Z0-9 are changed to spaces
		return ret.replace(/\W/g, ' '); 
	},
 
	getTransGloss: function (ul)
	{
		var node = ul;
		while (node && node.className.indexOf('NavFrame') == -1)
			node = node.parentNode;
 
		if (!node) return ''; 
 
		var children = node.childNodes;
		for (var i=0; i< children.length; i++)
		{
			if(children[i].className && children[i].className.indexOf('NavHead') > -1)
				return util.getTransGlossText(children[i]);
 
		}
		return '';
	},
 
	isTrreq: function (li)
	{
		var spans = li.getElementsByTagName('span');
		return (spans && spans.length > 0 && spans[0].className.indexOf("trreq") > -1)
	}
};
 
/**
 * A small amount of common code that can be usefully applied to adder forms.
 *
 * An adder is assumed to be an object that has:
 *
 * .fields  A object mapping field names to either validation functions used
 *          for text fields, or the word 'checkbox'
 * 
 * .createForm  A function () that returns a newNode('form') to be added to the
 *              document (by appending to insertNode)
 * 
 * .onsubmit  A function (values, register (wikitext, callback)) that accepts 
 *            the validated set of values and processes them, the register
 *            function accepts wikitext and a continuation function to be 
 *            called with the result of rendering it.
 *
 * Before onsubmit or any validation functions are called, but after running
 * createForm, a new property .elements will be added to the adder which is a
 * dictionary mapping field names to HTML input elements.
 *
 * @param {editor}  The current editor.
 * @param {adder}  The relevant adder.
 * @param {insertNode}  Where to insert this in the document.
 * @param {insertSibling} Where to insert this within insertNode.
 */
function AdderWrapper (editor, adder, insertNode, insertSibling)
{
	var form = adder.createForm()
	var status = newNode('span');
 
	form.appendChild(status);
	if (insertSibling)
		insertNode.insertBefore(form, insertSibling);
	else
		insertNode.appendChild(form);
 
	adder.elements = {};
 
	//This is all because IE doesn't reliably allow form.elements['name']
	for (var i=0; i< form.elements.length; i++)
	{
		adder.elements[form.elements[i].name] = form.elements[i];
	}
 
	form.onsubmit = function ()
	{
		try
		{
			var submit = true;
			var values = {}
 
			status.innerHTML = "";
			for (var name in adder.fields)
			{
				if (adder.fields[name] == 'checkbox')
				{
					values[name] = adder.elements[name].checked ? name : false;
				}
				else
				{
					adder.elements[name].style.border = ''; // clear error styles
					values[name] = adder.fields[name](adder.elements[name].value || '', function (msg) 
					{
						status.appendChild(newNode('span',{style:'color: red'}, newNode('img', {'src':'http://upload.wikimedia.org/wikipedia/commons/4/4e/MW-Icon-AlertMark.png'}), msg, newNode('br'))); 
						adder.elements[name].style.border="solid #CC0000 2px";
						return false
					});
 
					if (values[name] === false)
						submit = false;
				}
			}
			if (!submit)
				return false;
 
			var loading = newNode('span', 'Loading...');
			status.appendChild(loading);
 
			adder.onsubmit(values, function (text, callback)
			{
				editor.page.parseFragment(text, function (res)
				{
					if (!res) 
						return loading.appendChild(newNode('p', {style: 'color: red'}, "Could not connect to the server."));
 
					callback(res);
					status.removeChild(loading);
				});
			});   
		}
		catch(e)
		{
			status.innerHTML = "ERROR:" + e.description; 
			return false;
		}
 
		return false;
	}
 
}
// An adder for translations on en.wikt
function TranslationAdders (editor)
{
	function TranslationLabeller (insertDiv)
	{
		var original_span;
		var adder_form;
		var initial_value;
		var edit_button;
 
		var editing = false;
 
		var adderInterface = {
			'fields': {
				'gloss': function (txt, error) { return util.validateNoWikisyntax('gloss', true)(txt, error) }
			},
			'createForm': function ()
			{
				var thisId = "a" + String(Math.random()).replace(".","");
				return adder_form = newNode('form', {style:'display: inline', width: 'auto', click: kill_event}, 
					newNode('label', {'for': thisId}, "Gloss: "),
					newNode('input', {type: 'text', name:'gloss', value: initial_value, style: 'width: 50%', title: 'Insert a summary of the relevant definition', id: thisId}),
					newNode('input', {type: 'submit', name: 'preview', value: 'Preview'}),
					newNode('a', {href: '/wiki/Help:Glosses'}, 'Help?!')
					);
			},
			'onsubmit': function (values, render)
			{
				render(values.gloss, function (new_html) {
					if (editing)
						toggle_editing(false);
 
					var old_html = original_span.innerHTML;
					editor.addEdit({
						'undo': function () { original_span.innerHTML = old_html; if(!editing) toggle_editing();},
						'redo': function () { original_span.innerHTML = new_html; if(editing) toggle_editing();},
						'edit': function (text) { return perform_edit(text, values.gloss) },
						'summary': 'tgloss:"' + (values.gloss.length > 50 ? values.gloss.substr(0, 50) + '...' : values.gloss + '"')
					}, original_span);
				});
			}
		};
 
		// The actual modification to the wikitext
		function perform_edit(wikitext, gloss)
		{
			var pos = util.getTransTable(wikitext, insertDiv)[0] - 4;
			var g_start = wikitext.lastIndexOf('\n{'+'{trans-top', pos) + 1;
			var g_end = wikitext.indexOf('}}\n', pos) + 2;
 
			if (g_start == 0 || wikitext.substr(g_start, g_end - g_start).indexOf("\n") > - 1)
			{
				editor.error("Could not find translation table.");
				return wikitext;
			}
			else
			{
				return wikitext.substr(0, g_start) + '{'+'{trans-top|' + gloss + '}}' + wikitext.substr(g_end);
			}
		}
 
		// Don't open and close box when interacting with form.
		function kill_event(e)
		{
			if (e && e.stopPropagation)
				e.stopPropagation();
			else
				window.event.cancelBubble = true;
		}
 
		// What to do when the +/- button is clicked.
		function toggle_editing ()
		{
			if (editing)
			{
				adder_form.style.display = "none";
				original_span.style.display = "inline";
				editing = false;
				return;
			}
			editing = true;
			edit_button.innerHTML = "Loading...";
			editor.withCurrentText(function (currentText)
			{
				var pos = util.getTransTable(currentText, insertDiv);
				edit_button.innerHTML = '±';
 
				if (!pos)
					return editor.error("Could not find translation table");
 
				var gloss_line = currentText.substr(currentText.lastIndexOf('\n', pos[0] - 2) + 1);
				gloss_line = gloss_line.substr(0, gloss_line.indexOf('\n'));
				initial_value = gloss_line.replace(/^\{\{trans-top(\|(.*)|)\}\}\s*$/,"$2");
 
				if (initial_value.indexOf("\n") > 0)
					return editor.error("Internal error: guess spanning multiple lines");
 
				if (!original_span)
				{
					original_span = newNode('span', {'class':'wt-edit-recurse'});
					for (var i=0; i<insertDiv.childNodes.length; i++)
					{
						var child = insertDiv.childNodes[i];
						if (child != edit_button && (!child.className || child.className != 'NavToggle'))
						{
							original_span.appendChild(insertDiv.removeChild(child));
							i--;
						}
					}
					insertDiv.appendChild(original_span);
 
					new AdderWrapper(editor, adderInterface, insertDiv, original_span);
				}
				original_span.style.display = "none";
				adder_form.style.display = "inline";
                                adder_form.getElementsByTagName('input')[0].focus()
			});
		}
		edit_button = newNode('a', '±', {href: '#', click: function (e) 
		{ 
			if (e && e.preventDefault)
				e.preventDefault();
			kill_event(e); 
			toggle_editing(); 
			return false;
		}, title:"Edit table heading", style:"padding:2px; margin-left: -5px;"});
		insertDiv.insertBefore(edit_button, insertDiv.firstChild.nextSibling);
	}
 
	function TranslationAdder (insertUl)
	{
		// Hippietrail
		var langmetadata = new LangMetadata ();
 
		this.fields =  {
			lang: function (txt, error)
			{
				if (txt == 'en') return error("Please choose a foreign language. (fr, es, aaa)")
				if (/^[a-z]{2,3}(-[a-z\-]{1,7})?$/.test(txt)) return txt;
				return error("Please use a language code. (fr, es, aaa)")
			},
			word: function (txt, error)
			{
				if (txt == '{'+'{trreq}}')
					return txt;
 
				if (txt.indexOf(',') == -1 || forceComma)
				{
					forceComma = false;
					if (langmetadata.expectedCase(thiz.elements.lang.value, wgTitle, txt) || forceCase)
					{
						forceCase = false;
						return util.validateNoWikisyntax('translation', true)(txt, error);
					}
 
					if (prefs.get('case-knowledge', 'none') == 'none')
					{
						return error(newNode('span',
							"Translations normally don't have capital letters. If you're certain it does, you can ",
							newNode('span', {style: "color: blue; text-decoration: underline; cursor: pointer;", click: function ()
								{
									forceCase = true;
									inputForm.onsubmit();
									prefs.set('case-knowledge', 'guru');
								}}, "continue by clicking here.")));
					}
					else
					{
						var msg = newNode('span',
							newNode('span', {style: "color: blue; text-decoration: underline; cursor: pointer;", click: function ()
								{
									prefs.set('case-knowledge', 'none')
									try{ msg.parentNode.removeChild(msg); } catch(e) {}
									editor.undo()
								}}, "Please click undo"), " unless you are certain that this translation has a capital letter.");
 
						error(msg)
						return txt;
					}
				}
 
				if (prefs.get('comma-knowledge', 'none') == 'none')
				{
					return error(newNode('span',
						"You can only add one translation at a time. If this is one translation that contains a comma, you can ",
						newNode('span', {style: "color: blue; text-decoration: underline; cursor: pointer;", click: function ()
							{
								forceComma = true;
								inputForm.onsubmit();
								prefs.set('comma-knowledge', 'guru')
							}}, "add it by clicking here.")))
				}
				else
				{
					var msg = newNode('span',
						newNode('span', {style: "color: blue; text-decoration: underline; cursor: pointer;", click: function ()
							{
								prefs.set('comma-knowledge', 'none')
								try{ msg.parentNode.removeChild(msg); } catch(e) {}
								editor.undo()
							}}, "Please click undo"), " if you were trying to create a list of translations in one go, this is currently not supported.");
 
					error(msg)
					return txt;
				}
			},
			qual: util.validateNoWikisyntax('qualifier'),
			tr: util.validateNoWikisyntax('transcription'),
			alt: util.validateNoWikisyntax('page name'),
			sc: function (txt, error)
			{
				if (txt && !/^((?:[a-z][a-z][a-z]?-)?[A-Z][a-z][a-z][a-z]|polytonic|unicode)$/.test(txt))
					return error(newNode('span', "Please use a ", newNode('a',{href: '/wiki/Category:Script templates'},"script template"), "(e.g. fa-Arab, Deva, polytonic)"))
 
				if (!txt)
					txt = prefs.get('script-' + thiz.elements.lang.value, langmetadata.guessScript(thiz.elements.lang.value) || '');
				if (txt == 'Latn')
					txt = '';
				return txt;
			},
			nested: util.validateNoWikisyntax('nested'),
			m: 'checkbox', f: 'checkbox', n: 'checkbox', c: 'checkbox', p: 'checkbox'
		};
 
		this.createForm = function ()
		{
			var controls = {
				lang: newNode('input', {size:4, type:'text', name:'lang', value:prefs.get('curlang',''), title:'The two or three letter ISO 639 language code'}),
				transliteration: newNode('span', newNode('a', {href: '/wiki/Wiktionary:Transliteration'}, "Transliteration"), ": ", 
									 newNode('input', {name: "tr", title: "The word transliterated into the Latin alphabet."}), " (e.g. ázbuka for азбука)"),
				qualifier: newNode('p', "Qualifier: ", newNode('input', {name: 'qual', title: "A qualifier for the word"}), " (e.g. literally, formally, slang)"),
				display: newNode('p',"Page name: ", newNode('input', {name: 'alt', title: "The word with all of the dictionary-only diacritics."}), " (e.g. amo for amō)"),
				script: newNode('p', newNode('a', {href: '/wiki/Category:Script_templates'},"Script template"),": ", 
					newNode('input', {name: 'sc', size: 6, title: "The script template to render this word in."}), "(e.g. Cyrl for Cyrillic, Latn for Latin)", newNode('br')),
				nested: newNode('p', "Nesting: ", newNode('input', {name: 'nested', title: "The nesting of this language"}), " (e.g. Norwegian/Nynorsk)"),
				gender_m: newNode('span',newNode('input', {type: 'checkbox', name: 'm'}), 'masc. '),
				gender_f: newNode('span', newNode('input', {type: 'checkbox', name: 'f'}), 'fem. '),
				gender_n: newNode('span', newNode('input', {type: 'checkbox', name: 'n'}), 'neuter '),
				gender_c: newNode('span', newNode('input', {type: 'checkbox', name: 'c'}), 'common\u00A0gender '),
				plural: newNode('span', newNode('input', {type: 'checkbox', name: 'p'}), 'plural ', newNode('br'))
			};
 
			controls.gender = newNode('p', controls.gender_m, controls.gender_f, controls.gender_n, controls.gender_c, controls.plural);
 
			langInput = controls.lang;
 
			var showButton = newNode('span',{'click': function ()
			{
				if (!advancedMode)
				{
					advancedMode = true;
					showButton.innerHTML = " Less";
				}
				else
				{
					advancedMode = false;
					showButton.innerHTML = " More";
				}
				updateScriptGuess.call(langInput, true);
			}, 'style':"color: #0000FF;cursor: pointer;"}, advancedMode ? " Less" : " More");
 
			function autoTransliterate () {
				if (thiz.elements.word.value == '{'+'{trreq}}')
					thiz.elements.alt.value = ''
				else
					thiz.elements.alt.value = langmetadata.generateAltForm(thiz.elements.lang.value, thiz.elements.word.value) || '';
			}
			function updateScriptGuess (preserve) {
				preserve = (preserve === true);
 
				//show all arguments
				function show ()
				{
					for (var i=0; i<arguments.length; i++)
					{
						if (arguments[i].nodeName.toLowerCase() == 'p')
							arguments[i].style.display = "block";
						else
							arguments[i].style.display = "inline";
					}
 
				}
				//hide all arguments
				function hide ()
				{
					for (var i=0; i < arguments.length; i++)
						arguments[i].style.display = "none";
				}
				//if the first argument is false hide the remaining arguments, otherwise show them.
				function toggle (condition)
				{
					if (condition) //eww...
						show.apply(this, [].splice.call(arguments, 1, arguments.length - 1));
					else
						hide.apply(this, [].splice.call(arguments, 1, arguments.length - 1));
				}
 
				if (!preserve)
					langInput.value = langmetadata.cleanLangCode(langInput.value);
 
				var guess = prefs.get('script-' + langInput.value, langmetadata.guessScript(langInput.value || ''));
				if (!preserve)
				{
					if (guess)
						thiz.elements.sc.value = guess;
					else
						thiz.elements.sc.value = '';
 
					thiz.elements.nested.value = langmetadata.getNested(langInput.value || '');
 
					autoTransliterate();
				}
 
				var lang = langInput.value;
 
				if (!advancedMode)
				{
					var g = langmetadata.getGenders(lang);
 
					if (!lang)
					{
						hide(controls.gender);
					}
					else if (g == undefined)
					{
						show(controls.gender,controls.gender_m, controls.gender_f, controls.gender_n, controls.gender_c);
					}
					else
					{
						toggle(g.indexOf('m') > -1, controls.gender);
						toggle(g.indexOf('m') > -1, controls.gender_m);
						toggle(g.indexOf('f') > -1, controls.gender_f);
						toggle(g.indexOf('n') > -1, controls.gender_n);
						toggle(g.indexOf('c') > -1, controls.gender_c);
					}
 
					var p = langmetadata.hasPlural(lang);
 
					toggle(p !== false, controls.plural);
					toggle(g || p, controls.gender); 
 
					toggle(guess && guess != 'Latn', controls.transliteration);
 
					var alt = langmetadata.needsAlt(lang);
 
					toggle(alt === true, controls.display);
 
					hide(controls.qualifier, controls.nested); //only in more
					hide(controls.script); //should be in less when array returned from .getScripts
 
				}
				else
				{
					show(controls.gender, controls.gender_m, controls.gender_f, controls.gender_n, controls.gender_c,
						controls.plural, controls.transliteration, controls.qualifier, controls.display,
						controls.script, controls.nested);
				}
			} 
 
			//autocomplete language names
			var langNameToCode={};
			function langAutoFill(e){
				e = (e || event).keyCode;if((e >= 33 && e <= 40) || e == 8 || e == 46 || e == 27 || e == 16){
					return;
				}
				var t = this, v = t.value;
				if(v.substr(0,1) != v.substr(0,1).toUpperCase()){
					return;
				}
				JsMwApi()({action:'query',generator:'allpages',gapnamespace:10,gapprefix:'langrev/'+v,gaplimit:3,prop:'revisions',rvprop:'content'},function(r){
					if(r.query && r.query.pages && t.value == v){
						var l={}, ll={}
						for(var i in r.query.pages){
							var rqp = r.query.pages[i];ll = rqp.title < ll.title?ll:rqp;l = rqp.title > l.title?l:rqp;
						}
						if(!r['query-continue'] && ll.title.indexOf(l.title) == 0){
							langNameToCode[l.title.substr(17)]=l.revisions[0]['*'];
							if(l.title != "Template:langrev/"+v){
								if (t.setSelectionRange){
									t.setSelectionRange([t.value.length, t.value = l.title.substr(17)][0], t.value.length);
								} else if (t.createTextRange) {
									var z = t.createTextRange();
									z.moveEnd('character', 0 - z.move('character', [t.value.length, t.value = l.title.substr(17)][0]) + t.value.length);
									z.select()
								}
							}
						}
					}
				})
			}
			langInput.onkeyup = langAutoFill;
 
			langInput.onblur = function(){
				if(langNameToCode[this.value]){
					this.value=langNameToCode[this.value]
				}
				updateScriptGuess.call(langInput)
			}
 
			window.setTimeout(function () {updateScriptGuess.call(langInput)}, 0);
 
			inputForm = newNode('form',
						newNode('p', newNode('a',{href:"/wiki/User_talk:Conrad.Irwin/editor.js#Usage"},"Add translation"),' ',
							langInput, newNode('b',': '), newNode('input', {'name': 'word', size:20, change:autoTransliterate}),
							newNode('input',{'type': 'submit', 'value':'Preview translation'}), showButton
						), 
						controls.gender,
						controls.transliteration,
						controls.display,
						controls.qualifier,
						controls.script,
						controls.nested
					)
			return inputForm;
		}
 
		this.onsubmit = function (values, render)
		{
			// Use (no) for Bokmal per WT:ANO
			var wikt_lang = values.lang;
			if (wikt_lang == 'nb')
				wikt_lang = 'no';
 
			var wikitext;
			if (values.word.indexOf('{'+'{trreq') == 0)
				wikitext = '{'+'{trreq|' + '{'+'{subst:' + values.lang + '|l=}}}}'
			else
				wikitext = '{'+'{subst:' + values.lang + '}}: ' + 
				(values.qual? '{'+'{qualifier|' + values.qual + '}} ' : '') +  
				'{'+'{t' + (langmetadata.hasWiktionary(wikt_lang) ? '' : 'ø') +
				'|' + (values.lang) + '|' + (values.alt ? values.alt : values.word) +
				(values.m ? '|m' : '') +
				(values.f ? '|f' : '') +
				(values.n ? '|n' : '') +
				(values.c ? '|c' : '') +
				(values.p ? '|p' : '') +
				(values.tr ? '|tr=' + values.tr : '') + 
				((values.alt && values.alt != values.word) ? '|alt=' + values.word : '') +
				(values.sc ? '|sc=' + values.sc  : '') + '}}';
			render(wikitext, function (html) { registerEdits(values, wikitext, html)});
			if (!this.balancer)
				this.balancer = new TranslationBalancer(editor, insertUl.parentNode.parentNode.parentNode);
		}
 
		var thiz = this;
		var prefs = new CookiePreferences('EditorJs');
		var langInput;
		var inputForm;
		var advancedMode = prefs.get('more-display', 'none') != 'none';
		var forceComma = false;
		var forceCase = false;
 
		//Reset elements to default values.
		function resetElements ()
		{
			if (prefs.get('more-display', 'none') != advancedMode ? 'block' : 'none')
				prefs.set('more-display', advancedMode ? 'block' : 'none'); //named for compatibility
			thiz.elements.word.value = thiz.elements.tr.value = thiz.elements.alt.value = thiz.elements.qual.value = '';
			thiz.elements.m.checked = thiz.elements.f.checked = thiz.elements.n.checked = thiz.elements.c.checked = thiz.elements.p.checked = false;
			prefs.set('curlang', thiz.elements.lang.value);
			if ((thiz.elements.sc.value || 'Latn') != (prefs.get('script-'+thiz.elements.lang.value, langmetadata.guessScript(thiz.elements.lang.value) || 'Latn')))
			{
				prefs.set('script-'+thiz.elements.lang.value, thiz.elements.sc.value); 
				thiz.elements.lang.update();
			}
		}
 
		// This is onsubmit after the wikitext has been rendered to give content
		function registerEdits (values, wikitext, content)
		{
			var li = newNode('li',{'class': 'trans-'+values.lang});
			li.innerHTML = content;
			var lang = getLangName(li);
			var summary = 't+' + values.lang + ':[[' + (values.alt || values.word) + ']]';
 
			var insertBefore = null;
			var nextLanguage = null;
 
			var nestedHeading, nestedLang;
			var nestedLang;
			if (values.nested.indexOf('/') > -1) 
			{
				nestedLang = values.nested.replace(/.*\//, '');
				nestedHeading = values.nested.replace(/\/.*/,'');
				if (nestedHeading == '')
					nestedHeading = lang;
				content = content.replace(/.*: /, nestedLang + ": ");
				wikitext = wikitext.replace("subst:", "").replace(/.*: /, nestedLang + ": ");
			}
			else
			{ 
				nestedHeading = values.nested;
				nestedLang = lang;
			}
			var nestedWikitext = "\n* " + nestedHeading + ":\n*: " + wikitext;
 
			function addEdit (edit, span)
			{
				editor.addEdit({
					'undo': function () 
					{
						edit.undo();
						if (thiz.elements.word.value == "" &&
							thiz.elements.tr.value == "" &&
							thiz.elements.alt.value == "" &&
							thiz.elements.qual.value == "")
						{
							var fields = ["lang","word","alt","qual","tr","sc"];
							var cb = "mnfcp".split("");
							for (var i=0; i < fields.length; i++)
							{
								thiz.elements[fields[i]].value = values[fields[i]];
							}
							for (var i=0; i < cb.length; i++)
							{
								thiz.elements[fields[i]].checked = values[fields[i]];
							}
						}
					},
					'redo': function ()
					{ 
						edit.redo();
						var fields = ["lang","word","alt","qual","tr","sc"];
						for (var i=0; i < fields.length; i++)
						{
							if (thiz.elements[fields[i]].value != values[fields[i]])
								return;
						}
						resetElements();
					},
					'edit': edit.edit,
					'summary': summary
				}, span);
			}
 
 
			if (lang)
			{
				//Get all li's in this table row. 
				var lis = [];
				var ls = insertUl.parentNode.parentNode.getElementsByTagName('li');
				for (var j=0; j < ls.length; j++)
					lis.push(ls[j]);
 
				ls = insertUl.parentNode.parentNode.getElementsByTagName('dd');
				for (var j=0; j < ls.length; j++)
					lis.push(ls[j]);
 
				for (var j=0; j < lis.length; j++)
				{
					if (lis[j].getElementsByTagName('form').length > 0)
						continue;
					var ln = getLangName(lis[j]);
					if (ln == lang)
					{
						if (values.word == '{'+'{trreq}}') {
							addEdit({
								'redo': function () {},
								'undo': function () {},
								'edit': function () {
									return editor.error("Can not add a translation request for a language with translations");
								}
							});
							return resetElements();
						}
 
						var span = newNode('span');
						var parent = lis[j];
						if (util.isTrreq(parent))
						{
							span.innerHTML = content;
							var trspan = parent.getElementsByTagName('span')[0];
							addEdit({
								'redo': function () { parent.removeChild(trspan); parent.innerHTML = ""; parent.appendChild(span); },
								'undo': function () { parent.removeChild(span); parent.appendChild(trspan); },
								'edit': getEditFunction(values, wikitext, ln, values.lang, true, function (text, ipos)
								{
									//Converting a Translation request into a translation
									var lineend = text.indexOf('\n', ipos);
									return text.substr(0, ipos) + wikitext + text.substr(lineend);
								})
							}, span);
							return resetElements();
						}
						else
						{
							if (parent.getElementsByTagName('ul').length + parent.getElementsByTagName('dl').length == 0)
							{
								span.innerHTML = ", " + content.substr(content.indexOf(':') + 1);
								addEdit({
									'redo': function () { parent.appendChild(span) },
									'undo': function () { parent.removeChild(span) },
									'edit': getEditFunction(values, wikitext, ln, values.lang, false, function (text, ipos)
											{
												 //We are adding the wikitext to a list of translations that already exists.
												 var lineend = text.indexOf('\n', ipos);
												 var wt = wikitext.replace('subst:','');
												 wt = wt.substr(wt.indexOf(':') + 1);
												 return text.substr(0, lineend) + "," + wt + text.substr(lineend);
											})
								}, span);
								return resetElements();
							}
							else
							{
								var node = parent.firstChild;
								var hastrans = false;
								while (node)
								{
									if (node.nodeType == 1)
									{
										var nn = node.nodeName.toUpperCase();
										if (nn == 'UL' || nn == 'DL')
										{
											// If we want to use the dialectical nesting for orthographical nesting
											// then we need to skip this (otherwise perfect) match.
											if (!hastrans && nestedHeading == ln)
											{
												node = node.nextSibling;
												continue;
											}
											span.innerHTML = (hastrans ? ", ": " ") + content.substr(content.indexOf(':') + 1);
											addEdit({
												'redo': function () { parent.insertBefore(span, node) },
												'undo': function () { parent.removeChild(span) },
												'edit': getEditFunction(values, wikitext, ln, values.lang, false, function (text, ipos)
														{
															//Adding the translation to a language that has nested translations under it
															var lineend = text.indexOf('\n', ipos);
															var wt = wikitext.replace('subst:','');
															wt = wt.substr(wt.indexOf(':') + 1);
															return text.substr(0, lineend) + (hastrans ? "," : "") + wt + text.substr(lineend);
														})
											}, span);
											return resetElements();
										}
										else
										{
											hastrans = true;
										}
 
									}
									node = node.nextSibling;
								}
							}
						}
					}
					else if (ln && ln > lang && (!nextLanguage || ln < nextLanguage) && lis[j].parentNode.parentNode.nodeName.toLowerCase() != 'li')
					{
						nextLanguage = ln;
						var parent = lis[j];
						insertBefore = [
							{
								'redo': function () {parent.parentNode.insertBefore(li, parent);},
								'undo': function () {parent.parentNode.removeChild(li)},
								'edit': getEditFunction(values, wikitext, ln, getLangCode(parent), util.isTrreq(parent), function (text, ipos)
										{
											//Adding a new language's translation before another language's translation
											var lineend = text.lastIndexOf('\n', ipos);
											return text.substr(0, lineend) + "\n* " + wikitext + text.substr(lineend);
										})
							},li];
					}
				}
			}
			if (values.nested)
			{
				nextLanguage = null;
				insertBefore = null;
				li.innerHTML = nestedHeading + ":" + "<dl><dd class=\"trans-" + values.lang + "\">" + content + "</dd></dl>";
 
				var lis = insertUl.parentNode.parentNode.getElementsByTagName('li');
				for (var j = 0; j < lis.length; j++)
				{
					//Ignore the editor form
					if (lis[j].getElementsByTagName('form').length > 0)
						continue;
 
					//Don't look at nested translations
					if (lis[j].parentNode.parentNode.nodeName.toLowerCase() != 'td')
						continue;
 
					var ln = getLangName(lis[j]);
					if (ln == nestedHeading)
					{
						var sublis = lis[j].getElementsByTagName('li');
 
						if (! sublis.length)
							sublis = lis[j].getElementsByTagName('dd');
 
						if (sublis.length == 0)
						{
							var parent = lis[j];
							var dd = newNode('dd', {'class': 'trans-'+values.lang});
							var dl = newNode('dl', dd);
							dd.innerHTML = content;
 
							addEdit({
								'redo': function () {parent.appendChild(dl);},
								'undo': function () {parent.removeChild(dl);},
								'edit': getEditFunction(values, wikitext, nestedHeading, getLangCode(parent), util.isTrreq(parent), function (text, ipos)
										{
											//Adding a new dl to an existing translation line
											var lineend = text.indexOf('\n', ipos);
											return text.substr(0, lineend) + "\n*: " + wikitext + text.substr(lineend);
										})
							}, dd);
							return resetElements();
						}
						else
						{
							var dd = newNode(sublis[0].nodeName, {'class': 'trans-'+values.lang});
							var linestart = dd.nodeName.toLowerCase() == 'dd' ? '\n*: ' : '\n** ';
							dd.innerHTML = content;
							for (var k = 0; k < sublis.length; k++)
							{
								var subln = getLangName(sublis[k]);
								var parent = sublis[k];
								if (subln == nestedLang) {
									var span = newNode('span');
									span.innerHTML = ", " + content.substr(content.indexOf(':') + 1);
									addEdit({
										'redo': function () { parent.appendChild(span) },
										'undo': function () { parent.removeChild(span) },
										'edit': getEditFunction(values, wikitext, nestedLang, values.lang, false, function (text, ipos)
												{
													 // Adding the wikitext to a list of translations that already exists.
													 var lineend = text.indexOf('\n', ipos);
													 var wt = wikitext.replace('subst:','');
													 wt = wt.substr(wt.indexOf(':') + 1);
													 return text.substr(0, lineend) + "," + wt + text.substr(lineend);
												})
									}, span);
 
									return resetElements();
								} else if (langmetadata.nestsBefore(nestedLang, subln)) {
 
									addEdit({
										'redo': function () { parent.parentNode.insertBefore(dd, parent); },
										'undo': function () { parent.parentNode.removeChild(dd); },
										'edit': getEditFunction(values, wikitext, subln, getLangCode(parent), util.isTrreq(parent), 
												function (text, ipos) 
												{
													// Adding a nested translation in-order
													var lineend = text.lastIndexOf('\n', ipos);
													return text.substr(0, lineend) + linestart + wikitext + text.substr(lineend);
												})
									}, dd);
									return resetElements();
								}
							}
 
							addEdit({
								'redo': function () { parent.parentNode.appendChild(dd); },
								'undo': function () { parent.parentNode.removeChild(dd); },
								'edit': getEditFunction(values, wikitext, subln, getLangCode(parent), util.isTrreq(parent),
										function (text, ipos)
										{
											// Adding a nested translation at the end of its group
											var lineend = text.indexOf('\n', ipos);
											return text.substr(0, lineend) + linestart + wikitext + text.substr(lineend);
										})
							}, dd);
							return resetElements();
						}
 
					}
					else if (ln && ln > nestedHeading && (!nextLanguage || ln < nextLanguage))
					{
						nextLanguage = ln;
						var parent = lis[j];
						insertBefore = [
							{
								'redo': function () {parent.parentNode.insertBefore(li, parent);},
								'undo': function () {parent.parentNode.removeChild(li)},
								'edit': getEditFunction(values, wikitext, ln, getLangCode(parent), util.isTrreq(parent), function (text, ipos)
										{
											//Adding a new nested translation section.
											var lineend = text.lastIndexOf('\n', ipos);
											return text.substr(0, lineend) +  nestedWikitext + text.substr(lineend);
										})
							},li];
					}
				}
				wikitext = nestedHeading + ":\n*: " + wikitext;
			}
 
			li.className = "trans-" + values.lang;
			if (insertBefore)
			{
				addEdit(insertBefore[0], insertBefore[1]);
			}
			else
			{
				//Append the translations to the end (no better way found)
				addEdit({
					'redo': function () {insertUl.appendChild(li);},
					'undo': function () {insertUl.removeChild(li)},
					'edit': getEditFunction(values, wikitext)
				}, li);
			}
			return resetElements();
		}
 
		//Get the wikitext modification for the current form submission.
		function getEditFunction (values, wikitext, findLanguage, findLangCode, trreq, callback)
		{
			return function(text)
			{
				var p = util.getTransTable(text, insertUl);
 
				if (!p)
					return editor.error("Could not find translation table for '" + values.lang + ":" + values.word + "'. Glosses should be unique");
 
				var stapos = p[0];
				var endpos = p[1];
 
				if (findLanguage)
				{
					var ipos = 0;
					if (trreq)
					{
						ipos = text.indexOf('{'+'{trreq|'+findLanguage+'}}', stapos);
						if (ipos < 0 || ipos > endpos)
							ipos = text.indexOf('{'+'{trreq|'+findLangCode+'}}', stapos);
						if (ipos < 0 || ipos > endpos)
							ipos = text.indexOf('{'+'{trreq|{'+'{subst:'+findLangCode+'|l=}}}}', stapos);
					}
 
					// If we have a nested trreq, then we still need to look for the non-trreq form of the heading language
					if (!trreq || ipos < 0 || ipos > endpos )
					{
						ipos = text.substr(stapos).search(RegExp("\\*[:*]? ?\\[\\[" + util.escapeRe(findLanguage) + "\\]\\]:")) + stapos;
						if (ipos < stapos || ipos > endpos)
							ipos = text.substr(stapos).search(RegExp('\\*[:*]? ?' + util.escapeRe(findLanguage) + ':')) + stapos;
						if (ipos < stapos || ipos > endpos)
							ipos = text.indexOf('{'+'{subst:'+findLangCode+'}}:', stapos);
					}
 
					if (ipos >= stapos && ipos < endpos)
					{
						return callback(text, ipos, trreq);
					}
					else
					{
						return editor.error("Could not find translation entry for '" + values.lang + ":" +values.word + "'. Please reformat");
					}
				}
 
				return text.substr(0, endpos) + "* " + wikitext + "\n" + text.substr(endpos);
			};
		}
 
		// For an <li> in well-formed translation sections, return the language name.
		function getLangName(li)
		{
			var guess = li.textContent || li.innerText;
 
			if (guess)
				guess = guess.substr(0, guess.indexOf(':'));
 
			if (guess == 'Template') {
				return false;
			}
 
			return guess.replace(/^[\s\n]*/,'');
		}
 
		// Try to get the language code from an <li> containing { {t t+ or t-	// }}
		function getLangCode(li)
		{
			if (li.className.indexOf('trans-') == 0)
				return li.className.substr(6);
			var spans = li.getElementsByTagName('span');
			for (var i=0; i < spans.length; i++)
			{
				if (spans[i].lang) {
					return spans[i].lang;
				}
			}
			return false;
		}
 
	}
	var tables = document.getElementsByTagName('table');
	for (var i=0; i<tables.length; i++)
	{
		if (tables[i].className.indexOf('translations') > -1 && util.getTransGloss(tables[i]) != 'Translations to be checked')
		{
			var _lists = tables[i].getElementsByTagName('ul');
			var lists = [];
			for (var j=0; j<_lists.length; j++)
				if (_lists[j].parentNode.nodeName.toLowerCase() == 'td')
					lists.push(_lists[j]);
 
			if (lists.length == 0)
			{
				tables[i].getElementsByTagName('td')[0].appendChild(newNode('ul'));
				lists = tables[i].getElementsByTagName('ul');
			}
			if (lists.length == 1)
			{
				var table = tables[i].getElementsByTagName('td')[2]
				if (table)
				{
					table.appendChild(newNode('ul'));
					lists = tables[i].getElementsByTagName('ul');
				}
			}
			if (lists)
			{
				var li = newNode('li');
				var ul = lists[lists.length - 1];
				var table = tables[i];
				if (table.getElementsByTagName('tbody').length > 0)
					table = table.getElementsByTagName('tbody')[0];
				table.appendChild(newNode('tr', newNode('td'), newNode('td'), newNode('td', {'style':'text-align: left'},newNode('ul', li))));
				new AdderWrapper(editor, new TranslationAdder(ul), li);
				if ((new CookiePreferences('EditorJs')).get('labeller') == 'true')
				{
					var div = tables[i].parentNode.parentNode.getElementsByTagName('div')[0];
					if (div.className.indexOf('NavHead') > -1)
					{
						new TranslationLabeller(div)
					}
				}
			}
		}
	}
}
 
function TranslationBalancer (editor, insertTable)
{
	var status;
 
	//create the form
	function init ()
	{
		var cns = insertTable.getElementsByTagName('tr')[0].childNodes;
		var tds = []; 
		//Find all three table cells in the translation table.
		for (var i=0; i<cns.length; i++)
		{
			if (cns[i].nodeName.toUpperCase() == 'TD')
				tds.push(cns[i])
		}
 
		//Ensure that there is a <ul> on the left side of the balancer.
		var left = tds[0].getElementsByTagName('ul');
		if (left.length > 0)
			left = left[0];
		else
		{
			left = newNode('ul');
			tds[0].appendChild(left);
		}
 
		//Ensure that there is a <ul> on the right side of the balancer.
		var right = tds[2].getElementsByTagName('ul');
		if (right.length > 0)
			right = right[0];
		else
		{
			right = newNode('ul');
			tds[2].appendChild(right);
		}
 
		var moveLeft = newNode('input',{'type':'submit','name':'ml', 'value':'←', 'click': function(){return prepareEdits('←', left, right)}});
		var moveRight = newNode('input',{'type':'submit','name':'mr', 'value':'→', 'click': function(){return prepareEdits('→', left, right)}});
		status = newNode('span');
 
		var form = newNode('form', moveLeft, newNode('br'), moveRight, newNode('br'), status);
		tds[1].appendChild(form);
		form.onsubmit = function () { return false; } //Must be done after the appendChild for IE :(
	}
 
	function moveOneRight(left, right)
	{
		var li = left.lastChild;
		while (li && li.nodeName.toLowerCase() != 'li')
			li = li.previousSibling;
 
		if (li) 
			right.insertBefore(left.removeChild(li), right.firstChild);
	}
 
	function moveOneLeft(left, right)
	{
		var li = right.firstChild;
		while (li && li.nodeName.toLowerCase() != 'li')
			li = li.nextSibling;
 
		if (li)
			left.appendChild(right.removeChild(li));
	}
 
	//store the edit object with the editor
	function prepareEdits(direction, left, right)
	{
		status.innerHTML = "Loading...";
 
		editor.addEdit({
			'redo': function () { (direction == '→' ? moveOneRight : moveOneLeft)(left, right) },
			'undo': function () { (direction == '→' ? moveOneLeft : moveOneRight)(left, right) },
			'edit': function (text) {return editWikitext(right, direction, text);},
			'summary': 't-balance'
		});
	}
 
	//get the wikitext modification
	function editWikitext(insertUl, direction, text)
	{
		status.innerHTML = "";
		//Find the position of the translation table
		var p = util.getTransTable(text, insertUl);
 
		if (!p)
			return editor.error("Could not find translation table, please improve glosses.");
 
		var stapos = p[0];
		var endpos = p[1];
 
		//Find the start and end of the { {trans-mid}} in the table
		var midpos = text.indexOf('{'+'{trans-mid}}', stapos);
		var midstart = text.lastIndexOf("\n", midpos);
		var midend = text.indexOf("\n", midpos);
 
		if (midstart < stapos - 1 || midend > endpos)
			return editor.error("Could not find {'+'{trans-mid}}, please correct page.");
 
		if (direction == '→')
		{
			// Select the last list item of the left list (may be more than one line if nested translations are present)
			var linestart = text.lastIndexOf("\n", midstart - 3);
			while (/^[:*#;]$/.test(text.substr(linestart+2,1)))
				linestart = text.lastIndexOf("\n", linestart - 1);
 
			if (linestart < stapos - 1 || linestart >= endpos) 
				return editor.error("No translations to move");
 
			return text.substr(0, linestart)  //Everything before the item we are moving
					+ text.substr(midstart, midend - midstart) //Then { {trans-mid}}
					+ text.substr(linestart, midstart - linestart) //Then the item we are moving
					+ text.substr(midend); //Then everything after { {trans-mid}}
		}
		else if (direction == '←')
		{
			// Select the first list item of the right list (may be more than one line if nested translations are present)
			var lineend = text.indexOf("\n", midend + 3);
			while (/^[:*#;]$/.test(text.substr(lineend+2,1)))
				lineend = text.indexOf("\n", lineend + 1);
 
			if (lineend < stapos - 1 || lineend >= endpos) 
				return editor.error("No translations to move");
 
			return text.substr(0, midstart) //Everything before { {trans-mid}}
					+ text.substr(midend, lineend - midend) //Then the item we are moving
					+ text.substr(midstart, midend - midstart) //Then { {trans-mid}}
					+ text.substr(lineend); //Then everything after the item we are moving
		}
		return text;
	}
	init();
}
 
function LangMetadata ()
{
	//Singleton
	if (arguments.callee.instance)
		return arguments.callee.instance
	else
		arguments.callee.instance = this;
 
	// {{{ Metadata dictionaries
		var metadata = {aa:{hw:1,sc:["Latn","Ethi"]},ab:{hw:1,sc:["Cyrl","Latn","Geor"]},aer:{sc:"Latn"},af:{g:"",hw:1,p:1,sc:"Latn"},ak:{hw:1},akk:{g:"mf",p:1,sc:"Xsux"},als:{hw:1},am:{g:"mf",hw:1,p:1,sc:"Ethi"},an:{g:"mf",hw:1,p:1,sc:"Latn"},ang:{alt:1,g:"mfn",hw:1,p:1,sc:"Latn"},ar:{alt:1,g:"mf",hw:1,p:1,sc:"Arab"},arc:{g:"mf",p:1,sc:"Hebr"},are:{sc:"Latn"},arz:{alt:1,g:"mf",p:1,sc:"Arab"},as:{hw:1,sc:"Beng"},ast:{g:"mf",hw:1,p:1,sc:"Latn"},av:{hw:1,sc:"Cyrl"},axm:{alt:0,g:"",sc:"Armn"},ay:{hw:1},az:{alt:0,g:"",hw:1,p:1,sc:["Latn","Cyrl","Arab"]},ba:{sc:"Cyrl"},bar:{sc:"Latn"},"bat-smg":{g:"mf",p:1,sc:"Latn"},be:{g:"mfn",hw:1,p:1,sc:["Cyrl","Latn"]},"be-x-old":{sc:"Cyrl"},bg:{g:"mfn",hw:1,p:1,sc:"Cyrl"},bh:{hw:1,sc:"Deva"},bhb:{sc:"Deva"},bi:{hw:1,sc:"Latn"},blt:{sc:"Tavt"},bm:{hw:1,sc:["Latn","Nkoo","Arab"]},bn:{g:"",hw:1,sc:"Beng"},bo:{hw:1,sc:"Tibt"},br:{g:"mf",hw:1,sc:"Latn"},bs:{hw:1,sc:"Latn"},ca:{g:"mf",hw:1,p:1,sc:"Latn"},cdo:{g:"",p:0,sc:"Hans"},ch:{hw:1,sc:"Latn"},chr:{hw:1,sc:"Cher"},cjy:{g:"",p:0,sc:"Hans"},cmn:{g:"",p:0,sc:"Hans"},co:{hw:1,sc:"Latn"},cpx:{g:"",p:0,sc:"Hans"},cr:{hw:1,sc:"Cans"},crh:{alt:0,g:"",sc:"Latn"},cs:{g:"mfn",hw:1,p:1,sc:"Latn"},csb:{hw:1},cu:{g:"mfn",p:1,sc:["Cyrs","Glag"]},cv:{alt:0,g:"",sc:"Cyrl"},cy:{g:"mf",hw:1,p:1,sc:"Latn"},czh:{g:"",p:0,sc:"Hans"},czo:{g:"",p:0,sc:"Hans"},da:{g:"cn",hw:1,p:1,sc:"Latn"},dax:{sc:"Latn"},de:{g:"mfn",hw:1,p:1,sc:"Latn"},dhg:{sc:"Latn"},djb:{sc:"Latn"},dji:{sc:"Latn"},djr:{sc:"Latn"},dng:{g:"",p:0,sc:"Cyrl"},dsx:{sc:"Latn"},duj:{sc:"Latn"},dv:{hw:1,p:1,sc:"Thaa"},dz:{hw:1,sc:"Tibt"},el:{g:"mfn",hw:1,p:1,sc:"Grek"},en:{g:"",hw:1,p:1,sc:"Latn"},eo:{g:"",hw:1,p:1,sc:"Latn"},es:{alt:0,g:"mf",hw:1,p:1,sc:"Latn"},et:{alt:0,g:"",hw:1,p:1,sc:"Latn"},ett:{p:1,sc:"Ital"},eu:{alt:0,g:"",hw:1,p:1,sc:"Latn"},fa:{g:"",hw:1,sc:"Arab",wsc:"fa-Arab"},fi:{g:"",hw:1,p:1,sc:"Latn"},fil:{g:"",p:0,sc:"Latn"},fj:{hw:1,sc:"Latn"},fo:{g:"mfn",hw:1,sc:"Latn"},fr:{alt:0,g:"mf",hw:1,p:1,sc:"Latn"},frm:{alt:0,g:"mf",p:1,sc:"Latn"},fro:{alt:0,g:"mf",p:1,sc:"Latn"},fy:{hw:1,sc:"Latn"},ga:{g:"mf",hw:1,p:1,sc:"Latn"},gan:{g:"",p:0,sc:"Hans"},gd:{g:"mf",hw:1,p:1,sc:"Latn"},gez:{sc:"Ethi"},gl:{g:"mf",hw:1,p:1,sc:"Latn"},gmy:{sc:"Linb"},gn:{hw:1},gnn:{sc:"Latn"},got:{g:"mfn",p:1,sc:"Goth"},grc:{g:"mfn",p:1,sc:"Grek",wsc:"polytonic"},gu:{g:"mfn",hw:1,p:1,sc:"Gujr"},guf:{sc:"Latn"},gv:{hw:1},ha:{hw:1},hak:{g:"",p:0,sc:"Hans"},har:{sc:"Ethi"},he:{alt:1,g:"mf",hw:1,p:1,sc:"Hebr"},hi:{g:"mf",hw:1,p:1,sc:"Deva"},hif:{sc:["Latn","Deva"]},hit:{sc:"Xsux"},hr:{alt:1,g:"mfn",hw:1,p:1,sc:"Latn"},hsb:{hw:1},hsn:{g:"",p:0,sc:"hans"},hu:{alt:0,g:"",hw:1,p:1,sc:"Latn"},hy:{alt:0,g:"",hw:1,sc:"Armn"},ia:{alt:0,g:"",hw:1,sc:"Latn"},id:{hw:1,sc:"Latn"},ie:{alt:0,g:"",hw:1,sc:"Latn"},ik:{hw:1},ike:{sc:"Cans"},ikt:{sc:"Cans"},io:{hw:1},is:{alt:0,g:"mfn",hw:1,p:1,sc:"Latn"},it:{alt:0,g:"mf",hw:1,p:1,sc:"Latn"},iu:{hw:1,sc:"Cans"},ja:{alt:0,g:"",hw:1,p:0,sc:"Jpan"},jay:{sc:"Latn"},jbo:{hw:1,sc:"Latn"},jv:{hw:1},ka:{alt:0,g:"",hw:1,sc:"Geor"},khb:{sc:"Talu"},kjh:{sc:"Cyrl"},kk:{alt:0,g:"",hw:1,sc:"Cyrl"},kl:{hw:1},km:{hw:1,sc:"Khmr"},kn:{hw:1,sc:"Knda"},ko:{alt:0,g:"",hw:1,p:0,sc:"Kore"},krc:{alt:0,g:"",p:1,sc:"Cyrl"},ks:{hw:1,sc:["Arab","Deva"],wsc:"ks-Arab"},ku:{hw:1,sc:"Arab",wsc:"ku-Arab"},kw:{hw:1},ky:{alt:0,g:"",hw:1,sc:"Cyrl"},la:{alt:1,g:"mfn",hw:1,p:1,sc:"Latn"},lb:{hw:1},lez:{sc:"Cyrl"},li:{hw:1},ln:{hw:1},lo:{alt:0,g:"",hw:1,p:0,sc:"Laoo"},lt:{alt:1,g:"mf",hw:1,p:1,sc:"Latn"},lv:{alt:0,g:"mf",hw:1,p:1,sc:"Latn"},mg:{hw:1},mh:{hw:1},mi:{alt:0,g:0,hw:1,sc:"Latn"},mk:{g:"mfn",hw:1,p:1,sc:"Cyrl"},ml:{g:"",hw:1,sc:"Mlym"},mn:{alt:0,g:"",hw:1,sc:["Cyrl","Mong"]},mnp:{g:"",p:0,sc:"Hans"},mo:{hw:1,sc:"Cyrl"},mol:{sc:"Cyrl"},mr:{g:"mfn",hw:1,sc:"Deva"},ms:{hw:1,sc:["Latn","Arab"]},mt:{g:"mf",hw:1,sc:"Latn"},mwp:{sc:"Latn"},my:{hw:1,sc:"Mymr"},na:{hw:1},nah:{hw:1},nan:{g:"",p:0,sc:"Hans"},nb:{alt:0,g:"mfn",p:1,sc:"Latn"},nds:{hw:1},ne:{hw:1,sc:"Deva"},nl:{alt:0,g:"mfn",hw:1,p:1,sc:"Latn"},nn:{alt:0,g:"mfn",hw:1,p:1,sc:"Latn"},no:{alt:0,g:"mfn",hw:1,p:1,sc:"Latn"},non:{g:"mfn",p:1,sc:"Latn"},oc:{g:"mf",hw:1,p:1,sc:"Latn"},om:{hw:1},or:{hw:1,sc:"Orya"},os:{alt:0,g:"",sc:"Cyrl"},osc:{sc:"Ital"},ota:{sc:"Arab",wsc:"ota-Arab"},pa:{g:"mf",hw:1,p:1,sc:["Guru","Arab"]},peo:{sc:"Xpeo"},phn:{sc:"Phnx"},pi:{hw:1},pjt:{sc:"Latn"},pl:{g:"mfn",hw:1,p:1,sc:"Latn"},ps:{hw:1,sc:"Arab",wsc:"ps-Arab"},pt:{alt:0,g:"mf",hw:1,p:1,sc:"Latn"},qu:{hw:1},rit:{sc:"Latn"},rm:{g:"mf",hw:1,sc:"Latn"},rn:{hw:1},ro:{g:"mfn",hw:1,p:1,sc:["Latn","Cyrl"]},"roa-rup":{hw:1},ru:{alt:1,g:"mfn",hw:1,p:1,sc:"Cyrl"},ruo:{g:"mfn",p:1,sc:"Latn"},rup:{g:"mfn",p:1,sc:"Latn"},ruq:{g:"mfn",p:1,sc:"Latn"},rw:{hw:1,sc:"Latn"},sa:{g:"mfn",hw:1,p:1,sc:"Deva"},sah:{sc:"Cyrl"},sc:{hw:1},scn:{g:"mf",hw:1,p:1,sc:"Latn"},sco:{sc:"Latn"},sd:{hw:1,sc:"Arab",wsc:"sd-Arab"},sg:{hw:1},sh:{hw:1},si:{hw:1,sc:"Sinh"},simple:{hw:1,sc:"Latn"},sk:{g:"mfn",hw:1,p:1,sc:"Latn"},sl:{g:"mfn",hw:1,p:1,sc:"Latn"},sm:{hw:1},sn:{hw:1},so:{hw:1},spx:{sc:"Ital"},sq:{alt:0,g:"mf",hw:1,sc:"Latn"},sr:{g:"mfn",hw:1,p:1,sc:["Cyrl","Latn"]},ss:{hw:1},st:{hw:1},su:{hw:1},sux:{sc:"Xsux"},sv:{alt:0,g:"cn",hw:1,p:1,sc:"Latn"},sw:{alt:0,g:"",hw:1,sc:"Latn"},syc:{sc:"Syrc"},syr:{sc:"Syrc"},ta:{alt:0,g:"",hw:1,sc:"Taml"},tdd:{sc:"Tale"},te:{alt:0,g:"",hw:1,sc:"Telu"},tg:{alt:0,g:"",hw:1,sc:"Cyrl"},th:{alt:0,g:"",hw:1,p:0,sc:"Thai"},ti:{hw:1,sc:"Ethi"},tig:{sc:"Ethi"},tiw:{sc:"Latn"},tk:{alt:0,g:"",hw:1,sc:"Latn"},tl:{g:"",hw:1,p:0,sc:["Latn","Tglg"]},tmr:{sc:"Hebr"},tn:{hw:1},to:{hw:1},tpi:{hw:1,sc:"Latn"},tr:{alt:1,g:"",hw:1,p:1,sc:"Latn"},ts:{hw:1},tt:{alt:0,g:"",hw:1,sc:"Cyrl"},tw:{hw:1},ug:{hw:1,sc:"Arab",wsc:"ug-Arab"},uga:{sc:"Ugar"},uk:{g:"mfn",hw:1,p:1,sc:"Cyrl"},ulk:{sc:"Latn"},ur:{g:"mf",hw:1,p:1,sc:"Arab",wsc:"ur-Arab"},uz:{alt:0,g:"",hw:1,sc:"Latn"},vi:{g:"",hw:1,p:0,sc:"Latn"},vo:{hw:1},wa:{hw:1},wbp:{sc:"Latn"},wo:{hw:1},wuu:{g:"",p:0,sc:"Hans"},xae:{sc:"Ital"},xcl:{alt:0,g:"",sc:"Armn"},xcr:{sc:"Cari"},xfa:{sc:"Ital"},xh:{hw:1},xlc:{sc:"Lyci"},xld:{sc:"Lydi"},xlu:{sc:"Xsux"},xno:{alt:0,g:"mf",p:1,sc:"Latn"},xrr:{sc:"Ital"},xst:{sc:"Ethi"},xum:{sc:"Ital"},xve:{sc:"Ital"},xvo:{sc:"Ital"},yi:{g:"mfn",hw:1,p:1,sc:"Hebr"},yo:{hw:1},yua:{alt:1,g:"",p:1,sc:"Latn"},yue:{g:"",p:0,sc:"Hant"},za:{hw:1},zh:{g:"",hw:1,p:0,sc:"Hani"},"zh-classical":{sc:"Hant"},"zh-min-nan":{hw:1,sc:"Latn"},"zh-yue":{sc:"Hani"},zu:{hw:1,sc:"Latn"}}
		var clean = {aar:"aa",afar:"aa",abk:"ab",abkhazian:"ab",afr:"af",afrikaans:"af",aka:"ak",akan:"ak",amh:"am",amharic:"am",ara:"ar",arabic:"ar",arg:"an",aragonese:"an",asm:"as",assamese:"as",ava:"av",avaric:"av",ave:"ae",avestan:"ae",aym:"ay",aymara:"ay",aze:"az",azerbaijani:"az",bak:"ba",bashkir:"ba",bam:"bm",bambara:"bm",bel:"be",belarusian:"be",ben:"bn",bengali:"bn",bis:"bi",bislama:"bi",bod:"bo",tibetan:"bo",bos:"bs",bosnian:"bs",bre:"br",breton:"br",bul:"bg",bulgarian:"bg",cat:"ca",catalan:"ca",ces:"cs",czech:"cs",cha:"ch",chamorro:"ch",che:"ce",chechen:"ce",chu:"cu",churchslavic:"cu",chv:"cv",chuvash:"cv",cor:"kw",cornish:"kw",cos:"co",corsican:"co",cre:"cr",cree:"cr",cym:"cy",welsh:"cy",dan:"da",danish:"da",deu:"de",german:"de",div:"dv",dhivehi:"dv",dzo:"dz",dzongkha:"dz",ell:"el",greek:"el",eng:"en",english:"en",epo:"eo",esperanto:"eo",est:"et",estonian:"et",eus:"eu",basque:"eu",ewe:"ee",fao:"fo",faroese:"fo",fas:"fa",persian:"fa",fij:"fj",fijian:"fj",fin:"fi",finnish:"fi",fra:"fr",french:"fr",fry:"fy",westernfrisian:"fy",ful:"ff",fulah:"ff",gla:"gd",scottishgaelic:"gd",gle:"ga",irish:"ga",glg:"gl",galician:"gl",glv:"gv",manx:"gv",grn:"gn",guarani:"gn",guj:"gu",gujarati:"gu",hat:"ht",haitian:"ht",hau:"ha",hausa:"ha",heb:"he",hebrew:"he",her:"hz",herero:"hz",hin:"hi",hindi:"hi",hmo:"ho",hirimotu:"ho",hrv:"hr",croatian:"hr",hun:"hu",hungarian:"hu",hye:"hy",armenian:"hy",ibo:"ig",igbo:"ig",ido:"io",iii:"ii",sichuanyi:"ii",iku:"iu",inuktitut:"iu",ile:"ie",interlingue:"ie",ina:"ia",interlingua:"ia",ind:"id",indonesian:"id",ipk:"ik",inupiaq:"ik",isl:"is",icelandic:"is",ita:"it",italian:"it",jav:"jv",javanese:"jv",jpn:"ja",japanese:"ja",kal:"kl",kalaallisut:"kl",kan:"kn",kannada:"kn",kas:"ks",kashmiri:"ks",kat:"ka",georgian:"ka",kau:"kr",kanuri:"kr",kaz:"kk",kazakh:"kk",khm:"km",centralkhmer:"km",kik:"ki",kikuyu:"ki",kin:"rw",kinyarwanda:"rw",kir:"ky",kirghiz:"ky",kom:"kv",komi:"kv",kon:"kg",kongo:"kg",kor:"ko",korean:"ko",kua:"kj",kuanyama:"kj",kur:"ku",kurdish:"ku",lao:"lo",lat:"la",latin:"la",lav:"lv",latvian:"lv",lim:"li",limburgan:"li",lin:"ln",lingala:"ln",lit:"lt",lithuanian:"lt",ltz:"lb",luxembourgish:"lb",lub:"lu",lubakatanga:"lu",lug:"lg",ganda:"lg",mah:"mh",marshallese:"mh",mal:"ml",malayalam:"ml",mar:"mr",marathi:"mr",mkd:"mk",macedonian:"mk",mlg:"mg",malagasy:"mg",mlt:"mt",maltese:"mt",mon:"mn",mongolian:"mn",mri:"mi",maori:"mi",msa:"ms",malay:"ms",mya:"my",burmese:"my",nau:"na",nauru:"na",nav:"nv",navajo:"nv",nbl:"nr",southndebele:"nr",nde:"nd",northndebele:"nd",ndo:"ng",ndonga:"ng",nep:"ne",nepali:"ne",nld:"nl",dutch:"nl",nno:"nn",norwegiannynorsk:"nn",nob:"nb",norwegianbokmal:"nb",nor:"no",norwegian:"no",nya:"ny",nyanja:"ny",oci:"oc",occitan:"oc",oji:"oj",ojibwa:"oj",ori:"or",oriya:"or",orm:"om",oromo:"om",oss:"os",ossetian:"os",pan:"pa",panjabi:"pa",pli:"pi",pali:"pi",pol:"pl",polish:"pl",por:"pt",portuguese:"pt",pus:"ps",pushto:"ps",que:"qu",quechua:"qu",roh:"rm",romansh:"rm",ron:"ro",romanian:"ro",run:"rn",rundi:"rn",rus:"ru",russian:"ru",sag:"sg",sango:"sg",san:"sa",sanskrit:"sa",sin:"si",sinhala:"si",slk:"sk",slovak:"sk",slv:"sl",slovenian:"sl",sme:"se",northernsami:"se",smo:"sm",samoan:"sm",sna:"sn",shona:"sn",snd:"sd",sindhi:"sd",som:"so",somali:"so",sot:"st",southernsotho:"st",spa:"es",spanish:"es",sqi:"sq",albanian:"sq",srd:"sc",sardinian:"sc",srp:"sr",serbian:"sr",ssw:"ss",swati:"ss",sun:"su",sundanese:"su",swa:"sw",swahili:"sw",swe:"sv",swedish:"sv",tah:"ty",tahitian:"ty",tam:"ta",tamil:"ta",tat:"tt",tatar:"tt",tel:"te",telugu:"te",tgk:"tg",tajik:"tg",tgl:"tl",tagalog:"tl",tha:"th",thai:"th",tir:"ti",tigrinya:"ti",ton:"to",tonga:"to",tsn:"tn",tswana:"tn",tso:"ts",tsonga:"ts",tuk:"tk",turkmen:"tk",tur:"tr",turkish:"tr",twi:"tw",uig:"ug",uighur:"ug",ukr:"uk",ukrainian:"uk",urd:"ur",urdu:"ur",uzb:"uz",uzbek:"uz",ven:"ve",venda:"ve",vie:"vi",vietnamese:"vi",vol:"vo",volapuk:"vo",wln:"wa",walloon:"wa",wol:"wo",wolof:"wo",xho:"xh",xhosa:"xh",yid:"yi",yiddish:"yi",yor:"yo",yoruba:"yo",zha:"za",zhuang:"za",zho:"zh",chinese:"zh",zul:"zu",zulu:"zu"};
	// }}}
 
	// FIXME: merge into above
	var c = 'Chinese';var a = 'Arabic';
	var nesting = {
		aln:'Albanian/Gheg',sq:'Albanian/Tosk',
		apj:'Apache',apm:'Apache',apw:'Apache',
		syr:'Aramaic',syc:'Aramaic',
		xcl:'Armenian',axm:'Armenian',
		// ang:'English',enm:'English', don't nest English (Encyclopetey)
		fro:'French',frm:'French',
		oge:'Georgian',
		gmh:'German',goh:'German',gsw:'German',ksh:'German',pfl:'German',sxu:'German',
		grc:'Greek/Ancient',gmy:'Greek/Mycenaean', //el:'Greek/Modern', don't nest modern greek (Atelaes)
		sga:'Irish',mga:'Irish',
		nb:'Norwegian/Bokmål',nn:'Norwegian/Nynorsk', 
		mhr:'Mari',mrj:'Mari',
		cmg:'Mongolian',
		sro:'Sardinian',sdn:'Sardinian',src:'Sardinian',scd:'Sardinian',
		dsb:'Sorbian',hsb:'Sorbian', 
		osp:'Spanish',
		owl:'Welsh',wlm:'Welsh',
		zh:c,yue:c,dng:c,gan:c,hak:c,czh:c,cjy:c,cmn:c,mnp:c,cdo:c,nan:c,czo:c,cpx:c,wuu:c,hsn:c,lzh:c,
		arq:a,aao:a,bbz:a,abv:a,shu:a,acy:a,adf:a,avl:a,arz:a,afb:a,ayh:a,acw:a,ayl:a,acm:a,ary:a,
		ars:a,apc:a,ayp:a,acx:a,aec:a,ayn:a,ssh:a,ajp:a,arb:a,apd:a,pga:a,acq:a,abh:a,aeb:a,auz:a
	}
 
	var altForm = {
		ang: {from:"ĀāǢǣĊċĒēĠġĪīŌōŪūȲȳ", to:"AaÆæCcEeGgIiOoUuYy", strip:"\u0304\u0307"}, //macron and above dot
		ar: {strip:"\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652"},
		he: {strip:"\u05B0\u05B1\u05B2\u05B3\u05B4\u05B5\u05B6\u05B7\u05B8\u05B9\u05BA\u05BB\u05BC\u05BD\u05BF\u05C1\u05C2"},
		hr: {from:"ȀȁÀàȂȃÁáĀāȄȅÈèȆȇÉéĒēȈȉÌìȊȋÍíĪīȌȍÒòȎȏÓóŌōȐȑȒȓŔŕȔȕÙùȖȗÚúŪū",
			 to:"AaAaAaAaAaEeEeEeEeEeIiIiIiIiIiOoOoOoOoOoRrRrRrUuUuUuUuUu",
			 strip:"\u030F\u0300\u0311\u0301\u0304"},
		la: {from:"ĀāĒēĪīŌōŪū", to:"AaEeIiOoUu",strip:"\u0304"}, //macron
		lt: {from:"áãàéẽèìýỹñóõòúù", to:"aaaeeeiyynooouu", strip:"\u0340\u0301\u0303"},
		ro: {from:"ŞŢşţ", to:"ȘȚșț"},
		sh: {from:"ȀȁÀàȂȃÁáĀāȄȅÈèȆȇÉéĒēȈȉÌìȊȋÍíĪīȌȍÒòȎȏÓóŌōȐȑȒȓŔŕȔȕÙùȖȗÚúŪūѝ",
			 to:"AaAaAaAaAaEeEeEeEeEeIiIiIiIiIiOoOoOoOoOoRrRrRrUuUuUuUuUuи",
			 strip:"\u030F\u0300\u0311\u0301\u0304"},
		sr: {from:"ȀȁÀàȂȃÁáĀāȄȅÈèȆȇÉéĒēȈȉÌìȊȋÍíĪīȌȍÒòȎȏÓóŌōȐȑȒȓŔŕȔȕÙùȖȗÚúŪū",
			 to:"AaAaAaAaAaEeEeEeEeEeIiIiIiIiIiOoOoOoOoOoRrRrRrUuUuUuUuUu",
			 strip:"\u030F\u0300\u0311\u0301\u0304"},
		tr: {from:"ÂâÛû", to:"AaUu",strip:"\u0302"},
		sl: {from: "áÁàÀâÂȃȂȁȀéÉèÈêÊȇȆȅȄíÍìÌîÎȋȊȉȈóÓòÒôÔȏȎȍȌŕŔȓȒȑȐúÚùÙûÛȗȖȕȔệỆộỘẹẸọỌ",
			 to: "aAaAaAaAaAeEeEeEeEeEiIiIiIiIiIoOoOoOoOoOrRrRrRuUuUuUuUuUeEoOeEoO",
			 strip: "\u0301\u0300\u0302\u0311\u030f\u0323"}
	}; 
	//Returns true if the specified lang.wiktionary exists according to the meta list
	this.hasWiktionary = function(lang)
	{
		if (metadata[lang])
			return metadata[lang].hw;
	}
 
	//Given a language code return a default script code.
	this.guessScript = function(lang)
	{
		if (metadata[lang]) {
			// enwikt language template? (ur-Arab, polytonic)
			if (metadata[lang].wsc) {
				return metadata[lang].wsc;
			}
			// ISO script code? (Arab, Grek)
			if (metadata[lang].sc) {
				if (typeof metadata[lang].sc == 'object')
					return metadata[lang].sc[0];
				else
					return metadata[lang].sc;
			}
		}
 
		return false;
	}
 
	// In a given language, would we expect a translation of the title to have the capitalisation
	// of word?
	this.expectedCase = function (lang, title, word) {
		if (lang == 'de' || lang == 'lb')
			return true;
 
		if (title.substr(0, 1).toLowerCase() != title.substr(0, 1))
			return true;
 
		return word.substr(0, 1).toLowerCase() == word.substr(0, 1)
	}
 
	//Returns a string of standard gender letters (mfnc) or an empty string
	this.getGenders = function(lang)
	{
		if (metadata[lang])
			return metadata[lang].g;
	}
 
	//Returns true if the specified lang has the concept of plural nouns
	this.hasPlural = function(lang)
	{
		if (metadata[lang])
			return metadata[lang].p;
	}
 
	//Returns true if the specified lang uses optional vowels or diacritics
	this.needsAlt = function(lang)
	{
		if (metadata[lang])
			return metadata[lang].alt && (!altForm[lang]);
	}
 
	// Generates a form of the page name without any diacritics (for Latin, etc.)
	this.generateAltForm = function (lang, word)
	{
		if (altForm[lang])
		{
			var alt = altForm[lang];
 
			var map = {};
 
			if (alt.from && alt.to)
			{
				for (var i = 0; i < alt.from.length; i++)
				{
					map[alt.from.charAt(i)] = alt.to.charAt(i);
				}
			}
			if (alt.strip)
			{
				for (var i = 0; i < alt.strip.length; i++)
				{
					map[alt.strip.charAt(i)] = "";
				}
			}
 
			var input = word.split("");
			var output = "";
 
			for (var i = 0; i < input.length; i++)
			{
				var repl = map[input[i]];
				output += (repl == null) ? input[i] : repl;
			}
			return output;
		}
	}
 
	//Given user input, return a language code. Normalises ISO 639-1 codes and names to 639-3.
	this.cleanLangCode = function(lang)
	{
		var key = lang.toLowerCase().replace(' ','');
		if (clean[key])
			return clean[key];
		else
			return lang;
	}
 
	// Get the nesting for a given sub-language
	this.getNested = function (lang)
	{
		if (nesting[lang])
			return nesting[lang];
		else
			return "";
	}
 
	function temporalSortKey(langname)
	{
		return langname.replace(/^(Ancient|Classical|Old|Middle|Early Modern|Modern) (.*)/, function(m, modifier, name)
			{
				return ({Ancient: 0, Old: 1, Middle: 2, "Early Modern": 3, Modern: 4})[modifier] + name;
			});
	}
	// For enforcing an ordering on nested languages.
	this.nestsBefore = function (a, b)
	{
		return  temporalSortKey(a) < temporalSortKey(b);
	}
 
	this.getScripts = function(lang)
	{
		var script = metadata[lang]?metadata[lang].wsc || metadata[lang].sc:[];
		return (typeof script === 'string' ? [script] : script) || [];
	}
}
/* 
addOnloadHook(function () {
 
	// Check if we are on a sensible page
	var actions = window.location.toString().replace(/.*\?/, '&');
	if (wgAction != 'view' || actions.indexOf('&printable=yes') > -1 || actions.indexOf('&diff=') > -1 || actions.indexOf('&oldid=') > -1)
		return;
 
	// Check that we have not been disabled
	var prefs = new CookiePreferences('EditorJs');
	if (prefs.get('enabled', 'true') == 'true')
	{
		if (! window.loadedEditor)
		{
			prefs.setDefault('labeller', wgUserName ? 'true' : 'false' );
			window.loadedEditor = true;
			var editor = new Editor();
			TranslationAdders(editor);
		}
	}
 
	// The enable-disable button on WT:EDIT
	var node = document.getElementById('editor-js-disable-button');
 
	if (node)
	{
		node.innerHTML = "";
		var toggle = newNode('span', {click: function ()
		{
			if (prefs.get('enabled', 'true') == 'true')
			{
				toggle.innerHTML = "Enable";
				prefs.set('enabled', 'false');
			}
			else
			{
				toggle.innerHTML = "Disable";
				prefs.set('enabled', 'true');
			}
 
		} }, (prefs.get('enabled', 'true') == 'true' ? 'Disable' : 'Enable'))
 
		node.appendChild(toggle);
	}
 
	var node = document.getElementById("editor-js-labeller-button");
	if (node)
	{
		node.innerHTML = "";
		var toggle2 = newNode('span', {click: function ()
		{
			if (prefs.get('labeller') == 'true')
			{
				toggle2.innerHTML = "Enable";
				prefs.set('labeller', 'false');
			}
			else
			{
				toggle2.innerHTML = "Disable";
				prefs.set('labeller', 'true');
			}
 
		} }, (prefs.get('labeller') == 'true' ? 'Disable' : 'Enable'))
 
		node.appendChild(toggle2);
 
	}
})
*/
