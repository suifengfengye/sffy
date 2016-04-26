/**
 * @desc 日历插件
 * @requires zepto
 * @author jianfeng_huang
 * @date 2016-04-02 9:40
 */
(function(window, $){

	//月份中显示的日期数
	var MONTH_NUM = 42,
			WEEK_DATES = 7;

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
				this.cfg = {};
				$.extend(true, this.cfg, $.fn.calendar.default);
				$.extend(true, this.cfg, settings);

				this.touch = {};
				this.isSlideUp = false;
				this.isSlideDown = true;
				this.header = {};
				this.header.isSlideUp = false;

				this.initData();

				this.renderUI();

				this.initEvent();
			},
			//初始化参数
			initData: function(){
				this.year = this.cfg.curDate.getFullYear();
				this.month = this.cfg.curDate.getMonth();
				this.date = this.cfg.curDate.getDate();

				//显示在当前日历中的数据
				this.curShowMonth = this._getShowMonth(this.cfg.curDate);
			},
			//构件日历插件到框架
			renderUI: function(isRightIn){
				var calHeader = '<div class="cal-header">\
						<span class="cal-premonth-arrow"></span>\
						<span class="cal-title"></span>\
						<span class="cal-nextmonth-arrow"></span>\
						<span class="cal-today-ico cal-today-ico-active">今</span>\
						</div>',
						calDay = this.getDayHtml(),
						calBody = '<div class="cal-date-wrap"></div>';
				this.$target.children().remove();
				this.$target.append(calHeader + calDay + calBody);
				this.$target.find('.cal-title').text(this.getTitle());
				if(!this.cfg.todayIco){
					this.$target.find('.cal-today-ico').hide();
				}
				this.renderDate();
				var distance = '-110%';
				if(isRightIn){
					distance = '110%';
				}
				this.$target.css({'position': 'relative', 'left': distance});
				this.$target.animate({'left': '0%'}, 500);
			},
			//生成日期
			renderDate: function(){
				var html = '',
						startDay = this.cfg.startDay == undefined ? 0 : this.cfg.startDay % WEEK_DATES,
						index = 1,
						nextIndex = 1,
						preMonthLastDate = this._getPreMonthDate(this.cfg.curDate, false, true).getDate(),
						preIndex = preMonthLastDate - this.curShowMonth.preDates + 1 + startDay,
						d = new Date(),
						todayClass = '',
						curDayClass = '';
				//fixed preIndex
				if(preIndex > preMonthLastDate){
					preIndex -= WEEK_DATES;
				}

				for(var i = 0, len = MONTH_NUM/WEEK_DATES; i < len; i++){
					html += '<div class="cal-oneweek">';
					for(var j = 0; j < WEEK_DATES; j++){
							if(preIndex <= preMonthLastDate){
								html += '<span class="cal-date cal-pre" data-date="' + preIndex + '"><span>' + preIndex + '</span></span>';
								preIndex++;
							}else if(index <= this.curShowMonth.lastDate){
								if(index == d.getDate() && this.month == d.getMonth() && this.year == d.getFullYear()){
									todayClass = 'cal-today';
								}else{
									todayClass = '';
								}
								if(index == this.cfg.curDate.getDate()){
									curDayClass = 'cal-curdate';
								}else{
									curDayClass = '';
								}
								html += '<span class="cal-date ' + todayClass + ' '+ curDayClass + '" data-date="' + index + '"><span>' + index + '</span></span>';
								index++;
							}else{
								html += '<span class="cal-date cal-next" data-date="' + nextIndex + '"><span>' + nextIndex + '</span></span>';
								nextIndex++;
							}
					}
					html += '</div>';
				}

				this.$target.find('.cal-date-wrap').append(html);

			},
			//获取x年x月（title显示）
			getTitle: function(){
				var year = this.year,
					month = this.month + 1;
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
			},
			//更新日历
			update: function(d, isRightIn){
				this.year = d.getFullYear();
				this.month = d.getMonth();
				this.date = d.getDate();
				this.cfg.curDate = d;

				//显示在当前日历中的数据
				this.curShowMonth = this._getShowMonth(this.cfg.curDate);

				this.renderUI(isRightIn);
			},
			//绑定事件
			initEvent: function(){
				var me = this;
				//上一个月
				this.$target.on('tap', '.cal-premonth-arrow', function(){
					var preMonthDate = me._getPreMonthDate(me.cfg.curDate, false, false);
					me.update(preMonthDate);
				});
				this.$target.on('swipeRight', function(){
					var preMonthDate = me._getPreMonthDate(me.cfg.curDate, false, false);
					me.update(preMonthDate);
				});

				//下一个月
				this.$target.on('tap', '.cal-nextmonth-arrow', function(){
					var nextMonthDate = me._getNextMonthDate(me.cfg.curDate, false, false);
					me.update(nextMonthDate, true);
				});
				this.$target.on('swipeLeft', function(){
					var nextMonthDate = me._getNextMonthDate(me.cfg.curDate, false, false);
					me.update(nextMonthDate, true);
				});

				//今天
				this.$target.on('tap', '.cal-today-ico', function(){
					me.update(new Date());
				});

				//点击某一天
				this.$target.on('tap', '.cal-date', function(){
					var $this = $(this);
					$('.cal-date').removeClass('cal-curdate');
					$this.addClass('cal-curdate');

					//update date
					me.date = $this.find('span').text();
					if($this.hasClass('cal-pre')){
						me.month--;
						if(me.month < 0){
							me.year --;
							me.month = 11;
						}
						me.cfg.curDate = new Date(me.year, me.month, me.date);
						me.update(me.cfg.curDate);
					}else if($this.hasClass('cal-next')){
						me.month++;
						if(me.month > 11){
							me.year ++;
							me.month = 0;
						}
						me.cfg.curDate = new Date(me.year, me.month, me.date);
						me.update(me.cfg.curDate, true);
					}else{
						me.cfg.curDate = new Date(me.year, me.month, me.date);
					}
				});

				me.$target.height(me.$target.height());
				this.$target.on('touchstart',  function(e){
					console.log('touchstart');
					me.touch.moveY = me.touch.startY = e.touches[0].pageY;
				});

				this.$target.on('touchmove',  function(e){
					me.touch.moveY = e.touches[0].pageY;
					var distance = me.touch.moveY - me.touch.startY;

					me.slideCtrl(distance);

					me.touch.startY = me.touch.moveY;
				});

				this.$target.on('touchend',  function(e){
					console.log('touchend');
				});
			},
			//获取上一个月(取最后一天)
			_getPreMonthDate: function(d, isFirstDate, isLastDate){
				var y = d.getFullYear(),m = d.getMonth();
				if(m-1 < 0){
					y--;
					m = 11;
				}else{
					m--;
				}
				if(isFirstDate){
					return new Date(y, m, 1);
				}else if(isLastDate){
					return new Date(y, m + 1, 0);
				}else{
					return new Date(y, m, d.getDate());
				}
			},
			//获取下一个月(取最后一天)
			_getNextMonthDate: function(d, isFirstDate, isLastDate){
				var y = d.getFullYear(), m = d.getMonth();
				if((m + 1) > 11){
					y++;
					m = 0;
				}else{
					m++;
				}
				if(isFirstDate){
					return new Date(y, m, 1);
				}else if(isLastDate){
					return new Date(y, m + 1, 0);
				}else{
					return new Date(y, m, d.getDate());
				}
			},
			//获取当前一个月(取最后一天)
			_getCurMonthDate: function(d, isFirstDate, isLastDate){
				var y = d.getFullYear(), m = d.getMonth();
				if(isFirstDate){
					return new Date(y, m, 1);
				}else if(isLastDate){
					return new Date(y, m + 1, 0);
				}else{
					return new Date(y, m, d.getDate());
				}
			},
			//获取当前显示月份的信息，包括上一个显示了几点、当前月显示了几天、下一个显示了几天
			_getShowMonth: function(d){
				var showMonth = {};
				var firstDate = this._getCurMonthDate(d, true, false),
						dDay = firstDate.getDay(),
						lastDate = this._getCurMonthDate(d, false, true).getDate();
				showMonth.preDates = dDay;
				showMonth.nextDates = MONTH_NUM - dDay - lastDate;
				showMonth.lastDate = lastDate;
				return showMonth;
			},
			//控制展开、收起
			slideCtrl: function(distance){
				var me = this;
				//折叠
				if(distance < 0 && !me.isSlideUp){

					//收起头部
					if(!me.header.isSlideUp){
						var headerTop = me.$target.css('top').split('px')[0];
						var ht = distance + parseInt(headerTop),
                calHeaderHeight = me.$target.find('.cal-header').height();
						if(Math.abs(ht) < calHeaderHeight){
							me.$target.css('top', ht + 'px');
						}else if(Math.abs(ht) >= calHeaderHeight && Math.abs(headerTop) < calHeaderHeight){
              me.$target.css('top', -calHeaderHeight + 'px');
            }else{
							me.header.isSlideUp = true;
						}
					}

					//收起日历
					if(me.header.isSlideUp){
						//当前选中了第几行
						var rowIndex = 0;
						$('.cal-oneweek').each(function(index){
							if($(this).find('.cal-curdate').length > 0){
								rowIndex = index;
							}
						});

						var top = me.$target.find('.cal-date-wrap').css('top').split('px')[0];
						var tp = distance + parseInt(top);

						var targetTop = parseInt(me.$target.css('top').split('px')[0]);
						if(Math.abs(tp) < rowIndex * $('.cal-oneweek').height()){
							me.$target.find('.cal-date-wrap').css('top', tp + 'px');
							me.$target.height(me.$target.height() + distance);
						}else if(Math.abs(tp) >= rowIndex * $('.cal-oneweek').height() && Math.abs(top) < rowIndex * $('.cal-oneweek').height()){
              me.$target.find('.cal-date-wrap').css('top', -(rowIndex * $('.cal-oneweek').height()) + 'px');
							//me.$target.height(me.$target.height() -(rowIndex * $('.cal-oneweek').height()));
            }else if((me.$target.height() + targetTop) > $('.cal-oneweek').height() + me.$target.find('.cal-day').height()){
							me.$target.height(me.$target.height() + distance);
						}else{
							me.isSlideUp = true;
						}
					}
					me.isSlideDown = false;
				}else if( distance > 0 && !me.isSlideDown){
					//展开body
					var top = me.$target.find('.cal-date-wrap').css('top').split('px')[0];
					var tp = distance + parseInt(top);
					var targetTop = parseInt(me.$target.css('top').split('px')[0]);
					if(tp <= 0){
						me.$target.find('.cal-date-wrap').css('top', tp + 'px');
						me.$target.height(me.$target.height() + distance);
					}else if((me.$target.height() - Math.abs(targetTop)) < me.$target.find('.cal-date-wrap').height() + me.$target.find('.cal-day').height()){
						me.$target.height(me.$target.height() + distance);
					}else if(me.header.isSlideUp){//展开header
							var headerTop = me.$target.css('top').split('px')[0];
							var ht = distance + parseInt(headerTop);
							if(headerTop <= 0){
								me.$target.css('top', ht + 'px');
							}else{
								me.header.isSlideUp = false;
							}
					}else{
						me.isSlideDown = true;
					}
					me.isSlideUp = false;
				}
			}
		};
		return calendar;
	})();

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
		curDate: new Date(),//当前选中的日期，默认当天
		todayIco: true, //“今”都按钮是否显示，默认显示
		startDay: 0  //星期几作为第一列，周天：0，周一～周六：1～6，默认从星期天开始
	};

})(window, Zepto);
