let DisplayText = {
	onCommand: function(event) {
	  		
		// Append text to end of web page
		var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
	 
		// Create a new window to display text
		my_window = window.open("", "mywindow1", "status=1,width=350,height=150");
		//my_window = window.open("", "mywindow1");
		var headertext2 = content.document.createTextNode("Popup window information")
		my_window.content.document.body.appendChild(headertext2)

		// Add text after first 'h1' element of page
		var doc = content.document;
		var theNewParagraph = doc.createElement('p');
		var theTextOfTheParagraph = doc.createTextNode('Some content.');
		theNewParagraph.appendChild(theTextOfTheParagraph);
		var header = doc.getElementsByTagName("h1");
		header[0].appendChild(theNewParagraph);
		

		dump("Text displayed\n");
		}
};