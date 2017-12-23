/**
 *  @file modalHeader.js
 *  @brief General purpose modal popup
 */

// Add the font awesome icons
var head = document.getElementsByTagName('head')[0];
var s = document.createElement('style');
s.setAttribute('type', 'text/css');
s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
head.appendChild(s);

s = document.createElement('style');
var btnCss = '.axon_ok_button:hover{background-color : #5cbf2a;}' +
	'.axon_ok_button:active{position:relative;top:1px;}' +
	'.axon_close_button:hover{background-color : #e01010;}' +
	'.axon_close_button:active{position:relative;top:1px;}';

var inputCss = '.axonInput { \
  display: inline-block; \
  -webkit-box-sizing: content-box; \
  -moz-box-sizing: content-box; \
  box-sizing: content-box; \
  padding: 10px 20px; \
  border: 3px solid #b7b7b7; \
  -webkit-border-radius: 3px; \
  border-radius: 3px; \
  font: normal 16px/normal "Times New Roman", Times, serif; \
  color: rgba(0,142,198,1); \
  -o-text-overflow: clip; \
  text-overflow: clip; \
  background: rgba(252,252,252,1); \
  -webkit-box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2) inset; \
  box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2) inset; \
  text-shadow: 1px 1px 0 rgba(255,255,255,0.66) ; \
  -webkit-transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1); \
  -moz-transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1); \
  -o-transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1); \
  transition: all 200ms cubic-bezier(0.42, 0, 0.58, 1); \
}';

var boxCss = '.axon_modal_box{ \
	position: fixed; \
	right: 0; \
	bottom: 0; \
	left: 50%; \
	top: 50%; \
	transform: translate(-25%, -25%); \
	display: none; \
	border: 1px solid #fff; \
	box-shadow: 0px 2px 7px #292929; \
	-moz-box-shadow: 0px 2px 7px #292929; \
	-webkit-box-shadow: 0px 2px 7px #292929; \
	border-radius: 10px; \
	-moz-border-radius: 10px; \
	-webkit-border-radius: 10px; \
	background: #f2f2f2; \
	z-index: 50; \
	}';

var innerBoxCss = '.axon_inner_modal_box{ \
	background-color: #fff; \
	padding: 10px; \
	margin: 15px; \
	border-radius: 10px; \
	-moz-border-radius: 10px; \
	-webkit-border-radius: 10px; \
	}';

/*Block page overlay*/
var pageHeight = $(document).height();
var pageWidth = $(window).width();

var pageCss = '.axon_block_page{' +
	"position: absolute;" +
	"top: 0;" +
	"left: 0;" +
	"background-color: rgba(0,0,0,0.6);" +
	"height: " + pageHeight + ";" +
	"width: " + pageWidth + ";" +
	"z-index: 10;" +
	"}";

s.appendChild(document.createTextNode(btnCss + boxCss + inputCss + pageCss + innerBoxCss));
head.appendChild(s);
