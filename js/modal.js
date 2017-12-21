/**
 *  @file modal.js
 *  @brief Modal popup dialog
 */
// Modal Popup
Axon.prototype.Modal = function (prop) {
	// Default parameters
	// Modified from here https://paulund.co.uk/how-to-create-a-simple-modal-box-with-jquery
	var options = $.extend({
			height: "250",
			width: "500",
			title: "",
			description: "",
			top: "20%",
			left: "30%",
		}, prop);
	var boxID = "" + Math.round( Math.random() * 10 ** 5);

	function add_styles() {
		$('#' + boxID).css({
			'height': options.height + 'px',
			'width': options.width + 'px'
		});

		$('#inner_' + boxID).css({
			'height': (options.height - 50) + 'px',
			'width': (options.width - 50) + 'px'
		});
	}

	function add_block_page() {
		var block_page = $('<div class="axon_block_page" id="page_' + boxID + '"></div>');

		$(block_page).appendTo('body');
	}

	function add_popup_box() {
		var pop_up = $('<div class="axon_modal_box" id="' + boxID + '">' +
				'<div class="axon_inner_modal_box" id="inner_' + boxID + '">' +
				'<p style="font-size:14px;font-style:bold;text-align: center;color:red">' + options.title + '</p>' +
				'<br/>' +
				'<p style="font-size:12px;">' + options.description + '</p></div></div>');
		$(pop_up).appendTo("#page_" + boxID);
	}

	this.close = function () {
		$("#" + boxID).fadeOut().remove();
		$("#page_" + boxID).fadeOut().remove();
	};

	add_block_page();
	add_popup_box();
	add_styles();

	$("#" + boxID).fadeIn();
};

