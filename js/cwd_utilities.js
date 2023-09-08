/* CWD Utilities (last update: 8/25/23)
   - 1. Main Navigation (script support for dropdown menus and mobile as well as a "megamenu" option)
   - 2. Empty Sidebar Helper (clears whitespace from empty sidebar regions to allow use of the :empty pseudo class in CSS)
   - 3. Mobile Table Helper (allows tables or other block elements to scroll horizontally on small devices, apply via .mobile-scroll class)
   - 4. Expander (turns heading + div pairs into an expand/collapse system with nesting based on heading level)
   - 5. Mobile Expander (similar to the standard expander, but intended to create single heading + div pairs that are only active at sub-tablet sizes (used, for example, by section navigation))
   - 6. Read More Expander (shortens a block of text to an excerpt (if above a certain character count), and appends a "read more/close" toggle to reveal the rest, apply via .readmore-expander class)
   - 7. Content Tabs (turns an ordered or unordered list into a set of slides with tabbed navigation) -- e.g., <ul class="content-tabs">
   - 8. Photo Credit/Information (div.photo-credit is turned into a small camera icon, revealing details on hover (or via keyboard/screen reader focus)
   - 9. Responsive Table (table.table-responsive: generates headings for use in a mobile-friendly table design)
   
   Change Log
   - 8/25/23 Expander accessibility update to add buttons inside of expander headings for better standards compliance
   - 6/13/23 Megamenu masonry code overhauled for better accuracy and support for multiline menu items 
   - 3/24/23 Bug fix related to menu focus 
   - 3/17/23 Escape key behavior within a menu, as well as globally on the page, updated to close any other menus that are open by mouseover 
   - 3/1/23 Megamenu "masonry" mode (in which items within the megamenu break the grid vertically to fill in empty space)
   - 2/22/23 Dropdown menu code refactored for new hover handling and megamenu "nom-nom" mode (in which the megamenu panel envelops top-level links)
   - 2/14/23 Dropdown menu code adjusted to better support applying to Utility Nav
   - 2/13/23 Megamenu code refactored to allow multiple menus on the same page to have different settings
   - 2/9/23 Megamenu converted to column-based tab order and keyboard navigation finalized
   - 9/23/22 Megamenu option added to Main Navigation scripting
   - 5/12/22 Mobile nav timing adjustment to avoid focus conflicts when transitioning back and forth to desktop design
   - 7/12/21 Responsive Table option added
   - 3/5/21 Mobile main navigation now auto-closes on loss of focus
   - 2/15/21 Small adjustment to code for detecting empty sidebar menus in Drupal
   - 11/13/20 Added support for links on Expander headings
   - 6/18/20 Bug fix for mobile section navigation + breadcrumb; the process will now be skipped when section navigation is not present
   - 6/17/20 WA fix for mobile section navigation + breadcrumb keyboard focus
   - 5/14/20 Bug fix for the combination of mobile section navigation + breadcrumb, when used with or without Drupal block title markup
   - 4/30/20 New keyboard navigation for Main Navigation, and "on-demand" variant (for keyboard and screen readers, dropdowns will only appear when requested by arrow key)
   - 1/30/20 Photo Credit/Information functionality added
   - 1/23/20 Mobile Expander: If a page breadcrumb is present (using the usual .breadcrumb Drupal markup), the mobile section navigation will now "move" the breadcrumb to inside the expander when in mobile.
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
			menuClearMasonry();
		}
		else {
			$('body').removeClass('mobile');
			$('.megamenu-top').removeClass('open'); // used by megamenu "nom nom" mode
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
	
	// Megamenu settings saved to each menu
	$('.dropdown-menu').each(function() {
		$(this).attr('data-megamenu','false'); // "megamenu" mode
		$(this).attr('data-megamenu-masonry','false'); // "megamenu" masonry mode
		if ( $(this).hasClass('dropdown-megamenu') ) {
			$(this).attr('data-megamenu','true'); // activate megamenu design and adjustments to keyboard navigation
			$(this).addClass('dropdown-menu-on-demand'); // ensure on-demand mode is active as well
			if ( $(this).hasClass('megamenu-masonry') ) {
				$(this).attr('data-megamenu-masonry','true'); // activate megamenu masonry design
			}
		}
	});

	// Utility Navigation (appended for mobile)
	if ($('#utility-navigation li').length > 0) {
		if ($('#main-navigation').length > 0) {
			$('#main-navigation ul').first().append('<li class="parent mobile-nav-only"><a class="more-links-button" href="#">More...</a><ul class="list-menu links vertical children more-links"></ul>');
			$('#utility-navigation li').each(function() {
				if ( $(this).parent('ul').parent('li').length > 0 ) {
					$(this).addClass('utility-submenu');
				}
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
	$('.dropdown-menu li a').wrapInner('<span></span>'); // wrap text in a span
	
	$('.dropdown-menu li.parent').parent().removeClass('menu').addClass('links list-menu');
	$('.dropdown-menu li.parent > a').attr('aria-haspopup','true').append('<span class="fa fa-caret-down"></span>'); // add dropdown caret icons
	$('.dropdown-menu li.parent li.parent > a .fa').removeClass('fa-caret-down').addClass('fa-caret-right'); // change sub-dropdown caret icons
	$('.dropdown-menu-on-demand li.parent ul a').attr('tabindex','-1'); // in on-demand mode, links in dropdowns are not initially accessible by tab order
	$('.dropdown-menu-on-demand li.parent > ul').attr('aria-hidden','true'); // in on-demand mode, links in dropdowns are not initially accessible to screen reader (including rotor)
	$('.dropdown-megamenu li.parent > ul > li:first-child > a').addClass('first-child'); // in megamenu mode, used to aid with keyboard navigation
	$('.dropdown-megamenu li.parent > ul > li:last-child > a').addClass('last-child'); // in megamenu mode, used to aid with keyboard navigation
	$('.dropdown-menu li.parent > ul').each(function() {
		$(this).removeClass('menu').addClass('list-menu links vertical children');
		if ( !$('body').hasClass('mobile') ) {
			var min_width = $(this).parent('li').width();
			if (min_width < 150) {
				min_width = 150;
			}
			$(this).css('min-width',min_width+'px' ); // smart min-width to prevent dropdown from being narrower than its parent (and no smaller than 150)
		}
	});
	
	$('.dropdown-megamenu > .container-fluid > ul').addClass('megamenu-top'); // used by megamenu "nom nom" mode
	$('.dropdown-megamenu > .container-fluid > ul > li.parent > ul').each(function(n) {
		
		// in megamenu mode, catalog the number of standard menu items to allow for column-based tab order
		if ( $(this).parent().hasClass('mobile-nav-only') ) {
			return; // skip mobile-only utility nav if present
		}
		
		var row_ids = 'abcdefgh';
		var menu_items = $(this).children(':not(.menu-feature)').length;
		var max_cols = 3;
		if ($(this).children('.menu-feature').length > 0) {
			 max_cols = 2;
		}
		var max_rows = menu_items / max_cols;
		$(this).attr('data-max-rows',max_rows).attr('data-max-cols',max_cols);
		
		var col1 = Math.ceil(max_rows);
		var col2 = Math.round(max_rows);
		for (let i=0; i<col1; i++) {
			$(this).children(':not(.menu-feature)').eq(i).attr('data-row',i+1).attr('data-col','1').attr('data-position','col1'+row_ids.charAt(i)).addClass('col1'+row_ids.charAt(i));
		}
		for (let i=0; i<col2; i++) {
			$(this).children(':not(.menu-feature)').eq(i+col1).attr('data-row',i+1).attr('data-col','2').attr('data-position','col2'+row_ids.charAt(i)).addClass('col2'+row_ids.charAt(i));
		}
		if (max_cols == 3) {
			var col3 = Math.floor(max_rows);
			for (let i=0; i<col3; i++) {
				$(this).children(':not(.menu-feature)').eq(i+col1+col2).attr('data-row',i+1).attr('data-col','3').attr('data-position','col3'+row_ids.charAt(i)).addClass('col3'+row_ids.charAt(i));
			}
		}
		
		// catalog the number of sub-items for masonry calculation
		$(this).children(':not(.menu-feature)').each(function() {
			var children = $(this).children('ul').children('li').length;
			$(this).attr('data-children',children);
		});
		
	});
	
	$('.dropdown-menu li.parent li.parent > ul').removeAttr('style'); // reset min-width to allow smaller submenus
	$('.dropdown-menu').each(function() {
		var this_menu = $(this);
		var hover_intent_in; // will be a Timeout() below, used for nuanced hover detection
		var hover_intent_out; // will be a Timeout() below, used for nuanced hover detection
		
		$(this).find('li.parent').hover(function() {
			// Delay menu response on hover INTO a top level item (desktop only)
			if ( $(this).hasClass('top-level-li') && !$('body').hasClass('mobile') ) {
				clearTimeout(hover_intent_out); // cancel any hover OUT timer
				$(this_menu).find('li.parent').removeClass('open');
				$(this_menu).find('li.focused').addClass('open').parent('ul').addClass('open'); // leave the menu visible if it contains current focus
				$(this_menu).find('a:not(.top-level-link):focus').closest('.parent').addClass('open'); // account for sub-submenus as well
				menuUpdateMasonry( $(this).children('ul').first() );
				var this_link = $(this);
				if ( !$(this_link).parent().hasClass('open') ) { // if the menu is not already open
					hover_intent_in = setTimeout(function() { // start new timer
						$(this_link).addClass('open');
						$(this_link).parent().addClass('open');
					},200); // 200ms delay in hover response, to reduce unintentional trigger
				}
				else { // if the menu is already open, skip the timer and respond immediately
					$(this_link).addClass('open');
					$(this_link).parent().addClass('open');
				}
			}
			else if ( !$('body').hasClass('mobile') ) {
				$(this).addClass('open');
			}
			if ( !$('body').hasClass('mobile') ) {
				// horizontal edge-detection
				var submenu_offset = $(this).children('ul').offset();
				try {
					if ( submenu_offset.left + $(this).children('ul').width() > $(window).width() ) {
						$(this).children('ul').addClass('flip');
					}
				} catch {}
			}
		}, function() {
			// Delay menu response on hover OUT of a top level item (desktop only)
			if ( $(this).hasClass('top-level-li') && !$('body').hasClass('mobile') ) {
				clearTimeout(hover_intent_in); // cancel any hover IN timer
				var this_link = $(this);
				hover_intent_out = setTimeout(function() { // start new timer
					$(this_link).removeClass('open');
					$(this_link).parent().removeClass('open');
					$(this_menu).find('li.focused').addClass('open').parent('ul').addClass('open'); // leave the menu visible if it contains current focus
					$(this_menu).find('a:not(.top-level-link):focus').closest('.parent').addClass('open'); // account for sub-submenus as well
					if ( !$('body').hasClass('mobile') ) {
						$(this).children('ul').removeClass('flip');
					}
				},400); // 400ms delay in hover response, to reduce unintentional loss of menu
			}
			else if ( !$('body').hasClass('mobile') ) {
				$(this).removeClass('open');
				$(this).children('ul').removeClass('flip');
			}
		});
	});
	$('.dropdown-menu li.parent a').focus(function() {
		$(this).closest('.dropdown-menu').find('.focused').removeClass('focused').find('.focused-top-level').removeClass('focused-top-level');
		if ( $(this).hasClass('top-level-link') ) {
			$(this).closest('.top-level-li').addClass('focused-top-level');
		}
		else {
			$(this).closest('.top-level-li').addClass('focused');
		}
		
		if ( !$('body').hasClass('mobile') ) {
			// horizontal edge-detection
			var submenu_offset = $(this).closest('.parent').children('ul').offset();
			try {
				if ( submenu_offset.left + $(this).closest('.parent').children('ul').width() > $(window).width() ) {
					$(this).closest('.parent').children('ul').addClass('flip');
				}
			} catch {}
		}
		if (!mousedown) {
			menuUpdateMasonry( $(this).next('ul') );
			$(this).parents('.parent').addClass('open');
			$(this).closest('.megamenu-top').addClass('open'); // used by megamenu "nom nom" mode
			$(this).closest('.mobile-expander').children('.mobile-expander-heading').addClass('open');
		}
		mousedown = false;
	}).blur(function() {
		if ( !$('body').hasClass('mobile') ) {
			$(this).parents('.parent').removeClass('open');
			$(this).closest('.megamenu-top').removeClass('open'); // used by megamenu "nom nom" mode
			$(this).closest('.mobile-expander').children('.mobile-expander-heading').removeClass('open');
		}
	});
	
	// Keyboard Navigation
	$('.dropdown-menu').each(function() {
		var megamenu = eval( $(this).attr('data-megamenu') ); // get megamenu setting
		
		$(this).find('ul').first().children('li').addClass('top-level-li').children('a').addClass('top-level-link');
		if ( megamenu ) {
			$(this).find('.top-level-link').next('ul').children('li').children('a').addClass('megamenu-top-level-link');
		}
	});
	
	$('.dropdown-menu-on-demand').find('ul').find('a').each(function() { // on-demand mode only (includes megamenu mode)
		var megamenu = eval( $(this).closest('.dropdown-menu').attr('data-megamenu') ); // get megamenu setting
		
		$(this).attr('data-label',$(this).children('span:first-child').text()); // -> generate initial label text
		$(this).attr('aria-label',$(this).attr('data-label')); // -> apply initial label
		
		$(this).focus(function() {
			if ( !$('body').hasClass('mobile') ) {
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).closest('ul').find('.children').attr('aria-hidden','true').find('a').attr('tabindex','-1'); // -> lock all submenus
					if ( $(this).attr('aria-haspopup') == 'true' ) {
						$(this).attr('aria-label', $(this).attr('data-label') + ': To enter this sub menu, press Down Arrow.'); // -> append help text
					}
				}
				else {
					if ( !megamenu ) {
						$(this).next('ul').attr('aria-hidden','true').find('a').attr('tabindex','-1'); // -> lock children
					}
					if ( $(this).attr('aria-haspopup') == 'true' ) {
						if ( megamenu ) {
							$(this).attr('aria-haspopup','false'); // megamenu submenus are always visible
						}
						else if ( $(this).next('ul').hasClass('flip') ) {
							$(this).attr('aria-label', $(this).attr('data-label') + ': To enter this sub menu, press Left Arrow.'); // -> append help text
						}
						else {
							$(this).attr('aria-label', $(this).attr('data-label') + ': To enter this sub menu, press Right Arrow.'); // -> append help text
						}
					}
				}
			}
			else {
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).closest('ul').find('.children').attr('aria-hidden','false').find('a').attr('tabindex','0'); // -> unlock 1 level of submenus on mobile
				}
				else {
					$(this).closest('ul').find('.children').attr('aria-hidden','true').find('a').attr('tabindex','-1'); // -> lock deeper levels on mobile
				}
			}
		}).blur(function() {
			$(this).attr('aria-label',$(this).attr('data-label')); // -> reset initial label
		});
	});
	
	$('.dropdown-menu li a').keydown(function(e) {
		var megamenu = eval( $(this).closest('.dropdown-menu').attr('data-megamenu') ); // get megamenu setting
		
		// Only accept arrow key input without modifier keys, to avoid interfering with system commands
		if (!$('body').hasClass('mobile') && e.ctrlKey == false && e.altKey == false && e.shiftKey == false && e.metaKey == false) {
			
			// RIGHT arrow key -------------------------------------------------------
			if (e.keyCode == 39) {
				e.preventDefault();
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).parent().next().children('a').focus(); // -> next top level item
				}
				else if ( $(this).attr('aria-haspopup') == 'true' ) { // dropdown item with submenu
					if ( $(this).next('ul').hasClass('flip') ) { // submenu positioned left
						$(this).closest('.top-level-li').next().children('a').first().focus(); // -> next top level item
					}
					else {
						$(this).next('ul').attr('aria-hidden','false').children().children('a').attr('tabindex','0'); // -> unlock sub-submenu
						$(this).next('ul').find('a').first().focus(); // -> enter sub-submenu
					}
				}
				else { // basic dropdown item (or megamenu)
					if ( $(this).closest('ul').closest('li').hasClass('top-level-li') ) { // 1 level down
						if ( megamenu ) {
							// jump over one column to the right
							var position_current = $(this).parent().attr('data-position');
							if ( position_current.charAt(3) == '1' ) {
								var position_target = position_current.replace('1','2');
							}
							else {
								var position_target = position_current.replace('2','3');
							}
							// if this row doesn't exist in the new column, target the previous row
							if ( $(this).closest('.children').find('.'+position_target).length == 0 ) {
								var alternate_target = position_target.substring(0,4) + String.fromCharCode(position_target.substring(4).charCodeAt(0) - 1);
								position_target = alternate_target;
							}
							$(this).closest('.children').find('.'+position_target).children('a').focus(); // -> same row, next column
						}
						else {
							$(this).closest('.top-level-li').next().children('a').first().focus(); // -> next top level item
						}
					}
					else { // 2+ levels down
						if ( megamenu ) {
							// jump over one column to the right
							var position_current = $(this).closest('ul').closest('li').attr('data-position');
							if ( position_current.charAt(3) == '3' ) {
								// no action in 3rd column
							}
							else if ( position_current.charAt(3) == '1' ) {
								var position_target = position_current.replace('1','2');
							}
							else {
								var position_target = position_current.replace('2','3');
							}
							// if this row doesn't exist in the new column, target the previous row
							if ( position_current.charAt(3) != '3' && $(this).closest('ul').closest('li').closest('.children').find('.'+position_target).length == 0 ) {
								var alternate_target = position_target.substring(0,4) + String.fromCharCode(position_target.substring(4).charCodeAt(0) - 1);
								position_target = alternate_target;
							}
							$(this).closest('ul').closest('li').closest('.children').find('.'+position_target).children('a').focus(); // -> same row, next column
						}
						else if ( $(this).closest('ul').hasClass('flip') ) { // current menu positioned left
							$(this).closest('ul').prev('a').focus(); // -> return to parent
						}
						else {
							$(this).closest('.top-level-li').next().children('a').first().focus(); // -> next top level item
						}
					}
				}
			}
			
			// DOWN arrow key --------------------------------------------------------
			else if (e.keyCode == 40) {
				e.preventDefault();
				if ( $(this).hasClass('top-level-link') && megamenu ) {
					$(this).next('ul').children().children('ul').attr('aria-hidden','false').children().children('a').attr('tabindex','0'); // -> unlock all submenus for megamenu
					$(this).next('ul').find('.menu-feature *[tabindex=-1]').removeAttr('tabindex'); // safeguard arbitrary elements within menu feature
				}
				if ( $(this).hasClass('top-level-link') || $(this).hasClass('megamenu-top-level-link') ) { // top level (or top level item within megamenu)
					if ( $(this).hasClass('megamenu-top-level-link') && $(this).next('ul').children('li').length <= 0 ) { // -> top level megamenu item with no submenu
						$(this).parent().next().children('a').focus(); // -> next top-level megamenu item
					}
					else {
						$(this).next('ul').attr('aria-hidden','false').children().children('a').attr('tabindex','0'); // -> unlock submenu
						$(this).next('ul').find('a').first().focus(); // -> enter submenu
					}
				}
				else {
					if ( $(this).hasClass('last-child') ) {
						$(this).closest('ul').closest('li').next().children('a').first().focus(); // -> next top level item within megamenu
					}
					else {
						$(this).parent().next().children('a').focus(); // -> next menu item
					}
				}
			}
			
			// LEFT arrow key --------------------------------------------------------
			else if (e.keyCode == 37) {
				e.preventDefault();
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).parent().prev().children('a').focus(); // -> previous top level item
				}
				else if ( $(this).attr('aria-haspopup') == 'true' ) { // dropdown item with submenu
					if ( !$(this).next('ul').hasClass('flip') ) {  // submenu positioned right
						$(this).closest('.top-level-li').prev().children('a').first().focus(); // -> next top level item
					}
					else {
						$(this).next('ul').attr('aria-hidden','false').children().children('a').attr('tabindex','0'); // -> unlock sub-submenu
						$(this).next('ul').find('a').first().focus(); // -> enter sub-submenu
					}
				}
				else { // basic dropdown item (or megamenu)
					if ( $(this).closest('ul').closest('li').hasClass('top-level-li') ) { // 1 level down
						if ( megamenu ) {
							// jump back one column to the left
							var position_current = $(this).parent().attr('data-position');
							if ( position_current.charAt(3) == '2' ) {
								var position_target = position_current.replace('2','1');
							}
							else {
								var position_target = position_current.replace('3','2');
							}
							$(this).closest('.children').find('.'+position_target).children('a').focus(); // -> same row, previous column
						}
						else {
							$(this).closest('.top-level-li').prev().children('a').first().focus(); // -> previous top level item
						}
					}
					else { // 2+ levels down
						if ( megamenu ) {
							// jump back one column to the left
							var position_current = $(this).closest('ul').closest('li').attr('data-position');
							if ( position_current.charAt(3) == '1' ) {
								// no action in 1st column
							}
							else if ( position_current.charAt(3) == '2' ) {
								var position_target = position_current.replace('2','1');
							}
							else {
								var position_target = position_current.replace('3','2');
							}
							$(this).closest('ul').closest('li').closest('.children').find('.'+position_target).children('a').focus(); // -> same row, previous column
						}
						else if ( !$(this).closest('ul').hasClass('flip') ) { // current menu positioned right
							$(this).closest('ul').prev('a').focus(); // -> return to parent
						}
						else {
							$(this).closest('.top-level-li').prev().children('a').first().focus(); // -> previous top level item
						}
					}
				}
			}
			
			// UP arrow key ----------------------------------------------------------
			else if (e.keyCode == 38) {
				e.preventDefault();
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).parent().removeClass('open'); // -> visually hide submenu
				}
				else if ( $(this).hasClass('megamenu-top-level-link') ) { // top level within a megamenu
					if ( $(this).hasClass('first-child') ) { // also first link within megamenu
						$(this).closest('ul').prev('.top-level-link').focus(); // -> return to top level
					}
					else {
						if ( $(this).parent().prev('li').children('ul').first().children('li').length <= 0 ) {
							 $(this).parent().prev().children('a').focus(); // -> previous top-level item in megamenu has no submenu, move to that item
						}
						else {
							$(this).closest('li').prev().find('.last-child').first().focus(); // -> back to end of previous submenu within megamenu
						}
					}
				}
				else if ( $(this).hasClass('first-child') ) { // first submenu item in megamenu
					$(this).closest('ul').prev('a').focus(); // -> return to parent within megamenu
				}
				else if ( $(this).parent().prev('li').length <= 0 ) { // first submenu item
					$(this).closest('ul').prev('.top-level-link').focus(); // -> return to top level
				}
				else {
					$(this).parent().prev().children('a').focus(); // -> previous menu item
				}
			}
			
			// ESCAPE key ------------------------------------------------------------
			else if (e.keyCode == 27) {
				// Hide any open menus that are outside of current focus
				$(this).closest('.dropdown-menu').find('.open').removeClass('open');
				$(this).closest('.dropdown-menu').find('.focused').addClass('open').parent('ul').addClass('open');
				
				// Back out of current menu or close menu when at the top level
				if ( $(this).hasClass('top-level-link') ) { // top level
					$(this).parent().removeClass('open'); // -> visually hide submenu
					$(this).parent().parent().removeClass('open'); // -> hide top fill in nom-nom megamenu
				}
				else {
					$(this).closest('ul').prev('a').focus(); // -> return to parent
				}
			}
		}
	});
	
	// Escape key outside of menu scope (when a menu does not currently contain focus, but may be open by mousover) 
	$('body').keydown(function(e) {
		// ESCAPE key ------------------------------------------------------------
		if (e.keyCode == 27) {
			$('.dropdown-menu').each(function() {
				if ( $(this).find('.focused').length == 0 && $(this).find('.focused-top-level').length == 0 ) {
					$(this).find('.open').removeClass('open');
				}
			});
		}
	});
	
	// Additional focus handling (remove errant "focus" classes if needed)
	var focus_cleanup;
	$('.dropdown-menu').focusout(function() {
		var this_menu = $(this);
		focus_cleanup = setTimeout(function(){
			$(this_menu).find('.focused, .focused-top-level').removeClass('focused focused-top-level');
		}, 50);
	}).focusin(function() {
		clearTimeout(focus_cleanup);
	});
	
	// Mobile Navigation
	$('.dropdown-menu li.parent > a .fa').addClass('aria-target').attr('tabindex','-1').click(function(e) {
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
	$('#mobile-home').after('<button id="mobile-close"><span class="sr-only">Close Menu</span></button>');
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
	});
	// auto-close on loss of focus
	var focus_timeout;
	$('#main-navigation a, #main-navigation button, #main-navigation .fa').focus(function() {
		if ( $('body').hasClass('mobile') ) {
			clearTimeout(focus_timeout);
		}
	}).blur(function() {
		if ( $('body').hasClass('mobile') ) {
			focus_timeout = setTimeout(function(){
				$('#mobile-close').trigger('click');
			}, 50);
		}
	});
	
	// Recalculate Megamenu Masonry
	function menuUpdateMasonry(menu) {
		
		// if this is the mobile menu...
		if ( $('body').hasClass('mobile') ) {
			menuClearMasonry(); // reset
			return; // and take no further action
		}
		// if this is not a masonry menu...
		if ( !$(menu).parent().hasClass('mobile-nav-only') && $(menu).closest('.megamenu-masonry').length == 0 ) {
			return; // take no action
		}
		
		// otherwise, now entering a hardhat area...
		
		var masonry = [0,0,0]; // a running tally of masonry offset for each column
		var cols = $(menu).attr('data-max-cols');
		var rows = $(menu).attr('data-max-rows');

		$(menu).each(function() {
			var this_menu = $(this);
			var this_menu_feature = $(this).find('.menu-feature').last();
			var this_menu_feature_extraspace = 0;
			if ( $(this_menu_feature).length > 0 ) {
				this_menu_feature_extraspace = parseInt( $(this_menu_feature).css('height','').height() - $(this_menu_feature).find('.feature-content').height() );
			}
			
			$(this).children(':not(.menu-feature)').each(function() {
				$(this).removeAttr('style');
				var this_row = parseInt( $(this).attr('data-row') );
				var this_col = parseInt( $(this).attr('data-col') );
			
				if ( this_row > 1 ) {
					var prev_row = this_row - 1;
					var masonry_offset = 0;
					var max_height = 0;
					var prev_height = 0;
					var row_query = $(this).parent().find('[data-row='+prev_row+']');
					
					// calculate height of previous menu item and any children
					for (let i=0; i<$(this).prev().children().length; i++) {
						prev_height += $(this).prev().children().eq(i).height();
					}
					prev_height = parseInt(prev_height);
				
					// determine the the tallest menu item of the previous row
					for (let i=0; i<$(row_query).length; i++) {
						let this_height = 0;
						for (let j=0; j<$(row_query).eq(i).children().length; j++) {
							this_height += $(row_query).eq(i).children().eq(j).height();
						}
						this_height = parseInt(this_height);
						if ( this_height > max_height ) {
							max_height = this_height;
						}
					}
				
					masonry_offset = max_height - prev_height;
					masonry[this_col-1] += masonry_offset;
				
					if (masonry[this_col-1] > 0) {
						$(this).css('top','-' + masonry[this_col-1] + 'px'); // offset by the amount the previous item is smaller than the max for that row
						$(this).prev().height( $(this).prev().height() - masonry_offset ); // reduce the height of the previous item by the amount that was added to masonry, so the overall height of the megamenu can be collapsed
					}
				}
			});
			
			// collapse menu to account for masonry offset (but only if the menu-feature is shorter than the height of the menu items)
			var menu_collapse = masonry[0];
			if (masonry[1] < masonry[0]) {
				menu_collapse = masonry[1];
			}
			if (menu_collapse > this_menu_feature_extraspace) {
				menu_collapse = this_menu_feature_extraspace;
			}
			
			$(this_menu_feature).css('height','').height( $(this_menu_feature).height() - menu_collapse );
			$(this_menu).css('height','auto').css('max-height','').css('max-height', ($(this_menu).height() - menu_collapse) + 'px' ).css('height','');
		});
	}
	// Clear Megamenu Masonry
	function menuClearMasonry() {
		$('.megamenu-masonry .top-level-li > .children').removeAttr('style');
		$('.megamenu-masonry .children > li').removeAttr('style');
	}
	
	// 2. Empty Sidebar Helper ------------------------------------------------
	function emptySidebars() {
		$('.secondary').each(function() {
			if (msie != 8 && msie != 7) {
				if ( !$(this).html().trim() ) {
					$(this).empty().addClass('empty');
				}
			}
		});
	}
	emptySidebars();
	
	
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
			$(this).addClass('sans expander-heading').wrapInner('<button class="expander-button">');
			$(this).children('.expander-button').attr('aria-expanded','false').prepend('<span class="fa fa-plus-square-o" aria-hidden="true"></span>').click(function(e) {
				$(this).parent().toggleClass('open');
				if ($(this).parent().hasClass('open')) {
					$(this).attr('aria-expanded','true');
				}
				else {
					$(this).attr('aria-expanded','false');
				}
			});
		}
	});
	$('.expander').each(function() {
		if ($(this).find('.expander-heading').length > 1) {
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
	$('.expander-button').each(function() {
		
		/*
		var this_heading = $(this);
		$(this).next('div').focus(function() {
			$(this_heading).addClass('open');
		});
		$(this).next('div').find('*').focus(function() {
			$(this_heading).addClass('open');
		});
		*/
		
		/* // No longer needed, since we have a native button tag
		$(this).keydown(function(e) {
			if (e.keyCode == 13 || e.keyCode == 32) { // enter or space key
				e.preventDefault();
				if (e.keyCode == 13) { // enter triggers on key down
					$(this).trigger('click');
				}
			}
		}).keyup(function(e) {
			if (e.keyCode == 32) { // space triggers on key up
				$(this).trigger('click');
			}
		});
		*/
		
		// Handle links in the heading
		$(this).find('a').each(function() {
			$(this).click(function(e) {
				e.stopPropagation();
			});
			var link_label = $(this).text();
			$(this).addClass('expander-heading-link').wrapInner('<span class="sr-only"> </span>').prepend('more...').before(link_label + ' ');
			$(this).parent('button').addClass('has-link').parent('.expander-heading').append($(this));
		});
	});
	
	// 5. Mobile Expander -----------------------------------------------------
	//$('.drupal #sidebar-top nav, nav.nav-body').addClass('mobile-expander').prepend('<h1 class="sans nav-heading">In this section<span class="punc">:</span></h1>');
	//$('.drupal.page-search-site #sidebar-top nav .nav-heading').addClass('hidden').html('Filter results<span class="punc">:</span>');
	$('.mobile-expander').each(function() {
		var expander_icon = 'zmdi-menu';
		var expander_label = 'More in this Section';
		if ($(this).find('form[id^=views-exposed-form]').length > 0) {
			expander_icon = 'zmdi-filter-list';
			expander_label = 'Filter';
		}
		if ( $(this).prev('.menu-block-title').length > 0 ) {
			$(this).prev('.menu-block-title').before('<button aria-hidden="true" class="mobile-expander-heading mobile-only"><span class="zmdi '+expander_icon+'"></span>'+expander_label+'</button>');
			var expand_header = $(this).prevAll('.mobile-expander-heading').first();
			$(expand_header).nextAll('.menu-block-title, .mobile-expander').wrapAll('<div class="mobile" />');
		}
		else {
			$(this).before('<button aria-hidden="true" class="mobile-expander-heading mobile-only"><span class="zmdi '+expander_icon+'"></span>'+expander_label+'</button>');
			var expand_header = $(this).prevAll('.mobile-expander-heading').first();
			$(expand_header).nextAll('.mobile-expander').wrapAll('<div class="mobile" />');
		}
		
		$(expand_header).click(function(e) {
			e.preventDefault();
			if ($(window).width() <= mobile_expander_breakpoint) {
				$(this).toggleClass('open');
			}
		});
		$(expand_header).next('.mobile').find('a').focus(function() {
			$(this).parents('.mobile').first().prev('.mobile-expander-heading').addClass('open');
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
				$(this).parent('.mobile').prev('.mobile-expander-heading').remove();
				$(this).parent('.mobile').remove();
				emptySidebars();
			}
		}
	});
	
	// clone the breadcrumb and prepend to the mobile section nav 
	if ($('#sidebar-top .secondary-navigation').length > 0) {
		$('#sidebar-top .secondary-navigation').first().parents('.mobile').first().prepend( $('.breadcrumb').first().addClass('no-mobile').clone().removeClass('no-mobile').addClass('mobile-only') );
		$('.breadcrumb.mobile-only').removeAttr('aria-labelledby').attr('aria-label','Mobile Breadcrumb').find('#system-breadcrumb').remove();
		$('.breadcrumb.mobile-only a').focus(function() {
			$(this).parents('.mobile').first().prev('.mobile-expander-heading').addClass('open');
		});
	}
	
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
				$(tabs).children('li').eq( $(this).index() ).show().addClass('active').attr('tabindex', '-1');
				$(tabs).prev(nav_tag).find(tab_tag).removeClass('active').attr('aria-selected','false').attr('tabindex', '0');
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
	
	// 9. Responsive Table
	var table_regen_timeout;
	var table_regen_listening = false;
	
	function responsiveTables() {
		
		$('.table-responsive').each(function() {
			
			// Clean up any existing headings before regenerating (just in case)
			$(this).find('.mobile-header, .mobile-subheader, .mobile-label').remove(); 
			$(this).find('.row-header > *:first-child').unwrap();
		
			// Heading Levels
			var table_header_level = 3;
			var table_subheader_level = 4;
			var table_label_level = 5;
			if ( $(this).hasClass('table-heading-level-2') ) {
				table_header_level = 2;
				table_subheader_level = 3;
				table_label_level = 4;
			}
			else if ( $(this).hasClass('table-heading-level-4') ) {
				table_header_level = 4;
				table_subheader_level = 5;
				table_label_level = 6;
			}
			if ( $(this).find('caption').length == 0) {
				table_label_level = table_subheader_level;
				table_subheader_level = table_header_level;
			}
			else {
				var header = $(this).find('caption').text();
				$(this).find('caption').after('<h'+table_header_level+' class="mobile-header">'+header+'</h'+table_header_level+'>');
			}
		
			// Table Cells
			$(this).find('tbody th').each(function() {
				var subheader = $(this);
				if ( $(subheader).find('.tooltip').length > 0 ) { // compatibility with cwd_tooltips used in row headings
					subheader = $(subheader).find('.tooltip').first();
					var subheader_text = $(this).text();
				}
				else if ( $(subheader).find('a').length > 0 ) { // compatibility with links used in row headings
					var subheader_text = $(this).html();
				}
				else {
					var subheader_text = $(this).text();
				}
				$(this).wrapInner('<div class="row-header"></div>');
				$(this).prepend('<h'+table_subheader_level+' class="mobile-subheader">'+subheader_text+'</h'+table_subheader_level+'>');
			});
			$(this).find('tbody td').each(function() {
				var label = $(this).closest('table').find('thead th, thead td').eq( $(this).index() );
				if ( $(label).find('.tooltip').length > 0 ) { // compatibility with cwd_tooltips used in column headings
					label = $(label).find('.tooltip').first();
				}
				$(this).prepend('<h'+table_label_level+' class="mobile-label">'+label.text()+'</h'+table_label_level+'>');
			});
			
			//$(this).removeClass('invisible');
		});
		
		table_regen_listening = true;
	}
	
	// Watch for AJAX DOM changes (this selector may need to be moved one or more levels up in the DOM hierarchy if the entire table tag is regenerated by AJAX)
	$('.table-responsive').on('DOMSubtreeModified', function() {			
		//$(this).addClass('invisible');
		clearTimeout(table_regen_timeout);
		
		if (table_regen_listening == true) {
			table_regen_timeout = setTimeout(function() {
				table_regen_listening = false;
				responsiveTables(); // reprocess tables
			}, 50);
		}
	});
	
	// First Run
	responsiveTables();


});})(jQuery, this);
