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
		$('#aSummary_id').slideToggle();
	});

	$('#pExpand_id').click(function(e){
		// expand summary
		$('#pSummary_id').slideToggle();
	});

	
	$("#toggle_id").click(function(){
		//if ($('#content_id').text()) {
		if ($('#info_id').text() || $('#publication_id').text()) {
			changeToggleText();
			$('#content_id').slideToggle();
		} else {
			if ($('#lookupLabelId').size()) {
				changeToggleText();
				$('#lookup_id').slideToggle();
			} else {
				$('#HiddenAuthor').trigger('click');
			}
		}
	});

});

function changeToggleText( )
{
	var toggle = content.document.getElementById('toggle_id').childNodes[0];
	if (toggle.nodeValue === '(hide)'){
		toggle.nodeValue = 'Show author & source information for this article';
	}else{
		toggle.nodeValue = '(hide)';
	}
}