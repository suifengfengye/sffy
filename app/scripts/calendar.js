/**
 * @desc 日历插件
 * @requires zepto
 * @author jianfeng_huang
 * @date 2016-04-02 9:40
 */
(function(window, $){
	
	
	/*
	 * 日历类
	 * */
	var Calendar = (function(ele, settings){
		var calendar = function(ele, settings){
			this.$target = $(ele);
			this.init(settings);
		};
		calendar.prototype = {
			init: function(settings){
				this.cfg = $.fn.calendar.default;
				$.extend(this.cfg, settings);
				
				this.initData();
				
				this.renderUI();
			},
			//初始化参数
			initData: function(){
				this.year = this.cfg.curDate.getFullYear();
				this.month = this.cfg.curDate.getMonth() + 1;
				this.date = this.cfg.curDate.getDate();
				
				//显示在当前日历中的数据
				//TODO
			},
			//构件日历插件到框架
			renderUI: function(){
				var calHeader = '<div class="cal-header">\
						<span class="cal-premonth-arrow"></span>\
						<span class="cal-title"></span>\
						<span class="cal-nextmonth-arrow"></span>\
						<span class="cal-today-ico cal-today-ico-active">今</span>\
						</div>',
						calDay = this.getDayHtml(),
						calBody = '<div class="cal-date-wrap"></div>';
				this.$target.append(calHeader + calDay + calBody);
				this.$target.find('.cal-title').text(this.getTitle());
				if(!this.cfg.todayIco){
					this.$target.find('.cal-today-ico').hide();
				}
				
			},
			//生成日期
			renderDate: function(){
				
			},
			//获取x年x月（title显示）
			getTitle: function(){
				var year = this.year,
					month = this.month;
				month = month < 10 ? '0' + month : month;
				return year + '年'+ month + '月'; 
			},
			//获取day
			getDayHtml: function(){
				var dayArr = ['日', '一', '二', '三', '四', '五', '六'];
				var dayInnerHtml = '', startDayIndex = this.cfg.startDay, len = dayArr.length;
				for(var i = 0; i < len; i++){
					dayInnerHtml += '<span>' + dayArr[startDayIndex%len] + '</span>';
					startDayIndex ++;
				}
				return '<div class="cal-day">' + dayInnerHtml +'</div>';
			}
		};
		return calendar;
	})();
	
	/**
	 * 显示月份的对象
	 */
	var ShowMonth = {
		preDates: 0,
		nextDates: 0,
		lastDate: 30
	};
	
	//
	$.fn.calendar = function(settings){
		return $(this).each(function(){
			var me = $(this);
			var instance = me.data('instance');
			if(!instance){
				instance = new Calendar(this, settings);
				me.data('instance', instance);
			}
			return me;
		});
	};
	
	$.fn.calendar.default = {
		curDate: new Date(),//当前选中都日期，默认当天
		todayIco: true, //“今”都按钮是否显示，默认显示
		startDay: 0  //星期几作为第一列，周天：0，周一～周六：1～6，默认从星期天开始
	};
	
})(window, Zepto);
