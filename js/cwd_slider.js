/* CWD Image Slider (ama39, last update: 3/20/24)
   - ...
   - >> TODO: more introduction and documentation will be added here soon (in the meantime, please see the "Scripted Components" documentation for more information) <<
   - preloads images and creates "buffer" layers to allow cover placement and ensure smooth transitions
   - supports unlimited simultaneous sliders
   - ...
   - 2017 Accessibility Update:
   - -- Caption system rewritten to use persistant containers for each slide (instead of updating the content in a single container).
   - -- Caption transitions are now handled entirely by CSS and using opacity and z-index (so captions are always present in the DOM for screen readers and keyboard users).
   - -- Keyboard or screen reader focus on a caption will now override the slider UI and immediately activate the matching slide (allowing users to smoothly tab through each slide).
   - -- In light of these caption changes, slide nav is now hidden via ARIA since it becomes redundant for screen readers (normal keyboard navigation can still access it).
   - -- Better handling of slides with no titles/captions and/or no links.
   - -- Added an alt text field to the data structure, which is rendered for screen readers and keyboard users when no title and no caption are present.
   - -- If no alt text is available, empty slide captions are labeled sequentially for screen readers and keyboard users when tabbing to an empty slide caption (e.g., "Slide 3").
   - -- Indicator clicks or caption focus during a slide transition will now queue the request to take place as soon as the current transition completes (Next and Previous buttons are unaffected).
   - -- If a slide has no title, no caption, and no alt text, but does have a link, a clickable icon will be displayed for visual users. (However, this is a content entry error! All links should have descriptive text. To screen readers, it will only announce the link as, e.g., "Slide 3".)
   ------------------------------------------------------------------------- */

// Default Settings
var default_div = '#site-header'; // default background container
var default_caption_div = '#site-headline'; // default caption container
var default_heading2 = ''; // default second heading container (unused by default) *Target a heading tag (not a div) with a inner span. e.g., "#slider-extra-headline" to target <h1 id="slider-extra-headline"><span>Placeholder Heading Text</span></h1>
var default_slide_time = 8; // time between transitions (in seconds)
var default_transition_speed = 1; // speed of image cross-fade (in seconds) *Note: This only affects image transitions. Caption transition timing is controlled by CSS [cwd_slider.css]
var default_quickslide = true; // transition more quickly between slides on initial load, and when manually-requested by user click/focus)
var default_autoplay = true; // if true, the slider will cycle through images on load (but will stop after user interaction)
var default_random_start = true; // if true, the slider will start on a random slide (instead of always starting at 1)
var default_caption_height = '8em'; // must be enough height to accommodate the tallest caption text (only for top-aligned captions) (NYI)
var default_image_path = ''; // path to images (if not using absolute paths)
var default_bg_color = '#363f47'; // basic fill color behind images (may be visible briefly during page load)

// Global Variables
var slider_count = 0;
var captionless = true; // switched to false when visible captions are detected on any slide (applies a body class for adjusting the design)
var keyboard_nav = true; // used to track and distinguish between mouse clicks and keyboard or screen reader navigation

// Navigation Options
var align = 'left'; // alignment: 'left' or 'right' (NYI)
var valign = 'top'; // vertical caption alignment: 'top' or 'bottom' (NYI)
var no_numbers = true; // disable numbers on slide buttons
var nextprev = true; // provide Next and Previous buttons



/* -----------------------------------------------------------------------------------------
   Initialize Slider
   -----------------------------------------------------------------------------------------
   - Generates and renders a slider with navigation and desired settings
   - All arguments are described above in "default settings"
   - Arguments are optional (they override the default settings) though 'div' and 'caption' will typically be included 
-------------------------------------------------------------------------------------------- */
function cwd_slider(div,caption,time,speed,auto,random,height,path,bg,heading2,quickslide) {
	
	// instanced variables
	slider_count++;
	var sid = 's' + slider_count; // unique identifier prefix (e.g., 's1') - prepended to various IDs ("s1-slide-image1", "s1-slide-caption1", etc...)
	var image_array = window['image_array' + slider_count];
	var current_slide = 0;
	var slide_count = 0;
	var starting_slide = 0;
	var autoplaying = false;
	var slide_interval;
	var is_transitioning = false;
	var queued_request = false;
	var photo_credit_mode = false;
	
	jQuery(document).ready(function($) {
		
		// apply arguments or use defaults
		var image_div = div || default_div;
		var caption_div = caption || default_caption_div;
		var heading2_h = heading2 || default_heading2;
		var slide_time = time || default_slide_time;
		var transition_speed = speed || default_transition_speed;
		var caption_height = height || default_caption_height;
		var image_path = path || default_image_path;
		var bg_color = bg || default_bg_color;
		if (auto == true || auto == false) { var autoplay = auto; } else { var autoplay = default_autoplay; }
		if (random == true || random == false) { var random_start = random; } else { var random_start = default_random_start; }
		if (quickslide == true || quickslide == false) { var quickslide_on = quickslide; } else { var quickslide_on = default_quickslide; }
				
		// additional variables
		//$(caption_div).attr('tabindex','-1').addClass('aria-target'); // set focus target for accessibility
		var caption_div_inner = caption_div + ' .caption-inner';
		slide_count = image_array.length || 0;
	
		// lock the height
		//if (valign == 'top') {
		//	$(caption_div).css('height',caption_height);
		//}
		
		// setup
		$(image_div).addClass('slider');
		$(image_div).css('background',bg_color); // background color
		$(caption_div).find('.caption-inner').remove(); // remove static caption if present
		if ($(caption_div).hasClass('photo-credits')) {
			photo_credit_mode = true; // restyles the caption into an icon with tooltip for simple photo credits instead of headlines
		}
	
		// build image set and preload
		for (i=0;i<slide_count;i++) {
			
			// set up image and image data
			$(image_div).append('<div class="slide-buffer" id="'+sid+'-slide-buffer'+i+'"></div>');
			// slide data
			$('#'+sid+'-slide-buffer'+i).data('loaded',false); // <- load status
			$('#'+sid+'-slide-buffer'+i).data('heading',image_array[i][1]); // <- heading
			$('#'+sid+'-slide-buffer'+i).data('caption',image_array[i][2]); // <- caption
			$('#'+sid+'-slide-buffer'+i).data('link',image_array[i][3]); // <- link
			$('#'+sid+'-slide-buffer'+i).data('alt',image_array[i][4]); // <- alt text
			$('#'+sid+'-slide-buffer'+i).data('heading2',image_array[i][5]); // <- second heading
			$('#'+sid+'-slide-buffer'+i).data('cta1',image_array[i][6]); // <- action button 1 label // @CTA
			$('#'+sid+'-slide-buffer'+i).data('cta1_link',image_array[i][7]); // <- action button 1 href // @CTA
			$('#'+sid+'-slide-buffer'+i).data('cta2',image_array[i][8]); // <- action button 2 label // @CTA
			$('#'+sid+'-slide-buffer'+i).data('cta2_link',image_array[i][9]); // <- action button 2 href // @CTA
			// load image
			$('#'+sid+'-slide-buffer'+i).css('background-image','url('+image_array[i][0]+')');
			
			// set up caption container
			$(caption_div).append('<div class="caption-inner caption'+i+'"></div>');
			if ( $('#'+sid+'-slide-buffer'+i).data('link') != '' ) {
				$(caption_div_inner + '.caption'+i).append('<a class="caption-focus"></a>');
				$(caption_div_inner + '.caption'+i+' a').attr('href',$('#'+sid+'-slide-buffer'+i).data('link'));
			}
			else {
				$(caption_div_inner + '.caption'+i).append('<div class="caption-focus" tabIndex="0"></div>');
			}
			
			// add titles and/or captions
			if ( $('#'+sid+'-slide-buffer'+i).data('heading') != '' ) {
				$(caption_div_inner + '.caption'+i+' .caption-focus').append('<h2><span>'+$('#'+sid+'-slide-buffer'+i).data('heading')+'</span></h2>');
			}
			if ( $('#'+sid+'-slide-buffer'+i).data('caption') != '' ) {
				$(caption_div_inner + '.caption'+i+' .caption-focus').append('<p><span>'+$('#'+sid+'-slide-buffer'+i).data('caption')+'</span></p>');
			}
			
			// add action buttons // @CTA
			if ( (($('#'+sid+'-slide-buffer'+i).data('cta1') != undefined && $('#'+sid+'-slide-buffer'+i).data('cta1_link') != undefined) || ($('#'+sid+'-slide-buffer'+i).data('cta2') != undefined && $('#'+sid+'-slide-buffer'+i).data('cta2_link') != undefined)) && $('#'+sid+'-slide-buffer'+i).data('link') == '') {
				$(caption_div_inner + '.caption'+i+' .caption-focus').append('<div class="flex cta-buttons">');
				
				if ( $('#'+sid+'-slide-buffer'+i).data('cta1') != undefined && $('#'+sid+'-slide-buffer'+i).data('cta1_link') != undefined) {
					$(caption_div_inner + '.caption'+i+' .caption-focus .cta-buttons').append('<div><a class="link-button space-right" href="'+$('#'+sid+'-slide-buffer'+i).data('cta1_link')+'">'+$('#'+sid+'-slide-buffer'+i).data('cta1')+'</a></div>');
				}
				if ( $('#'+sid+'-slide-buffer'+i).data('cta2') != undefined && $('#'+sid+'-slide-buffer'+i).data('cta2_link') != undefined) {
					$(caption_div_inner + '.caption'+i+' .caption-focus .cta-buttons').append('<div><a class="link-button space-right" href="'+$('#'+sid+'-slide-buffer'+i).data('cta2_link')+'">'+$('#'+sid+'-slide-buffer'+i).data('cta2')+'</a></div>');
				}
				
				$(caption_div_inner + '.caption'+i+' .caption-focus').append('</div>');
			}
			
			// detect visible captions
			if (image_array[i][1].length > 0 || image_array[i][2].length > 0) {
				captionless = false;
			}
			else {
				// detect empty captions and supply alt text if available
				$(caption_div_inner + '.caption'+i).addClass('empty');
				if ( $('#'+sid+'-slide-buffer'+i).data('alt') != '' ) {
					$(caption_div_inner + '.caption'+i+' .caption-focus').append('<p class="sr-only"><span>'+$('#'+sid+'-slide-buffer'+i).data('alt')+'</span></p>');
				}
				else {
					// captions are empty and no alt text was supplied :-( but we'll at least add a caption let the user know what slide they're on (benefits keyboard users too)
					$(caption_div_inner + '.caption'+i+' .caption-focus').append('<p class="sr-only"><span>Slide '+(i+1)+'</span></p>');
				}
			}
			
			// photo credit mode
			if (photo_credit_mode) {
				$(caption_div_inner + '.caption'+i).find('.caption-focus').wrapInner('<div class="photo-credit-text off"></div>');
				$(caption_div_inner + '.caption'+i).find('.caption-focus').append('<span class="photo-credit-icon zmdi zmdi-camera" aria-hidden="true"><span class="sr-only">Show Photo Credit</span></span>');
				$(caption_div_inner + '.caption'+i).find('.photo-credit-icon').hover(function() {
					$(this).prev('.photo-credit-text').removeClass('off');
				}, function() {
					$(this).prev('.photo-credit-text').addClass('off');
				});
			}
			
		}
		if (captionless) {
			$('body').addClass('slider-no-caption');
		}

		// activate first slide and start slider
		if (random_start == true) { // random start
			starting_slide = Math.floor(Math.random() * slide_count);
			if (starting_slide > slide_count) {
				starting_slide = slide_count;
			}
			current_slide = starting_slide;
		}
		$(caption_div_inner + '.caption'+starting_slide).addClass('active').trigger('newSlideActive');
		changeSlide(starting_slide,false);
		if (slide_count > 1) {
			startSlider();
		}
		
		/* Start the slider and run autoplay timer (if autoplay is enabled)
		---------------------------------------------------------------------- */
		function startSlider() {
			// set up autoplay interval
			if (autoplay == true) {
				slide_interval = setInterval(slideTimer,(slide_time*1000));
			}
			buildNav();
		}
		
		/* Interval function executed by autoplay timer
		---------------------------------------------------------------------- */
		function slideTimer() {
			// find next slide
			var next_slide = current_slide + 1;
			if (next_slide >= slide_count) {
				next_slide = 0;
			}
			// activate next slide
			changeSlide(next_slide,true);
		}

		/* Generate a button for each slide plus "Next" and "Previous"
		---------------------------------------------------------------------- */
		function buildNav() {
			var numbers = ' numbers';
			if (no_numbers) {
				numbers = ' no-numbers';
			}
			var nextprev_html = '';
			if (nextprev && slide_count > 1) {
				nextprev_html = '<div class="next-prev"><a role="button" class="prev" href="#"><span class="sr-only">Previous Slide</span><span class="fa fa-angle-left"></span></a><a role="button" class="next" href="#"><span class="sr-only">Next Slide</span><span class="fa fa-angle-right"></span></a></div>';
			}
			
			$(caption_div_inner).last().after('<div class="campaign-nav '+align+numbers+'" aria-hidden="false"><h3 class="sr-only">View Another Slide</h3>'+nextprev_html+'<ul class="list-menu sans"></ul></div>');
			$(image_div + ' .slide-buffer').each(function(i){
				$(caption_div + ' ul').append('<li><a role="button" href="#"><span class="dot"><span class="num">'+(i+1)+'</span></span><span class="sr-only">. '+$(this).data('heading')+'</span></a></li>');
			});
			$(caption_div + ' ul').children('li').eq(current_slide).children('a').addClass('active');
			
			$(caption_div + ' ul').find('a').each(function(i){
				$(this).mouseenter(function(e){
					keyboard_nav = false;
				}).mouseleave(function(e){
					keyboard_nav = true;
				}).click(function(e){
					e.preventDefault();
					clearInterval(slide_interval);
					if (!is_transitioning) {			
						if (i != current_slide) {
							changeSlide(i,false);
						}
						if (keyboard_nav) {
							$(caption_div).find('.caption-focus').eq(i).focus();
						}
					}
					else if ($.isNumeric(queued_request) == false && i != current_slide) {
						queued_request = i;
					}
				});
			});
			
			// next and previous buttons				
			$(caption_div + ' .next-prev a').click(function(e){
				e.preventDefault();
				clearInterval(slide_interval);
				if (!is_transitioning) {
					if ( $(this).hasClass('next') ) {
						current_slide++;
						if (current_slide >= slide_count) {
							current_slide = 0;
						}
					}
					else {
						current_slide--;
						if (current_slide < 0) {
							current_slide = slide_count-1;
						}
					}
					changeSlide(current_slide,false);
				}
			});
			
			$(caption_div + ' a[role="button"').keydown(function(e) {
				if (e.keyCode == 13 || e.keyCode == 32) { // enter or space key
					e.preventDefault();
				}
			}).keyup(function(e) {
				if (e.keyCode == 13 || e.keyCode == 32) { // triggers on key up
					$(this).trigger('click');
				}
			});
			
			$(image_div + ' a, ' + image_div + ' .caption-focus').focus(function() { // end autoplay when any UI element receives focus
				clearInterval(slide_interval);
			});
			$(caption_div).find('.caption-inner .caption-focus, .caption-inner a').focus(function() { // activate appropriate slide when any caption receives focus // @CTA
				var target = $(this).closest('.caption-inner').index(); // @CTA
				if (target != current_slide) {
					if (!is_transitioning) {
						changeSlide(target,false);
					}
					else if ($.isNumeric(queued_request) == false) {
						queued_request = target;
					}
				}
			});

		}

		/* Change slide (with transition during autoplay or instant when clicked)
		---------------------------------------------------------------------- */
		function changeSlide(slide,include_transition) {
						
			/* LEGACY CODE: these variables are no longer used. Caption transition timing is now controlled by CSS [cwd_slider.css]. */
			/* ---------------------------------------------------------------------------------------------------------
			var c_speed = transition_speed * 1000; // convert transition to milliseconds
			var c_quickspeed = transition_speed * 200; // calculate "quick" transition speed (for captions)
			
			// quick transition when requested by button click
			if (include_transition == 'image-only' || !include_transition) {
				c_speed = 300;
				c_quickspeed = 80;
			}
			 ----------------------------------------------------------------- */
			
			
			var c_speed = transition_speed * 1000; // convert transition to milliseconds
			
			// quick image transition when requested by button click or caption focus
			if (!include_transition && quickslide_on) {
				c_speed = 300;
				$(caption_div).addClass('quick');
				if ( heading2_h != '' ) {
					$(heading2_h + ' span').addClass('quick');
				}
			}
			
			current_slide = slide;
			
			// update navigation
			$(caption_div + ' ul a').removeClass('active');
			$(caption_div + ' ul').children('li').eq(slide).children('a').addClass('active');
			
			// update "heading2" if it's in use
			if ( heading2_h != '' ) {
				$(heading2_h + ' span').addClass('extra-heading-animate').text($('#'+sid+'-slide-buffer'+slide).data('heading2'));
			}
			
			/* LEGACY CODE: Caption transition and timing is now controlled by CSS [cwd_slider.css]. */
			/* ------------------------------------------------------------------------------------------
			// transition and update caption data
			if (include_transition == 'image-only') {
				$(caption_div_inner).removeClass('active');
				$(caption_div_inner + '.caption'+slide).addClass('active');
			}
			else {
				$(caption_div_inner + '.active').fadeOut(c_quickspeed,function() {
					$(this).removeClass('active');
					$(caption_div_inner + '.caption'+slide).hide().addClass('active').delay(c_quickspeed*2).fadeIn(c_quickspeed,function() {
						//$(this).find('a').first().focus();
						$(caption_div_inner).removeAttr('style');
					});
				});
			}
			 ----------------------------------------------------------------- */
			
			// transition caption
			$(caption_div_inner).removeClass('active');
			$(caption_div_inner + '.caption'+slide).addClass('active').trigger('newSlideActive');
			
			// transition image
			is_transitioning = true;
			$('#'+sid+'-slide-buffer'+slide).hide().addClass('incoming-slide').fadeIn(c_speed, function() {
				$(image_div + ' .current-slide').removeClass('current-slide');
				$(this).addClass('current-slide').removeClass('incoming-slide');
				if ($.isNumeric(queued_request) == true) {
					changeSlide(queued_request,false);
				}
				if ( heading2_h != '' ) {
					$(heading2_h + ' span').removeClass('extra-heading-animate quick');
				}
				is_transitioning = queued_request = false;
			});
			
			$(caption_div).removeClass('quick');
		}
	
	
	// End jQuery(document).ready
	});
}	





