/* CWD Card Slider (ama39, last update: 4/19/22)
   - 
   
   - Accessibility Notes:
   - -- 
   
   - Future Plans:
   - -- Free Scroll Mode (disabling screen-by-screen locking, to allow the element to be freely scrolled with mouse or touch gesture)
   ------------------------------------------------------------------------- */
	
		
jQuery(document).ready(function($) {	
	
	// Apply touch-action polyfill (requires pep.js)
	$('.card-slider .cards').attr('touch-action','pan-y');
	
	// Set-up markup
	$('.card-slider').each(function() {
		
		$(this).addClass('scripted'); // This tells the CSS that JavaScript is present, so we can safely override natural overflow scrolling
		
		// detect prefs
		if ($(this).hasClass('side-padding')) {
			$(this).wrap('<div class="card-slider-padded"></div>')
		}
		if ($(this).hasClass('shuffle')) {
			// See https://stackoverflow.com/a/12646864/5135767
			jQuery.fn.shuffle = function () {
				for (var i = this.length - 1; i > 0; i--) {
					var j = Math.floor(Math.random() * (i + 1));
					$(this[j]).before($(this[i]));
				}
				return this;
			};
			$(this).find('.card').shuffle();
		}

		// detect viewer width
		var viewer = $(this);
		var viewer_band = $(this).find('.cards').first();
		var card_count = $(this).find('.card').length;
		var card_width = $(this).find('.card').first().outerWidth();
		
		var viewer_width = $(viewer_band).width();
		var viewer_scroll_limit = $(viewer_band)[0].scrollWidth - viewer_width;
		var cards_per_screen = Math.round(viewer_width / card_width);
		var full_card_sets = Math.floor(card_count / cards_per_screen);
		var even_sets = true;
		if (full_card_sets * cards_per_screen < card_count) {
			even_sets = false;
		}
		
		var scroll_target = 0;
		var active_pip = 0;
		var active_pip_raw = 0;
		var previous_pip = 0;
		var previous_pip_raw = 0;
		
		$(window).resize(function() {
			viewer_width = $(viewer_band).width();
			viewer_scroll_limit = $(viewer_band)[0].scrollWidth - viewer_width;
			card_width = $(viewer_band).find('.card').first().outerWidth();
			cards_per_screen = Math.round(viewer_width / card_width);
			full_card_sets = card_count % cards_per_screen;
			even_sets = true;
			if (full_card_sets * cards_per_screen < card_count) {
				even_sets = false;
			}
			
			// recalibrate
			var current_first_card = Math.round($(viewer_band).scrollLeft() / card_width);
			if (current_first_card % cards_per_screen != 0) { // lock to slide set
				current_first_card = cards_per_screen * (Math.floor(current_first_card / card_count) * cards_per_screen);
			}
			scroll_target = current_first_card * card_width;
			
			if (scroll_target < 10) {
				scroll_target = 0;
			}
			else if (scroll_target > viewer_scroll_limit || viewer_scroll_limit - scroll_target < 10) {
				scroll_target = viewer_scroll_limit;
			}
			$(viewer_band).scrollLeft(scroll_target);
			
			// refresh buttons
			updateButtons(viewer,viewer_scroll_limit,scroll_target);
			
			
		});
		
		// build buttons
		var nextprev_html = '';
		if (card_count > 1) {
			$(viewer_band).before('<div class="pips" aria-hidden="true"></div>').wrap('<div class="mask"></div>');
			nextprev_html = '<div class="next-prev" aria-hidden="true"><button class="prev"><span class="sr-only">Previous Slide Set</span><span class="fa fa-angle-left"></span></button><button class="next"><span class="sr-only">Next Slide Set</span><span class="fa fa-angle-right"></span></button></div>';
			$(this).append(nextprev_html);
			$(this).find('.next, .prev').click(function(e) {
				if ($(this).hasClass('prev')) {
					//scroll_target -= viewer_width;
					scroll_target = (active_pip - 1) * cards_per_screen * card_width;
				}
				else {
					//scroll_target += viewer_width;
					scroll_target = (active_pip + 1) * cards_per_screen * card_width;
				}
				if (scroll_target < 10) {
					scroll_target = 0;
				}
				else if (scroll_target > viewer_scroll_limit || viewer_scroll_limit - scroll_target < 10) {
					scroll_target = viewer_scroll_limit;
				}
				updateButtons(viewer,viewer_scroll_limit,scroll_target); // refresh buttons
				$(viewer_band).stop().animate({
					scrollLeft: scroll_target
				}, 500, 'easeOutQuad');
			});
			
		}
		
		updateButtons(viewer,viewer_scroll_limit,scroll_target); // refresh buttons
		
		
		function updateButtons(viewer,viewer_scroll_limit,scroll_target) {
		
			// update enabled/disabled
			$(viewer).find('.next-prev button').prop('disabled',false);
			if (scroll_target == 0) {
				$(viewer).find('.prev').prop('disabled',true);
			}
			if (scroll_target == viewer_scroll_limit) {
				$(viewer).find('.next').prop('disabled',true);
			}
		
			// Indicator Pips
			var viewer_width_natural = 0;
			viewer_width_natural = $(viewer).find('.cards').first()[0].scrollWidth;
			var pip_count =  Math.ceil( viewer_width_natural / $(viewer).find('.cards').first().outerWidth() - 0.1);
			var pips_html = '';
			if (pip_count > 1) {
				for (i=0;i<pip_count;i++) {
					pips_html += '<button class="pip"><span class="sr-only">Slide Set '+(i+1)+'</span></button>';
				}
				$(viewer).find('.next-prev button').show(); // also show Next and Prev buttons
			}
			else {
				$(viewer).find('.next-prev button').hide(); // only a single slide set is visible, so also hide Next and Prev buttons
			}
			$(viewer).find('.pips').html(pips_html);
		
			
			previous_pip_raw = active_pip_raw;
			previous_pip = active_pip;
			active_pip = 0;
			if (scroll_target > 0) {
				
				/* previous version of pip calculation ---
				active_pip = ((scroll_target / viewer_scroll_limit) * pip_count).toFixed(1);
				if (pip_count - active_pip <= 1 ) {
					active_pip = Math.floor(active_pip) - 1;
				}
				else {
					active_pip = Math.ceil(active_pip) - 1;
				}
				--- */
				
				/* new, more reliable pip calculation (Apr 2022) */
				var new_first_card = Math.round(scroll_target / card_width);
				if (cards_per_screen != 1) {
					new_first_card = new_first_card + 1;
				}
				active_pip_raw = new_first_card / cards_per_screen;
				if ( !even_sets && active_pip_raw > previous_pip_raw && pip_count - (Math.floor(previous_pip_raw)+1) == 1 ) {
					active_pip = Math.ceil(active_pip_raw);
				} 
				else {
					active_pip = Math.floor(active_pip_raw);
				}
				/* --- */
				
			}
			$(viewer).find('.pip').eq(active_pip).addClass('active');
		
			$(viewer).find('.pip').click(function(e) {
				var this_pip = $(this).index();
				var pip_change = 0;
				var change_direction = 'next';
				if (this_pip > active_pip) {
					pip_change = this_pip - active_pip;
				}
				else if (this_pip < active_pip) {
					pip_change = active_pip - this_pip;
					change_direction = 'prev';
				}
			
				var trigger_clicks = []; // a generic array used below to direct forEach() to call the jQuery trigger() function multiple times
				for (i=0;i<pip_change;i++) {
					trigger_clicks.push(0);
				}
				trigger_clicks.forEach(function(i) {
					$(viewer).find('.'+change_direction).trigger('click');
				});
			});
		
		}
		
		// Focus Detection (for keyboard and screen reader)
		// -- if cards have focusable elements within, the slider will ensure that these focus events coordinate with the UI (triggering slide sets and pips as needed)
		$(this).find('.card').attr('tabindex','-1');
		$(this).find('.card, .card *').on('focus', function(e) {
			
			if ( $(this).hasClass('card') ) {
				var this_card = $(this).index()+1;
			}
			else {
				var this_card = $(this).parents('.card').first().index()+1;
			}
			var trigger_pip = Math.ceil(this_card / cards_per_screen);
			$(viewer).find('.pip').eq(trigger_pip-1).trigger('click');
			
		});
 		
	});
	
	// Wesley Swipes (Touch Screen Logic)
	// -- if pep.js is loaded, vertical page scroll will be locked after horizontal panning begins
	$('.card-slider .cards').on('touchstart', function(e) {

		var this_viewer_band = $(this);
		var drag_detected = false;
		var start_x = e.originalEvent.touches[0].pageX;
		var start_y = e.originalEvent.touches[0].pageY;
		var start_drag = $(this).scrollLeft();
				
		$(this).on('touchmove', function(e) {
			
			// If the swipe intent seems more horizontal than vertical...
			if ( Math.abs(e.originalEvent.touches[0].pageX - start_x) > (Math.abs(e.originalEvent.touches[0].pageY - start_y)) ) {
				drag_detected = true;
			}
			// ...start dragging, synced to any further touchmoves
			if (drag_detected) {
				$(this_viewer_band).scrollLeft( start_drag + (start_x - e.originalEvent.touches[0].pageX) );
			}
		
		}).on('touchend', function(e) {
					
			if (drag_detected) {
				if	( start_x - e.originalEvent.changedTouches[0].pageX > 80  ) {
					$(this).parent().next('.next-prev').find('.next').trigger('click'); // swipe left
					$(this).off('touchmove touchend');
				}
				else if ( e.originalEvent.changedTouches[0].pageX - start_x > 80  ) {
					$(this).parent().next('.next-prev').find('.prev').trigger('click'); // swipe right
					$(this).off('touchmove touchend');
				}
				else {
					$(this_viewer_band).stop().animate({
						scrollLeft: start_drag
					}, 500, 'easeOutQuad');
				}
			}
				
		});
		
	});

});

