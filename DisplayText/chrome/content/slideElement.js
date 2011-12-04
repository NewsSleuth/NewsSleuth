jQuery.noConflict();
jQuery(document).ready(function($){

	$("#bar_info_id").click(function(){
		$(this).slideToggle();
	});
	
/*	$("#content_id").click(function(e){
		//changeToggleText();
		//$(this).slideToggle();	
	});
*/
	$('#aExpand_id').click(function(e){
		// expand summary
		$('#aSummary_id').slideToggle('slow', switchArrows('a_row_id'));
	});

	$('#pExpand_id').click(function(e){
		// expand summary
		$('#pSummary_id').slideToggle('slow', switchArrows('p_row_id'));
	});

	$('#a_slide_id').click(function(e){
		$('#info_id').slideToggle('slow');
	});
	$('#p_slide_id').click(function(e){
		$('#publisher_id').slideToggle('slow');
	});
	
	$("#toggle_id").click(function(){
		//if ($('#content_id').text()) {
		if ($('#info_id').text() || $('#publication_id').text()) {
			changeToggleText();
			$('#content_id').slideToggle('slow');
		} else {
			if ($('#lookupLabelId').size()) {
				changeToggleText();
				$('#lookup_id').slideToggle('slow');
			} else {
				$('#HiddenAuthor').trigger('click');
			}
		}
	});

});

function switchArrows(id) {
	var row = content.document.getElementById(id);
	var c;
	if (row.firstChild.innerHTML === 'v')
		c = '^';
	else
		c = 'v';
	
	var cn = row.childNodes,
		len = cn.length;
	while(len--)
	{
		cn[len].innerHTML = c;
	}
}

function changeToggleText( )
{
	var toggle = content.document.getElementById('toggle_id').childNodes[0];
	if (toggle.nodeValue === '(hide)'){
		toggle.nodeValue = 'Show author & source information for this article';
	}else{
		toggle.nodeValue = '(hide)';
	}
}