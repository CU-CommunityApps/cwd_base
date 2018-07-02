/* CWD Base JavaScript (ama39, last update: 8/9/17)
	General scripting that applies to all sites:
   - 1. Helper Body Classes (modify styles or scripts for Windows, IE, and mobile/touch platforms)
   - 2. Cornell Search (focus control for keyboard accessibility) 
   ------------------------------------------------------------------------- */

jQuery(document).ready(function($) {
	
	// 1. Helper Body Classes -----------------------------------------------------------------------
	// Windows
	if (navigator.appVersion.indexOf('Win') > -1) {
		$('body').addClass('win');
		// Internet Explorer
		if (navigator.appName.indexOf('Internet Explorer') > -1 || !!navigator.userAgent.match(/Trident\/7\./) ) {
			$('body').addClass('ie'); // includes ie11
		}
	}
	// iOS
	if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
		$('body').addClass('ios touch');
	}
	// Android
	else if (navigator.userAgent.match(/Android/i)) {
		$('body').addClass('android touch');
	}
	// Other mobile
	else if (navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i) || navigator.userAgent.match(/Opera Mini/i)) {
		$('body').addClass('touch');
	}
	
	// 2. Cornell Search ----------------------------------------------------------------------------
	var mousedown = false;
	$('#cu-search-button').click(function(e) {
		mousedown = true;
		$('#cu-search').toggleClass('open');
		$(this).toggleClass('open');		
		if ( $(this).hasClass('open') ) {
			$('#cu-search-query').focus();
		}
		else {
			$(this).focus();
			mousedown = false;
		}
	});
	$('#cu-search input').focus(function() {
		if (!mousedown) {
			$('#cu-search, #cu-search-button').addClass('open');
			mousedown = false;
		}
	});

	
});