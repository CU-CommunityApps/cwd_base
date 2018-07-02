/* CWD Utilities (ama39, last update: 1/23/18)
   - 1. Main Navigation (script support for dropdown menus and mobile)
   - 2. Empty Sidebar Helper (clears whitespace from empty sidebar regions to allow use of the :empty pseudo class in CSS)
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
	
	// Dropdown Menus
	$('li.menu-item-has-children').addClass('parent'); // WordPress Support
	$('li.menu-item--expanded').addClass('parent'); // Drupal 8 Support
	$('.dropdown-menu li.parent').parent().removeClass('menu').addClass('links list-menu');
	$('.dropdown-menu li.parent > a').wrapInner('<span></span>').append('<span class="fa fa-caret-down"></span>'); // wrap text in a span and add dropdown caret icons
	$('.dropdown-menu li.parent li.parent > a .fa').removeClass('fa-caret-down').addClass('fa-caret-right'); // change sub-dropdown caret icons
	$('.dropdown-menu li.parent > ul').each(function(){
		$(this).removeClass('menu').addClass('list-menu links vertical children');
		if ( !$('body').hasClass('mobile') ) {
			$(this).css('min-width',$(this).parent('li').width()+'px' ); // smart min-width to prevent dropdown from being narrower than its parent
		}
	});
	$('.dropdown-menu li.parent li.parent > ul').removeAttr('style'); // reset min-width to allow smaller submenus
	$('.dropdown-menu li.parent').hover(function(){
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
	
	// 2. Empty Sidebar Helper ------------------------------------------------
	$('.secondary').each(function() {
		if (msie != 8 && msie != 7) {
			if ( !$(this).html().trim() ) {
				$(this).empty();
			}
		}
	});
	
	
	
	
/*	
	// 3. Content Tabs --------------------------------------------------------
	$('.content-tabs').each(function(){
		// prepare class options to share with tab navigation 
		var tab_classes = 'tabs-nav';
		if ( $(this).hasClass('tabs-classic') ) {
			tab_classes += ' tabs-classic';
		}
		if ( $(this).hasClass('tabs-mobile-expand') ) {
			tab_classes += ' tabs-mobile-expand';
		}
		if ( $(this).hasClass('tabs-mobile-accordion') ) {
			tab_classes += ' tabs-mobile-accordion';
		}
		if ( $(this).hasClass('tabs-numbered') ) {
			tab_classes += ' tabs-numbered';
		}
		if ( $(this).hasClass('tabs-numbers-only') ) {
			tab_classes += ' tabs-numbers-only';
		}
		// generate navigation
		$(this).before('<nav class="'+tab_classes+'"></nav>').addClass('scripted').children('li').each(function(i){
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
			$(this).parent().prev('nav').append('<a href="#'+tab_id+'">'+ tab_number + tab_labelbefore + tab_title + tab_labelafter + '</a>');
			$(this).attr('id',tab_id).attr('tabindex','-1').hide();
		});
		$(this).children('li').first().show();
	});
	// tab navigation button events
	$('.tabs-nav').each(function(){
		var tabs = $(this).next('.content-tabs');
		$(this).children('a').first().addClass('active');
		$(this).children('a').click(function(e) {
			e.preventDefault();
			$(tabs).find('li').hide();
			$(tabs).find('li').eq( $(this).index() ).show();
			$(tabs).prev('nav').find('a').removeClass('active');
			$(this).addClass('active');
			$($(this).attr('href')).focus();
		});
	});
*/	
/*	// 4. Expander ------------------------------------------------------------
	$('.expander').addClass('scripted').find('h2, h3, h4, h5, h6').each(function(i) {
		if ($(this).next('div').length > 0) {
			$(this).addClass('sans expander-heading').prepend('<span class="fa fa-plus-square-o"></span>');
			$(this).attr('tabindex',0).click(function(e) {
				$(this).toggleClass('open');
			});
		}
	});
	$('.expander').each(function() {
		if ($(this).find('.expander-heading').length > 2) {
			var all_expanded = false;
			$(this).prepend('<a href="#" class="expand-all">Expand all</a>');
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
*/	
	
	
	// 5. Mobile Expander -----------------------------------------------------
	//$('.drupal #sidebar-top nav, nav.nav-body').addClass('mobile-expander').prepend('<h1 class="sans nav-heading">In this section<span class="punc">:</span></h1>');
	//$('.drupal.page-search-site #sidebar-top nav .nav-heading').addClass('hidden').html('Filter results<span class="punc">:</span>');
	$('.mobile-expander').each(function() {
		$(this).prepend('<a href="#" aria-hidden="true" class="mobile-expander-heading mobile-only"><span class="zmdi zmdi-menu"></span>More in this Section</a>');
		//if ($(this).children('h1, h2, h3, h4, h5, h6').length > 0) {
			var expand_header = $(this).children('.mobile-expander-heading').first();
			$(expand_header).nextAll().wrapAll('<div class="mobile" />');
			$(expand_header).click(function(e) {
				e.preventDefault();
				if ($(window).width() <= mobile_expander_breakpoint) {
					$(this).toggleClass('open');
				}
			});
			$(expand_header).next('.mobile').find('a').focus(function() {
				$(this).parents('.mobile').prev('.mobile-expander-heading').addClass('open');
			}); // TODO: focus and mouse event reconciliation for full keyboard support
		//}
	});
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
	
	
	
	// 7. Mobile Table Helper -------------------------------------------------
	$('.mobile-scroll').each(function() {
			$(this).wrap('<div class="table-scroller" />');
			if ( $(this).hasClass('large') ) {
				$(this).parent().addClass('large');
			}
	});
	$('.table-scroller').append('<div class="table-fader" />').bind('scroll touchmove', function() {
		$(this).find('.table-fader').remove(); // hide fader DIV on user interaction
	});
	
	
	
	
	
	
	
	
	
	
		
});})(jQuery, this);
