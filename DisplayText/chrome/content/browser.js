let DisplayText = {
	onCommand: function(event) {
	  
		var h2s,i;
		// get all H2 elements and loop over them
		h2s = content.document.getElementsByTagName('h2');
		for(i=0;i<h2s.length;i++)
		{
			// set their colour to red
			h2s[i].style.color='red';
		}
				

		var headertext = content.document.createTextNode("Random inserted information asdfas dfsadjfk")
		content.document.body.appendChild(headertext)
	 
		dump("Text displayed\n");
		}
};