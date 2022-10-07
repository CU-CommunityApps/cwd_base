/* CWD Modal Popups (ama39, last update: 3/10/21)
	- Displays content as a "popup" overlay, rather than leaving the current page or opening a new window.
	- Activate on any link by applying a "popup" class (e.g., <a class="popup" href="bigredbear.jpg">Behold the Big Red Bear!</a>).
	- Supports images, DOM elements by ID, and Iframes (auto-detected from the href attribute).
   - Keyboard and Screen Reader accessible with ARIA dialog bounds, focus control, and key shortcuts.
   - At mobile sizes, DOM Element and Iframe popups will automatically become full-screen and scroll independently.
   - Custom initial focus target support via the new data-focus attribute (added 3/10/21)
   
   - Image Gallery mode:
   - -- Gallery behavior (next/prev) is available for sets of images that share a "data-gallery" attribute.
   - -- When running in Image Gallery mode, a loading animation is provided when transitioning between images.
   - -- Detects and corrects for oversized images (added 8/16/18)
   - -- Video Support (added 9/2/18)
   - -- Custom Field Support added for Image/Video mode (added 2/23/21)
   
   - Accessibility Notes:
   - -- Popups have a "dialog" role along with visually-hidden titling, focus control, and tab indexing to smoothly transition to and from the dialog. The titling provides hints on key shortcuts and changes based on the type of content and whether it is the first time the user has launched the popup. See the popupControls() function below for more details.
   - -- When running in Image Gallery mode, Next and Previous buttons (or their key shortcuts) will shift focus to an element with a "progressbar" role. No progress updates are provided dynamically, but it will announce "Loading, 0 percent" and then wait for the image to load (or an error) before shifting back to the popup. This is to prevent focus from being temporarily orphaned during a popup transition on slow connections. On fast connections, it is likely to only read "Loading..." between each image.
   - -- It is recommended that popup links include the ARIA attribute aria-haspopup="true" unless it is part of an interface that has its own accessibility strategy.
   - -- Additional WA improvements: added support for launching from buttons, converted Close and Next/Prev links to buttons, popup contains focus for standard keyboard navigation (3/10/21)
   ------------------------------------------------------------------------- */

/* Global Options -------------- */
var popup_shadow = true; // applies a subtle dropshadow (css class "dropshadow")
var popup_fadein_speed = 0.2; // speed of popup fade-in (in seconds) -- note: it's best to leave this at 0.2, since newer CSS has been added which uses the same timing
var popup_max_width = 800; // max width of unconstrained popups (ID popups only)
var popup_max_height = 600; // max height of unconstrained popups (ID popups only)
var popup_proportion = 0.94; // size of unconstrained popups (0.94 = 94% window width and height)
var popup_resize_response = 0; // on window resize, controls how immediately the popup is recalculated (in milliseconds, 0 instructs the browser to resize as rapidly as possible, greater than 0 instructs the browser to only recalculate once at the end of the resize event(s) and after a delay of x milliseconds, set to 100 or more if performance on resize events is an issue)

/* Global Variables ------------ */
var popup_count = 0;
var popup_type = 'none';
var resize_popup;
var was_visible = false;
var popup_source;
var first_popup = true;
var first_gallery = true;
var gallery_running = false;
var return_focus = true;

popup_fadein_speed = popup_fadein_speed * 1000; // convert to milliseconds

/* -----------------------------------------------------------------------------------------
   Initialize Popups
   -----------------------------------------------------------------------------------------
   - Applies to all links with the class "popup"
   - Optionally accepts link attribute "data-popup-width"
   - Optionally accepts link attribute "data-popup-height" (ignored by image popups)
   - For Image Popups:
   - -- Optionally accepts link attribute "data-alt" to include alt text on the image displayed in the popup
   - -- Optionally accepts link attribute "data-title" to display a visible caption
   - -- Optionally accepts link attribute "data-gallery" to associate sets of images and allow forward/back navigation by button or arrow keys
-------------------------------------------------------------------------------------------- */

jQuery(document).ready(function($) {

	function popups() {
		
		// Create #popup node and background dimmer 
		$('body').append('<div id="popup-background" class="aria-target" tabindex="-1" aria-label="Loading..." role="progressbar" aria-valuemax="100" aria-valuemin="0" aria-valuenow="0"><span class="spinner"></span></div><div id="popup-wrapper"><div class="vertical-align"><div class="aria-target sr-only popup-focus-helper" tabindex="0"></div><div id="popup" class="aria-target" role="dialog" tabindex="-1"></div><div class="aria-target sr-only popup-focus-helper" tabindex="0"></div></div></div>');
		
		// Background space is clickable to close the popup
		$('#popup-wrapper').click(function(e) {
			$('#popup-close').trigger('click');
		});
		
		// Detect end of focus scope to cycle back to the beginning (to the close button)
		$('.popup-focus-helper').focus(function() {
			$('#popup-close').focus();
		});
		
		// Close key shortcut
		$(document).keyup(function(e) {
			if (e.keyCode == 27) { // escape key
				if ( $('#popup-wrapper:visible') ) {
					$('#popup-close').trigger('click');
				}
			}
		});
		$('#popup').focusin(function(e) {
			return_focus = true;
		}).focusout(function(e) {
			return_focus = false;
		}).click(function(e) {
			//e.preventDefault();
			e.stopPropagation();
		});
		
		// Gallery functionality (next/prev key shortcuts)
		$(document).keydown(function(e) {
			if ( $('#popup').hasClass('image-gallery') ) {
				if (e.keyCode == 37) { // left key
					e.preventDefault();
					$('#popup .next-prev .prev').trigger('click');
				}
				else if (e.keyCode == 39) { // right key
					e.preventDefault();
					$('#popup .next-prev .next').trigger('click');
				}
			}
		});
		
		// Gallery swipe left/right functionality (for touch devices, utilizes jquery.detectSwipe plugin)
		$.detectSwipe.preventDefault = false; // it's important to allow default touchmove events, so that scrolling continues to work when needed
		$('#popup').on('swipeleft', function() {
			if ( $('#popup').hasClass('image-gallery') ) {
				$('#popup').addClass('swipe-left');
				$('#popup .next-prev .prev').trigger('click');
			}
		});
		$('#popup').on('swiperight', function() {
			if ( $('#popup').hasClass('image-gallery') ) {
				$('#popup').addClass('swipe-right');
				$('#popup .next-prev .next').trigger('click');
			}
		});
		
		// Apply dropshadow preference
		if (popup_shadow) {
			$('#popup').addClass('dropshadow');		
		}
	
		// Setup click events to launch popups
		$('.popup').each(function(n) {
			popup_count++;
			$(this).data('popupID',popup_count);
			
			if ( $(this).attr('href') ) {
				var popup_content = target_href = $(this).attr('href');
			}
			else {
				var popup_content = target_href = $(this).attr('data-href');
			}
			var filetype = popup_content.substr(popup_content.lastIndexOf('.')).toLowerCase();
			var popup_caption = $(this).attr('data-title');
			var popup_alt = $(this).attr('data-alt');
			var popup_custom_width = $(this).attr('data-popup-width');
			var popup_custom_height = $(this).attr('data-popup-height');
			var popup_gallery = $(this).attr('data-gallery');
			var popup_fullscreen = $(this).hasClass('popup-fullscreen');
			var popup_fields = $(this).attr('data-fields');
			var popup_focus = $(this).attr('data-focus') || '#popup-anchor';
			
			// Detect video data if present
			if (filetype == '.mp4' || target_href.indexOf('youtube.com') >= 0 || target_href.indexOf('youtu.be') >= 0 || target_href.indexOf('cornell.edu/video') >= 0) { 
				// Video Content
				var videotype = false;
				var vid = 0;
				if (target_href.indexOf('youtube.com') >= 0 || target_href.indexOf('youtu.be') >= 0) {
					videotype = 'youtube';
					var url_process = target_href.replace(/\/$/,'').replace('watch?v=','').split('/');
					vid = url_process[url_process.length-1];
				}
				else if (target_href.indexOf('cornell.edu/video') >= 0) {
					videotype = 'cornellcast';
					var url_process = target_href.replace(/\/$/,'').replace('/embed','').split('/');
					vid = url_process[url_process.length-1];
				}
				else if (filetype == '.mp4') {
					videotype = 'html5';
					vid = target_href;
				}
				//console.log(videotype + ' --> ' + vid)
				if (videotype != false && vid != 0) {
					$(this).addClass('video').addClass(videotype).attr('data-video-id',vid);
				}
			}
		
			$(this).click(function(e) {
			
				e.preventDefault();
			
				return_focus = true;
				$('.popup-active').removeClass('popup-active');
				$(this).addClass('popup-active');
				popup_source = $(this);
				$('#popup').attr('aria-labelledby','popup-anchor');
				$('#popup, #popup-background').removeClass('image image-gallery');
				$('#popup-background .spinner').removeClass('off');
				$('#popup .video-container').remove();
			
				if (popup_content != '' && popup_content != undefined) {	
				
					// Apply fullscreen preference
					if (popup_fullscreen) {
						$('#popup').addClass('fullscreen');
					}
					else {
						$('#popup').removeClass('fullscreen');
					}
				
					// If not in gallery mode, reset size and position to accept new content
					if ( !gallery_running ) {
						$('#popup').removeClass('custom-width custom-height').removeAttr('style').empty();
					}
					
					// IMAGE (and VIDEO) Mode
					if ($(this).hasClass('video') || filetype == '.jpg' || filetype == '.jpeg' || filetype == '.gif' || filetype == '.png' || filetype == '.svg') {
						popup_type = 'image';
						//$('#popup').removeClass('fullscreen');
						$('#popup, #popup-background').addClass('image');
						if (popup_gallery) {
							$('#popup').addClass('image-gallery');
						}
						if (popup_fields) {
							$('#popup').attr('data-fields',popup_fields).addClass('fullscreen');
						}
						else {
							$('#popup').removeAttr('data-fields');
							if (!popup_fullscreen) {
								$('#popup').removeClass('fullscreen');
							}
						}
						
						// VIDEO Mode
						if ($(this).hasClass('video')) {
							var vid = $(this).attr('data-video-id');
							var videotype = false;
							if ($(this).hasClass('youtube')) {
								videotype = 'youtube';
							}
							else if ($(this).hasClass('cornellcast')) {
								videotype = 'cornellcast';
							}
							else if ($(this).hasClass('html5')) {
								videotype = 'html5';
							}
							var video_transition = 0;
							if ( $('#popup-wrapper:visible') ) {
								video_transition = popup_fadein_speed;
							}
							$('#popup-wrapper').fadeOut(video_transition, function() {
								var videoElement;
								$('#popup').addClass('video').html('<div class="content"><div class="relative popup-video"></div></div>');
							
								var slide = $('#popup .popup-video').first();
								
								$('#popup, #popup-background').removeClass('error swipe-left swipe-right custom-width custom-height');
								if (popup_caption) {
									$('#popup > .content').append('<p class="caption">'+popup_caption+'</p>')
								}
								if (videotype == 'youtube') {
									$(slide).prepend('<iframe class="video-container" width="560" height="315" src="https://www.youtube.com/embed/'+vid+'?rel=0&iv_load_policy=3&enablejsapi=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen title="YouTube video"></iframe>');
									$(slide).find('.video-container').on('load',function() {
										videoElement = $(this).contents().find('video');
									});
								}
								else if (videotype == 'cornellcast') {
									$(slide).prepend('<iframe class="video-container" src="//www.cornell.edu/video/'+vid+'/embed" width="560" height="315" frameborder="0" allowfullscreen title="CornellCast video"></iframe>');
									$(slide).find('.video-container').on('load',function() {
										videoElement = $(this).contents().find('video');
									});
								}
								else if (videotype == 'html5') {
									$(slide).prepend('<video class="video-container aria-target" width="560" height="315" controls="controls" preload="preload"><source type="video/mp4" src="'+vid+'"></video>');
									videoElement = $(slide).find('video');
									$(videoElement).click(function(e) {
										e.stopPropagation(); // propagation must be stopped to prevent a click from passing through to #popup-background (which closes the popup)
									});
								}
								popupControls();
								
								resizeDone();
								$('#popup-wrapper').fadeIn(popup_fadein_speed, function() {
									// If the popup is already visible (gallery mode), focus on the next video
									if (gallery_running) {
										$('#popup-anchor').focus();
									}
									else {
										//$(slide).find('.video-container').focus(); // disabled temporarily, pending video/iframe/accessibility R&D
										$('#popup-anchor').focus();
									}
									$('#popup-background .spinner').addClass('off');
									gallery_running = true;
									resizeDone();
								});
							});
							
						}
						// IMAGE Mode
						else {
							var img = new Image();
							img.onload = function() {
								$('#popup').removeClass('custom-width custom-height').removeAttr('style');
								$('#popup-wrapper').show(); // parent container must be visible for height calculations
						
								var this_width = img.width;
								if (popup_custom_width) {
									this_width = popup_custom_width;
								}
								$('#popup').removeClass('scroll').width(this_width).html('<div class="content"><div class="relative"><img id="popup-image" tabindex="-1" class="aria-target" width="'+img.width+'" height="'+img.height+'" src="'+popup_content+'" alt="'+popup_alt+'"></div></div>');
						
								if (popup_caption != '' && popup_caption != undefined) {
									$('#popup > .content').append('<p class="caption">'+popup_caption+'</p>');
								}
																		
								// Detect scaled images
								var scaled_height = img.height;
								if (img.width != $('#popup-image').width()) {
									scaled_height = parseInt(scaled_height * ($('#popup-image').width() / img.width));
								}
								$('#popup-image').css({
									'width': $('#popup-image').width()+'px',
									'height': scaled_height+'px'
								});
						
								$('#popup').click(function(e) {
									e.stopPropagation(); // propagation must be stopped to prevent a click from passing through to #popup-background (which closes the popup)
								});
						
								$('#popup-image').css({
									'width': 'auto',
									'height': 'auto'
								});
							
								$('#popup-wrapper').hide();
								popupControls();
							
								$('#popup-wrapper').addClass('calculating').removeClass('calculating-done').fadeIn({
									duration: 100, // popup_fadein_speed is circumvented, since it has been replaced with a smoother CSS solution
									complete: function() {
										if (gallery_running) {
											$('#popup-image').focus();
										}
										else {
											$('#popup-anchor').focus();
										}
										$('#popup-background .spinner').addClass('off');
										gallery_running = true;
										$(this).removeClass('calculating').addClass('calculating-done');
										resizeDone();
									}
								});
							}
							img.onerror = function() {
						
								// Oh no! Error loading image!
								$('#popup-wrapper').show();
								$('#popup').addClass('error').removeClass('scroll').width(300).html('<div class="content"><div class="relative clearfix"><div id="popup-panel" class="panel dialog no-border" role="alert"><h3 id="popup-error" class="aria-target" tabindex="-1">Error</h3><p><span class="fa fa-image fa-3x fa-pull-left fade" aria-hidden="true"></span> The requested image could not be loaded.</p></div></div></div>');
								$('#popup-background .spinner').addClass('off');
								popupControls();
								$('#popup-wrapper').hide().fadeIn(popup_fadein_speed, function() {
									$('#popup-error').focus();
								});
							
							}
							// If the popup is already visible (gallery mode), fade out before fading back in
							if ( $('#popup-wrapper:visible') ) {
								$('#popup-wrapper').fadeOut(popup_fadein_speed, function() {
									$('#popup, #popup-background').removeClass('error swipe-left swipe-right custom-width custom-height');
									img.src = popup_content;
									$('#popup').removeClass('video');
								});
							}
							else {
								img.src = popup_content;
								$('#popup').removeClass('video');
							}
						
						}
					
						$('#popup-background').show();
					
					}
					else {
						$('#popup').removeClass('custom-width custom-height video').removeAttr('style').empty();
						
						// DOM ELEMENT Mode
						if (popup_content.indexOf('#') == 0) {
							popup_type = 'id';
						
							$(popup_content).after('<div id="id-marker" />');
						
							// Store original display state
							if ($(popup_content+':visible').length > 0) {
								was_visible = true;
							}
							else {
								was_visible = false;
							}
						
							if (!popup_fullscreen) {
								var contain_height = popup_max_height;
								if ($(window).height()*popup_proportion < contain_height) {
									contain_height = $(window).height()*popup_proportion;
								}
							
								var this_width = parseInt($(window).width()*popup_proportion);
								var this_height = contain_height;
								if (popup_custom_width) {
									$('#popup').addClass('custom-width');
									this_width = popup_custom_width;
								}
								if (popup_custom_height) {
									$('#popup').addClass('custom-height');
									this_height = popup_custom_height;
								}
								$('#popup').addClass('scroll').css('max-width',popup_max_width+'px').outerWidth(this_width).outerHeight(this_height).removeClass('fullscreen');
							
							}
							$('#popup').click(function(e){e.stopPropagation()}).append($(popup_content).show());
							$('#popup-wrapper').fadeIn(popup_fadein_speed, function() {
								if ( $(popup_focus).first().length != 1 ) {
									popup_focus = '#popup-anchor'; // fallback to default if an invalid selector is supplied
								}
								$(popup_focus).first().focus();
							});
							$('#popup-background').show();
						
						}
						else {
							
							// IFRAME Mode
							popup_type = 'iframe';
												
							$('#popup').removeClass('scroll').html('<iframe src="' + popup_content + '" frameborder="0" scrolling="auto" />');
							$('#popup iframe').attr('src',$('#popup iframe').attr('src')); // clears IE iframe caching bug
						
							var this_width = parseInt($(window).width()*popup_proportion);
							var this_height = parseInt($(window).height()*popup_proportion);
							if (popup_custom_width) {
								$('#popup').addClass('custom-width');
								this_width = popup_custom_width;
							}
							if (popup_custom_height) {
								$('#popup').addClass('custom-height');
								this_height = popup_custom_height;
							}
							$('#popup').outerWidth(this_width).outerHeight(this_height);
						
							$('#popup-wrapper').fadeIn(popup_fadein_speed, function() {
								$('#popup-anchor').focus();
							});
							$('#popup-background').show();
						}
					
						popupControls(popup_content);
					}
					
					// Refresh positioning and scale on resize
					if (!popup_fullscreen) {
						$(window).on('resize.popup',function() {
							if (popup_resize_response > 0) {
								clearTimeout(resize_popup);
								resize_popup = setTimeout(resizeDone, popup_resize_response);
							}
							else {
								resizeDone();
							}
						});
					}
				}
			});
		});
		
		// update popup size and correct for oversized images
		function resizeDone() {
			if (popup_type == 'id') {
				var contain_height = popup_max_height;
				if ($(window).height()*popup_proportion < contain_height) {
					contain_height = $(window).height()*0.94;
				}
				if ( !$('#popup').hasClass('custom-width') ) {
					$('#popup').outerWidth(parseInt($(window).width()*popup_proportion));
				}
				if ( !$('#popup').hasClass('custom-height') ) {
					$('#popup').outerHeight(contain_height);
				}
			}
			else if (popup_type == 'image') {
				$('#popup-image').css('max-height','none');
				$('#popup').css('width','auto');
				
				if ( $('#popup').attr('data-fields') ) {
					$('#popup').find('.popup-fields').remove();
					$('#popup > .content').append('<div class="popup-fields">' + $('#'+$('#popup').attr('data-fields')).html() + '</div>' );
					
					if ( $('#popup').hasClass('video') && $('#'+$('#popup').attr('data-fields')).hasClass('dark') ) {
						$('#popup').find('.popup-fields').addClass('dark');
					}
				}
				
				if ($(window).width() > 767 && !$('#popup').hasClass('video') ) {
					/* Calculate and Resize to Accommodate Tall Images
						 -- Todo: This code works for most reasonable combinations of image dimensions, screen proportions and caption lengths, but could still use some work. Basing image size on height is always tricky in CSS (perhaps a flexbox-based layout would be more reliable?) 
						 -- Todo: Likewise, tall images with long captions may not fit on a mobile screen
					*/
					var available_image_height = $('#popup').height();
					if ($('#popup .caption').length > 0) {
						available_image_height -= $('#popup .caption').outerHeight();
					}
					if (available_image_height > 100) {
						if ($('#popup').height() > $(window).height()-20) {
							$('#popup-image').css('max-height',(available_image_height-20)+'px');
							$('#popup').width($('#popup-image').width()-20);
						}
						else {
							$('#popup').width($('#popup-image').width());
						}
						
					}
					else {
						setTimeout(function(){ resizeDone(); }, 500); // try again in 0.5 seconds (Safari image render bug workaround)
					}
				}
			}
			else if (popup_type == 'iframe') {
				if ( !$('#popup').hasClass('custom-width') ) {
					$('#popup').outerWidth(parseInt($(window).width()*popup_proportion));
				}
				if ( !$('#popup').hasClass('custom-height') ) {
					$('#popup').outerHeight(parseInt($(window).height()*popup_proportion));
				}
			}
		}
		
	}
	popups(); // process the page
	
	
	/* -----------------------------------------------------------------------------------------
		Generate Popup Controls
		-----------------------------------------------------------------------------------------
		- Controls are regenerated for each popup to support all use cases
		- Provides accessibility aids through titling and focus targets
		- All popups get a Close button, image galleries also get Next and Previous buttons (which can also be triggered by keyboard arrows)
	-------------------------------------------------------------------------------------------- */
	function popupControls(popup_content) {

		// The title of the popup (read by screen readers) is more verbose the first time it is triggered, providing a hint to use the Esc key shortcut
		var popup_window_message = 'Popup Window';
		if (first_popup) {
			popup_window_message = 'Popup Window (Press Escape to Exit)';
			first_popup = false;
		}
		// Image gallery popups are given a slightly different title, and also provide more verbose hints the first time
		if ($('#popup').hasClass('image-gallery')) {
			if (first_gallery) {
				popup_window_message = 'Popup Gallery (Press Escape to Exit, Press Left and Right Arrow Keys to Navigate)';
				first_gallery = false;
			}
			else {
				popup_window_message = 'Popup Gallery';
			}
		}
	
		// Add title and a Close button with all the necessary attributes for focus control
		$('#popup').prepend('<h2 id="popup-anchor" class="hidden" tabindex="-1">'+popup_window_message+'</h2><button id="popup-close" tabindex="0" aria-label="Close Button"></button>');
	
		// Add image gallery buttons if applicable (Next and Previous)
		if ($('#popup').hasClass('image-gallery')) {
			$('#popup > .relative, #popup > .content > .relative').first().append('<div class="gallery-nav"><div class="next-prev"><button class="prev"><span class="hidden">Previous Item</span></button><button class="next"><span class="hidden">Next Item</span></button></div></div>');
		
			// The calculations below determine which image in a gallery set is active and active the next or previous one
			// (associated keycode events are defined in the popups() function above)
			$('#popup .next-prev button').click(function(e) {
				e.preventDefault();
				e.stopPropagation();
				var gallery_id = $('.popup-active').attr('data-gallery');
				var gallery_length = $('.popup[data-gallery='+gallery_id+']').length;
				var gallery_current_image = $('.popup-active').index('.popup[data-gallery='+gallery_id+']');
				$('#popup-background').focus();
				if ($(this).hasClass('prev')) { // left button
					var next_image = gallery_current_image - 1;
					if (next_image < 0) {
						next_image = gallery_length - 1;
					}
					$('.popup[data-gallery='+gallery_id+']').eq(next_image).trigger('click');
				}
				else { // right button
					var next_image = gallery_current_image + 1;
					if (next_image > gallery_length-1) {
						next_image = 0;
					}
					$('.popup[data-gallery='+gallery_id+']').eq(next_image).trigger('click');
				}
			});
		}
	
		// Close button event
		$('#popup-close').click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(window).unbind('resize.popup');
			$('#popup-wrapper, #popup-background').hide();
			if (popup_type == 'id') { // return page element to its native DOM position
				$('#id-marker').after( $(popup_content) );
				$('#id-marker').remove();
				if (!was_visible) {
					$(popup_content).hide();
				}
			}
			if (return_focus) {
				$(popup_source).focus(); // return focus to the original source of the popup
			}
			$('.popup-active').removeClass('popup-active');
			$('#popup').removeClass('image image-gallery error swipe-left swipe-right').removeAttr('aria-labelledby');
			gallery_running = false;
			return_focus = true;
			$('#popup .video-container').remove();
		});
	}

// End jQuery(document).ready
});
