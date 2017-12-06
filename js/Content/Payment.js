Axon.prototype.PaymentError = function (options) {
	if (typeof options == "number") {
		this.type = options;
		this.message = "";
		this.contents = options.contents || {};
	} else {
		this.type = options.type;
		this.message = options.message || "";
		this.contents = options.contents || {};
	}
};

Axon.prototype.PaymentError.prototype = new Error;



// Add the font awesome icons
var head = document.getElementsByTagName('head')[0];
var s = document.createElement('style');
s.setAttribute('type', 'text/css');
s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
head.appendChild(s);

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

	function add_styles() {
		$('.axon_modal_box').css({
			'position': 'absolute',
			'left': options.left,
			'top': options.top,
			'display': 'none',
			'height': options.height + 'px',
			'width': options.width + 'px',
			'border': '1px solid #fff',
			'box-shadow': '0px 2px 7px #292929',
			'-moz-box-shadow': '0px 2px 7px #292929',
			'-webkit-box-shadow': '0px 2px 7px #292929',
			'border-radius': '10px',
			'-moz-border-radius': '10px',
			'-webkit-border-radius': '10px',
			'background': '#f2f2f2',
			'z-index': '50',
		});
		/*Block page overlay*/
		var pageHeight = $(document).height();
		var pageWidth = $(window).width();

		$('.axon_block_page').css({
			'position': 'absolute',
			'top': '0',
			'left': '0',
			'background-color': 'rgba(0,0,0,0.6)',
			'height': pageHeight,
			'width': pageWidth,
			'z-index': '10'
		});
		$('.axon_inner_modal_box').css({
			'background-color': '#fff',
			'height': (options.height - 50) + 'px',
			'width': (options.width - 50) + 'px',
			'padding': '10px',
			'margin': '15px',
			'border-radius': '10px',
			'-moz-border-radius': '10px',
			'-webkit-border-radius': '10px'
		});
		// Button styling
		$('.axon_ok_button').css({
			'background-color': '#44c767',
			'-moz-border-radius': '28px',
			'-webkit-border-radius': '28px',
			'border-radius': '28px',
			'border': '1px solid #18ab29',
			'display': 'inline-block',
			'cursor': 'pointer',
			'color': '#ffffff',
			'font-family': 'Arial',
			'font-size': '14px',
			'padding': '7px 17px',
			'text-decoration': 'none',
			'text-shadow': '0px 1px 0px #2f6627'
		});
		$('head').append('<style>' +
			'.axon_ok_button:hover{background-color : #5cbf2a;}' +
			'.axon_ok_button:active{position:relative;top:1px;}' +
			'</style>');
		$('.axon_close_button').css({
			'background-color': '#eb461d',
			'-moz-border-radius': '28px',
			'-webkit-border-radius': '28px',
			'border-radius': '28px',
			'border': '1px solid #330606',
			'display': 'inline-block',
			'cursor': 'pointer',
			'color': '#ffffff',
			'font-family': 'Arial',
			'font-size': '14px',
			'padding': '7px 17px',
			'text-decoration': 'none',
			'text-shadow': '0px 1px 0px #1a0303'
		});
		$('head').append('<style>' +
			'.axon_close_button:hover{background-color : #e01010;}' +
			'.axon_close_button:active{position:relative;top:1px;}' +
			'</style>');
	}

	function add_block_page() {
		var block_page = $('<div class="axon_block_page"></div>');

		$(block_page).appendTo('body');
	}

	function add_popup_box() {
		var pop_up = $('<div class="axon_modal_box">' +
				'<div class="axon_inner_modal_box">' +
				'<p style="font-size:14px;font-style:bold;text-align: center;color:red">' + options.title + '</p>' +
				'<br/>' +
				'<p style="font-size:12px;">' + options.description + '</p></div></div>');
		$(pop_up).appendTo('.axon_block_page');
	}

	this.close = function () {
		$('.axon_modal_box').fadeOut().remove();
		$('.axon_block_page').fadeOut().remove();
	};

	add_block_page();
	add_popup_box();
	add_styles();

	$('.axon_modal_box').fadeIn();
};

