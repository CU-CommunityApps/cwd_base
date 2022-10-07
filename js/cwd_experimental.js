/* CWD Experimental Functionality (ama39, last update: 6/10/22)
	Experimental/non-production scripting to help with demonstration and documentation. Some of this may eventually graduate to CWD Utilities.
   - 1. Automated Table of Contents
   - 2. Code Copy
   ------------------------------------------------------------------------- */

		
// 1. Automated Table of Contents ---------------------------------------------------------------
	
// defaults
var default_origin_target = '#main-article';
var default_toc_target = '#page-toc';
	
function autoTOC(origin_target,toc_target) {
	
	jQuery(document).ready(function($) {	
		// apply arguments or use defaults
		var origin = origin_target || default_origin_target;
		var toc = toc_target || default_toc_target;
		
		var headings = $(origin + ' > h2, ' + origin + ' > h3, ' + origin + ' > h4, ' + origin + ' > section > h2, ' + origin + ' > section > h3, ' + origin + ' > section > h4').not('.no-toc');
		var nest_level = 1;
		
		if ( headings.length > 1 ) {
			
			$(origin).attr('tabindex','-1').addClass('aria-target'); // set focus target for accessibility
			$(toc).append('<ol></ol>'); // start a list to populate
			$(headings).each(function(i) {
				
				// Strip links and accommodate semantic tags within headings (<small>, <code>, etc...)
				var link_label_process = $(this).clone();
				$(link_label_process).children('a').contents().unwrap('a'); // remove existing links
				$(link_label_process).contents().filter(isTextNode).each(function() {
					$(this).wrap('<span class="deco"></span>'); // wrap simple text nodes
					$(this).parent().html($(this).parent().html().trim()).after(' '); // move any spacing outside the span
				});
				var link_label = $(link_label_process).html().trim();

				// remove number prefix from labels if present
				if ( !isNaN(link_label.charAt(0)) ) {
					if ( link_label.charAt(1) == '.' ) {
						link_label = link_label.substr(2).trim();
					}
					else if ( link_label.charAt(2) == '.' ) {
						link_label = link_label.substr(3).trim();
					}
				}
				$(this).attr('id','section-'+(i+1)).addClass('toc').after('<a href="' + origin + '" class="back-to-toc" title="Back to Top"><span class="sr-only">Back to Top</span></a>');
				
				// Nested Lists
				if ( nest_level == 1 && $(this).filter('h3').length > 0 ) {
					nest_level++;
					$(toc + ' > ol').append('<ol></ol>');
				}
				else if ( nest_level == 2 && $(this).filter('h4').length > 0 ) {
					nest_level++;
					$(toc + ' > ol > ol:last-of-type').append('<ol></ol>');
				}
				else if ( nest_level == 3 && $(this).filter('h3').length > 0 ) {
					nest_level--;
				}
				else if ( nest_level == 3 && $(this).filter('h2').length > 0 ) {
					nest_level -= 2;
				}
				else if ( nest_level == 2 && $(this).filter('h2').length > 0 ) {
					nest_level--;
				}
				if (nest_level == 1) {
					$(toc + ' > ol').append('<li><a href="#section-'+(i+1)+'">'+link_label+'</a></li>');
				}
				else if (nest_level == 2) {
					$(toc + ' > ol > ol:last-of-type').append('<li><a href="#section-'+(i+1)+'">'+link_label+'</a></li>');
				}
				else {
					$(toc + ' > ol > ol:last-of-type > ol:last-of-type').append('<li><a href="#section-'+(i+1)+'">'+link_label+'</a></li>');
				}
				
			});
			
			// Nesting Cleanup (moves sublists into the list item above them for proper nesting)
			$(toc + ' li + ol').each(function() {
				$(this).appendTo($(this).prev());
			});
			
			// "Back to Top" mouse events
			$('.back-to-toc').click(function(e) {
				$('html, body').animate({
					scrollTop: 0
				}, 400, 'easeInOutQuad', function() {
					$(origin).focus();
				});
				//return false;
			});
			// Anchor link mouse events
			$(toc + ' a').click(function(e) {
				var c_target = $(this).attr('href');
				var c_target_offset = $(c_target).offset();
				$('html, body').animate({
					scrollTop: c_target_offset.top
				}, 400, 'easeInOutQuad', function() {
					$(c_target).focus();
				});
				//return false;
			});
		}
	});
	
}

// 2. Code Copy -----------------------------------------------------------
	
function codeCopySetup(selectors) {
	
	jQuery(document).ready(function($) {
		
		$(selectors).addClass('code-copy');
		$('.code-copy').before('<button class="button-copy enabled"><span class="sr-only">Copy Code</span></button>');
		
		// button code here
		$('.button-copy.enabled').each(function() {
			var copy_target = $(this).next('.code-copy');
			if ( $(copy_target).hasClass('align-right') || $(copy_target).hasClass('column') || $(copy_target).hasClass('sidebar') ) {
				$(this).addClass('right');
			}
			$(this).click(function() {
				$(copy_target).removeClass('code-copy');
				var markup = $(copy_target).prop('outerHTML').toString();
				try {
					navigator.clipboard.writeText(markup);
					$(this).addClass('success');
				}
				catch (err) {
					console.log('Error while copying to clipboard: ' + err);
					$(this).addClass('failure');
				}
				$(copy_target).addClass('code-copy');
				var this_button = $(this);
				setTimeout(function() {
					$(this_button).removeClass('success failure');
				},1000);
			});
		});
	});
}


// Window Load ------------------------------------------------------------
$(window).on('load', function(e) {
	

});

// Utility ----------------------------------------------------------------

function isTextNode(){
	return( this.nodeType === 3 );
}