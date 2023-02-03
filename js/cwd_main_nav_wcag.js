jQuery(document).ready(function ($) {
	function menuResizeChecks() {
		// Mobile Nav
		if (window.innerWidth <= mobile_breakpoint) {
			let partentmenuitems = document.querySelectorAll("#main-navigation li.menu-item.parent");
			partentmenuitems.forEach((parent) => {
				parent.removeEventListener('mouseenter', handleMainNavMouseEnter)
				parent.removeEventListener('mouseleave', handleMainNavMouseExit);
				if (parent.classList.contains("children")) {
					let childul = e.srcElement.querySelector(".children");
					childul.style.display = null;
				}
			});
		} else {
			let partentmenuitems = document.querySelectorAll("#main-navigation li.menu-item.parent");
			partentmenuitems.forEach((parent) => {
				parent.addEventListener('mouseenter', handleMainNavMouseEnter)
				parent.addEventListener('mouseleave', handleMainNavMouseExit);
			});
		}
	}

	function handleMainNavMouseEnter(e) {
		let childul = e.srcElement.querySelector(".children");
		childul.style.display = null;
		window.addEventListener('keyup', handleManNavKeyUp);
	}

	function handleMainNavMouseExit(e) {
		let childul = e.srcElement.querySelector(".children");
		childul.style.display = null;
		window.removeEventListener('keyup', handleManNavKeyUp);
	}

	function handleManNavKeyUp(e) {
		// console.log("keyup");
		if (e.keyCode == 27) { // escape key
			let hovered = document.querySelector("li.menu-item.parent :hover");
			// console.log("escape key!");
			//if we have child ul element already just hide it
			if (hovered.classList.contains("children")) {
				hovered.style.display = "none";
			}
			//if we are on on the parent element meaning we have childern items then hide those 
			else if (hovered.nextElementSibling && hovered.nextElementSibling.classList.contains("children")) {
				hovered.nextElementSibling.style.display = "none";
			}
			window.removeEventListener('keyup', handleManNavKeyUp);
		}
	}

	window.addEventListener('resize', menuResizeChecks);
	menuResizeChecks();
});
