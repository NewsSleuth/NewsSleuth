jQuery.noConflict();
jQuery(document).ready(function($){

	$("#bar_info_id").click(function(){
		$(this).slideToggle();
	});
	
	$("#info_id").click(function(){
		changeToggleText();
		$(this).slideToggle();	
	 
	});

	$("#toggle_id").click(function(){
		if ($('#info_id').text()) {
			changeToggleText();
			$('#info_id').slideToggle();
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
	var toggle = content.document.getElementById('toggle_id');
	if (toggle.innerHTML === '(hide)'){
		toggle.innerHTML = 'Show author & source information for this article';
	}else{
		toggle.innerHTML = '(hide)';
	}
}