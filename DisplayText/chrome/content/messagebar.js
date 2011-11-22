jQuery.noConflict();
jQuery(document).ready(function($){

//$("#info_id").slideDown("normal", "easeInOutBack");

$("#info_id").click(function(){

	$(this).slideToggle();	
 
});
$("#toggle_id").click(function(){
	if ($('#AuthorParagraph').size()) {
		$('#info_id').slideToggle();
	} else {
		if ($('#lookupLabelId').size()) {
			$('#lookup_id').slideToggle();
		} else {
			$('#HiddenAuthor').trigger('click');
		}
	}
});

});