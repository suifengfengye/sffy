/**
 * @desc 日历插件　
 * @requires zepto
 * @author jianfeng_huang
 * @date 2016-03-29 23:17
 */
(function(window, $){

	var mainController = {
		data:{
			calendar: null
		},
		init: function(){
			this.initCalendar();
		},
		initCalendar: function(){
			var d = new Date();
			$('.cal-wrap').calendar({
				todayIco: true,
				startDay: 0,
				initSlideUp: false, //默认收起
				tags: [29, 20],
				preTags: [5, 30],
				nextTags: [2, 8]
				//,curDate: new Date(d.getFullYear(), -1, d.getDate() - 2)
			});
			//var calendar = $('.cal-wrap').data('instance');
			//calendar.takeTags([1, 2, 3]);
		}
	};

	window.mainController = window.mainController || mainController;
})(window, Zepto);
