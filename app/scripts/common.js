/**
 * @desc 公共js
 * @requires 
 * @author jianfeng_huang
 * @date 2016-04-04
 */
(function(window){
	
	var html = document.documentElement;
	
	/* html ratio */
	var dpr = window.devicePixelRatio;
	if(dpr >= 1.5){
		dpr = 2;
	}
	html.setAttribute('data-dpr', dpr);
	
	/* set html font-size */
	var clientWidth = document.documentElement.clientWidth;
	html.style.fontSize = clientWidth/6.4 + 'px';
	
})(window);
