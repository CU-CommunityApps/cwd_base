/* CWD Utilities (ama39, last update: 1/30/20)
   - 1. Main Navigation (script support for dropdown menus and mobile)
   - 2. Empty Sidebar Helper (clears whitespace from empty sidebar regions to allow use of the :empty pseudo class in CSS)
   - 3. Mobile Table Helper (allows tables or other block elements to scroll horizontally on small devices, apply via .mobile-scroll class)
   - 4. Expander (turns heading + div pairs into an expand/collapse system with nesting based on heading level)
   - 5. Mobile Expander (similar to the standard expander, but intended to create single heading + div pairs that are only active at sub-tablet sizes (used, for example, by section navigation))
   - 6. Read More Expander (shortens a block of text to an excerpt (if above a certain character count), and appends a "read more/close" toggle to reveal the rest, apply via .readmore-expander class)
   - 7. Content Tabs (turns an ordered or unordered list into a set of slides with tabbed navigation) -- e.g., <ul class="content-tabs">
   - 8. Photo Credit/Information (div.photo-credit is turned into a small camera icon, revealing details on hover (or via keyboard/screen reader focus)
   ------------------------------------------------------------------------- */

var mobile_breakpoint = 991; // viewport pixel width at which mobile nav appears (should match the media query in the project's css)
var mobile_expander_breakpoint = 767; // viewport pixel width at which mobile expanders appear (e.g., section nav)
if (!Date.now){Date.now = function now(){return new Date().getTime();};} // legacy Date method shim
var msie = document.documentMode;

(function ($, root, undefined) { $(function () { 'use strict';


	// Window Size Tracking
	function resizeChecks() {

		// Mobile Nav
		if ($(window).width() <= mobile_breakpoint) {
			$('body').addClass('mobile'); // mobile nav breakpoint
		}
		else {
			$('body').removeClass('mobile');
			$('#main-navigation li.parent').removeClass('open');
			$('#main-navigation, #mobile-nav-dimmer').removeAttr('style');
		}
		// Mobile Expanders
		if ($(window).width() > mobile_expander_breakpoint) {
			$('.mobile-expander-heading').each(function() {
				if ( !$(this).hasClass('unit-nav') ) {
					$(this).removeClass('open');
				}
				else if ( $(window).width() > mobile_breakpoint ) {
					$(this).removeClass('open');
					$('.dropdown-menu .open').removeClass('open');
				}
			})
		}
	}
	$(window).resize(resizeChecks);
	resizeChecks();




	// 1. Main Navigation -----------------------------------------------------

	var mousedown = false; // extra control variable for precise click and focus event interaction

	// Utility Navigation (appended for mobile)
	if ($('#utility-navigation li').length > 0) {
		if ($('#main-navigation').length > 0) {
			$('#main-navigation ul').first().append('<li class="parent mobile-nav-only"><a class="more-links-button" href="#">More...</a><ul class="list-menu links vertical children more-links"></ul>');
			$('#utility-navigation li').each(function() {
				$('#main-navigation .more-links').append($(this).clone().addClass('mobile-nav-only'));
			});
			$('.more-links-button').click(function(e) {
				e.preventDefault();
			}).mousedown(function(e) {
				mousedown = true;
				$(this).find('.fa').trigger('mousedown');
			});
		}
		else {
			$('#site-header').append('<nav class="mobile-nav-only" id="main-navigation" aria-label="Main Navigation"><div class="container-fluid"><a id="mobile-home" href="/"><span class="sr-only">Home</span></a><ul class="list-menu links"></ul></div></nav>')
			$('#utility-navigation li').each(function() {
				$('#main-navigation .list-menu').append($(this).clone().addClass('mobile-nav-only'));
			});
		}
	}

	// Dropdown Menus
	$('li.menu-item-has-children').addClass('parent'); // WordPress Support
	$('li.menu-item--expanded').addClass('parent'); // Drupal 8 Support
	$('.dropdown-menu li.parent').parent().removeClass('menu').addClass('links list-menu');
	$('.dropdown-menu li.parent > a').wrapInner('<span></span>').append('<span class="fa fa-caret-down"></span>'); // wrap text in a span and add dropdown caret icons
	$('.dropdown-menu li.parent li.parent > a .fa').removeClass('fa-caret-down').addClass('fa-caret-right'); // change sub-dropdown caret icons
	$('.dropdown-menu li.parent > ul').each(function() {
		$(this).removeClass('menu').addClass('list-menu links vertical children');
		if ( !$('body').hasClass('mobile') ) {
			$(this).css('min-width',$(this).parent('li').width()+'px' ); // smart min-width to prevent dropdown from being narrower than its parent
		}
	});
	$('.dropdown-menu li.parent li.parent > ul').removeAttr('style'); // reset min-width to allow smaller submenus
	$('.dropdown-menu li.parent').hover(function() {
		if ( !$('body').hasClass('mobile') ) {
			// horizontal edge-detection
			var submenu_offset = $(this).children('ul').offset();
			if ( submenu_offset.left + $(this).children('ul').width() > $(window).width() ) {
				$(this).children('ul').addClass('flip');
			}
		}
	}, function() {
		if ( !$('body').hasClass('mobile') ) {
			$(this).children('ul').removeClass('flip');
		}
	});
	$('.dropdown-menu li.parent a').focus(function() {
		if ( !$('body').hasClass('mobile') ) {
			// horizontal edge-detection
			var submenu_offset = $(this).closest('.parent').children('ul').offset();
			if ( submenu_offset.left + $(this).closest('.parent').children('ul').width() > $(window).width() ) {
				$(this).closest('.parent').children('ul').addClass('flip');
			}
		}
		if (!mousedown) {
			$(this).parents('.parent').addClass('open');
			$(this).closest('.mobile-expander').children('.mobile-expander-heading').addClass('open');
		}
		mousedown = false;
	}).blur(function() {
		if ( !$('body').hasClass('mobile') ) {
			$(this).parents('.parent').removeClass('open');
			$(this).closest('.mobile-expander').children('.mobile-expander-heading').removeClass('open');
		}
	});

	// Mobile Navigation
	$('.dropdown-menu li.parent > a .fa').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
	}).mousedown(function(e) {
		e.stopPropagation();
		mousedown = true;
		if ( $('body').hasClass('mobile') ) {
			$(this).closest('.parent').toggleClass('open');
		}
	});
	var main_nav_focus_target = $('#mobile-home');
	$('#mobile-nav').click(function(e) {
		e.preventDefault();
		$('.dropdown-menu li.parent').removeClass('open');
		$('#main-navigation, #mobile-nav-dimmer').fadeIn(100,function() {
			$(main_nav_focus_target).focus();
		});
	});
	$('#mobile-home').after('<a id="mobile-close" href="#"><span class="sr-only">Close Menu</span></a>');
	$('#mobile-close').click(function(e) {
		e.preventDefault();
		$('#main-navigation, #mobile-nav-dimmer').fadeOut(100,function() {
			$('#main-navigation li.parent').removeClass('open');
			$('#mobile-nav').focus();
		});
	});
	$('#main-navigation').before('<div id="mobile-nav-dimmer"></div>');
	$('#mobile-nav-dimmer').click(function(e) {
		$('#mobile-close').trigger('click');
	});
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // escape key
			if ( $('#mobile-nav-dimmer:visible').length > 0 ) {
				$('#mobile-close').trigger('click');
			}
		}
	})
	
	
	// 2. Empty Sidebar Helper ------------------------------------------------
	$('.secondary').each(function() {
		if (msie != 8 && msie != 7) {
			if ( !$(this).html().trim() ) {
				$(this).empty().addClass('empty');
			}
		}
	});
	
	
	// 3. Mobile Table Helper -------------------------------------------------
	$('.mobile-scroll').each(function() {
			$(this).wrap('<div class="table-scroller" />');
			if ( $(this).hasClass('large') ) {
				$(this).parent().addClass('large');
			}
	});
	$('.table-scroller').append('<div class="table-fader" />').bind('scroll touchmove', function() {
		$(this).find('.table-fader').remove(); // hide fader DIV on user interaction
	});
	
	
	// 4. Expander ------------------------------------------------------------
	$('.expander').addClass('scripted').find('h2, h3, h4, h5, h6').each(function(i) {
		if ($(this).next('div').length > 0) {
			//$(this).next('div').addClass('expander-div aria-target').attr('tabindex','0');
			$(this).addClass('sans expander-heading').attr('tabindex','0').attr('aria-expanded','false').prepend('<span class="fa fa-plus-square-o" aria-hidden="true"></span>');
			$(this).click(function(e) {
				$(this).toggleClass('open');
				if ($(this).hasClass('open')) {
					$(this).attr('aria-expanded','true');
				}
				else {
					$(this).attr('aria-expanded','false');
				}
			});
		}
	});
	$('.expander').each(function() {
		if ($(this).find('.expander-heading').length > 2) {
			var all_expanded = false;
			$(this).prepend('<button class="expand-all">Expand all</button>');
			$(this).children('.expand-all').click(function(e) {
				e.preventDefault();
				if (!all_expanded) {
					$(this).parent().find('.expander-heading').addClass('open');
					$(this).addClass('open');
					all_expanded = true;
					$(this).text('Close all');
				}
				else {
					$(this).parent().find('.expander-heading').removeClass('open');
					$(this).removeClass('open');
					all_expanded = false;
					$(this).text('Expand all');
				}
			});
		}
	});
	$('.expander-heading').each(function() {
		
		/*
		var this_heading = $(this);
		$(this).next('div').focus(function() {
			$(this_heading).addClass('open');
		});
		$(this).next('div').find('*').focus(function() {
			$(this_heading).addClass('open');
		});
		*/
		
		$(this).keydown(function(e) {
			if (e.keyCode == 13 || e.keyCode == 32) { // enter or space key
				e.preventDefault();
				$(this).trigger('click');
			}
		});
	});
	
	// 5. Mobile Expander -----------------------------------------------------
	//$('.drupal #sidebar-top nav, nav.nav-body').addClass('mobile-expander').prepend('<h1 class="sans nav-heading">In this section<span class="punc">:</span></h1>');
	//$('.drupal.page-search-site #sidebar-top nav .nav-heading').addClass('hidden').html('Filter results<span class="punc">:</span>');
	$('.mobile-expander').each(function() {
		if ( $(this).prev('.menu-block-title').length > 0 ) {
			$(this).prev('.menu-block-title').before('<a href="#" aria-hidden="true" class="mobile-expander-heading mobile-only"><span class="zmdi zmdi-menu"></span>More in this Section</a>');
			var expand_header = $(this).prevAll('.mobile-expander-heading').first();
			$(expand_header).nextAll('.menu-block-title, .mobile-expander').wrapAll('<div class="mobile" />');
		}
		else {
			$(this).prepend('<a href="#" aria-hidden="true" class="mobile-expander-heading mobile-only"><span class="zmdi zmdi-menu"></span>More in this Section</a>');
			var expand_header = $(this).children('.mobile-expander-heading').first();
			$(expand_header).nextAll().wrapAll('<div class="mobile" />');
		}
		
		$(expand_header).click(function(e) {
			e.preventDefault();
			if ($(window).width() <= mobile_expander_breakpoint) {
				$(this).toggleClass('open');
			}
		});
		$(expand_header).next('.mobile').find('a').focus(function() {
			$(this).parents('.mobile').prev('.mobile-expander-heading').addClass('open');
		}); // TODO: focus and mouse event reconciliation for full keyboard support

		// hide empty menus
		if ( $(this).is('nav') ) {
			var has_items = false;
			var min_items = 1;
			if ( $(this).prev('.menu-block-title').length > 0 ) {
				min_items = 0
			}
			if ( $(this).find('li:visible').length > min_items) {
				has_items = true;
			}
			if (!has_items) {
				$(this).remove();
			}
		}
	});

	// clone the breadcrumb and prepend to the mobile section nav
	$('#sidebar-top .secondary-navigation').first().parents('.mobile').first().prepend( $('.breadcrumb').first().addClass('no-mobile').clone().removeClass('no-mobile').addClass('mobile-only') );
	$('.breadcrumb.mobile-only').removeAttr('aria-labelledby').attr('aria-label','Mobile Breadcrumb').find('#system-breadcrumb').remove();

	// Activate Mobile Expander for Unit Navigation at 959 instead of 767
	//$('#unit-navigation .mobile-expander-heading').addClass('unit-nav').off('click').click(function(e) {
		//e.preventDefault();
		//if ($(window).width() <= mobile_breakpoint) {
			//$(this).toggleClass('open');
		//}
	//});

	// 6. Read More Expander --------------------------------------------------
	var excerpt_length = 310;
	var button_label_expand = 'Read More';
	var button_label_collapse = 'Close';
	$('.readmore-expander').each(function() {
		var excerpt = $.trim($(this).text());
		var class_transfer = $(this).attr('class');
		if (excerpt.length > excerpt_length) {
			excerpt = excerpt.substring(0, excerpt_length).split(' ').slice(0, -1).join(' ');
			if (excerpt_length > 0) {
				excerpt += '...';
			}
			$(this).addClass('scripted').attr('tabindex','0').after('<div aria-hidden="true" class="readmore-excerpt-container"><p class="excerpt"><span class="excerpt-preview">'+excerpt+' </span><button aria-hidden="true" tabindex="0" class="readmore-expander-button"><span class="zmdi zmdi-plus-square"></span><span class="button-label">'+button_label_expand+'</span></button></p></div>');
			$(this).next('.readmore-excerpt-container').attr('class',class_transfer).addClass('readmore-excerpt-container').removeClass('readmore-expander');
		}
	});
	$('.readmore-expander-button').click(function(e) {
		e.preventDefault();
		$(this).toggleClass('open').parents('.readmore-excerpt-container').first().toggleClass('open').prev('.readmore-expander').toggleClass('open');
		if ($(this).hasClass('open')) {
			$(this).find('.zmdi').removeClass('zmdi-plus-square').addClass('zmdi-minus-square');
			$(this).find('.button-label').text(button_label_collapse);
		}
		else {
			$(this).find('.zmdi').removeClass('zmdi-minus-square').addClass('zmdi-plus-square');
			$(this).find('.button-label').text(button_label_expand);
		}
	});
	$('.readmore-expander').focus(function() {
		if (!$(this).hasClass('open')) {
			$(this).next('.readmore-excerpt-container').find('.readmore-expander-button').trigger('click');
		}
	});
	$('.readmore-expander a').focus(function() {
		if (!$(this).parents('.readmore-expander').first().hasClass('open')) {
			$(this).parents('.readmore-expander').first().next('.readmore-excerpt-container').find('.readmore-expander-button').trigger('click');
		}
	});
	
	
	// 7. Content Tabs --------------------------------------------------------
	$('.content-tabs').each(function() {
		
		var aria_mode = false;
		var nav_tag = 'nav';
		var tab_tag = 'a';
		
		// prepare class options to share with tab navigation 
		var tab_classes = 'tabs-nav';
		if ( $(this).hasClass('tabs-classic') ) {
			tab_classes += ' tabs-classic';
		}
		if ( $(this).hasClass('tabs-mobile-expand') ) {
			tab_classes += ' tabs-mobile-expand';
		}
		
		if ( $(this).hasClass('tabs-numbered') ) {
			tab_classes += ' tabs-numbered';
		}
		if ( $(this).hasClass('tabs-numbers-only') ) {
			tab_classes += ' tabs-numbers-only';
		}
		if ( $(this).hasClass('tabs-aria') ) {
			tab_classes += ' tabs-aria';
			aria_mode = true;
			nav_tag = 'div';
			tab_tag = 'button';
		}
		if ( $(this).hasClass('tabs-mobile-accordion') ) {
			tab_classes += ' tabs-mobile-accordion'; // NYI
		}
		if ( $(this).hasClass('tabs-reserve-height') ) {
			tab_classes += ' tabs-reserve-height'; // NYI
		}
		
		// generate navigation
		$(this).before('<'+nav_tag+' aria-label="Choose a Tab" class="'+tab_classes+'"></'+nav_tag+'>').addClass('scripted').children('li').each(function(i){
			var tab_title = $(this).find('h1,h2,h3,h4,h5,h6').first().text();
			var tab_id = 'tab-' + Math.floor(Math.random()*26) + Date.now(); // generate unique ID to allow links to target their tabs for better screen reader accessibility
			var tab_number = '';
			var tab_labelbefore = '';
			var tab_labelafter = '';
			if ( $(this).parent().hasClass('tabs-numbers-only') ) {
				tab_number = (i+1) + ' ';
				tab_labelbefore = '<span class="hidden">(';
				tab_labelafter = ')</span>';
			}
			else if ( $(this).parent().hasClass('tabs-numbered') ) {
				tab_number = (i+1) + '. ';
			}
			if (aria_mode) {
				$(this).parent().prev(nav_tag).attr('role', 'tablist').append('<'+tab_tag+' role="tab" aria-selected="false" aria-controls="'+tab_id+'">'+ tab_number + tab_labelbefore + tab_title + tab_labelafter + '</'+tab_tag+'>');
				$(this).attr('id',tab_id).attr('role','tabpanel').wrapInner('<div class="tab-inner"></div>').attr('tabindex','0').attr('aria-label', tab_title).addClass('aria-target').hide();
			}
			else {
				$(this).parent().prev(nav_tag).append('<a href="#'+tab_id+'">'+ tab_number + tab_labelbefore + tab_title + tab_labelafter + '</a>');
				$(this).attr('id',tab_id).wrapInner('<div class="tab-inner"></div>').attr('tabindex','-1').attr('aria-label','Tab: ' + tab_title).addClass('aria-target').hide();
			}
		});
		$(this).children('li').first().show().addClass('active');
		
		// tab navigation button events
		$(this).prev(nav_tag).each(function() {
			var tabs = $(this).next('.content-tabs');
			$(this).children(tab_tag).first().addClass('active').attr('aria-selected','true');
			$(this).children(tab_tag).click(function(e) {
				e.preventDefault();
				$(tabs).children('li').removeClass('active').hide();
				$(tabs).children('li').eq( $(this).index() ).show().addClass('active');
				$(tabs).prev(nav_tag).find(tab_tag).removeClass('active').attr('aria-selected','false');
				$(this).addClass('active').attr('aria-selected','true');
				if (!aria_mode) {
					$($(this).attr('href')).focus();
				}
			});
			
			// arrow key navigation for ARIA tabs
			if (aria_mode) {
				var tab_count = $(this).children(tab_tag).length;
				$(this).children(tab_tag).each(function() {
					var prev_tab = $(this).index() - 1;
					var next_tab = $(this).index() + 1;
					if (prev_tab < 0) {
						prev_tab = tab_count - 1;
					}
					if (next_tab > tab_count - 1) {
						next_tab = 0;
					}
					$(this).keydown(function(e) {
						if (e.keyCode == 37) { // left arrow key
							e.preventDefault();
							$(this).siblings().addBack().eq(prev_tab).trigger('click').focus();
						}
						else if (e.keyCode == 39) { // right arrow key
							e.preventDefault();
							$(this).siblings().addBack().eq(next_tab).trigger('click').focus();
						}
					});
				});
			}
		});
	});

	// 8. Photo Credit/Information
	$('.photo-info').each(function() {
		$(this).attr('tabindex','0').wrapInner('<div class="photo-info-text off"></div>');
		$(this).append('<span class="photo-info-icon zmdi zmdi-camera" aria-hidden="true"><span class="sr-only">Show Photo Information</span></span>');
		$(this).find('.photo-info-icon').hover(function() {
			$(this).prev('.photo-info-text').removeClass('off');
		}, function() {
			$(this).prev('.photo-info-text').addClass('off');
		});
	});


});})(jQuery, this);
