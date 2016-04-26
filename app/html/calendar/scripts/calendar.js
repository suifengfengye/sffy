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
				this.header = {};
				if(this.cfg.initSlideUp){
					this.isSlideUp = true;
					this.isSlideDown = false;
					this.header.isSlideUp = true;
				}else{
					this.isSlideUp = false;
					this.isSlideDown = true;
					this.header.isSlideUp = false;
				}

				this.initData();

				this.renderUI();

				//take tags
				if(this.cfg.tags.length > 0){
					this.takeTags(this.cfg.tags);
				}
				if(this.cfg.preTags.length > 0){
					this.takePreTags(this.cfg.preTags);
				}
				if(this.cfg.nextTags.length > 0){
					this.takeNextTags(this.cfg.nextTags);
				}


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

				//
				if(this.isSlideUp){
					this.slideUp();
				}


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
								html += '<span class="cal-pre" data-date="' + preIndex + '"><span>' + preIndex + '</span></span>';
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
								html += '<span class="cal-next" data-date="' + nextIndex + '"><span>' + nextIndex + '</span></span>';
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

				//上下折叠事件绑定
				me.$target.height(me.$target.height());
				this.$target.on('touchstart',  function(e){
					me.touch.moveY = me.touch.startY = e.touches[0].pageY;
				});

				this.$target.on('touchmove',  function(e){
					me.touch.moveY = e.touches[0].pageY;
					var distance = me.touch.moveY - me.touch.startY;

					me.slideCtrl(distance);

					me.touch.startY = me.touch.moveY;
				});

				this.$target.on('touchend',  function(e){
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
			//收起日历
			slideUp: function(){
				var me = this;
				//收起头部
				var headerHeight = me.$target.find('.cal-header').height();
				me.$target.css('top', (-headerHeight) + 'px');

				//设置日历主体高度
				var oneweekHeight = me.$target.find('.cal-oneweek').height(),
				 		bodyHeight = me.$target.find('.cal-day').height() + oneweekHeight;
				me.$target.height(bodyHeight + headerHeight);

				//定位选中日期所在的周
				var rowIndex = 0,
						prevRowHeight = 0;
				me.$target.find('.cal-oneweek').each(function(index){
					if($(this).find('.cal-curdate').length > 0){
						rowIndex = index;
						prevRowHeight = rowIndex * oneweekHeight;
						return;
					}
				});
				me.$target.find('.cal-date-wrap').css('top', -prevRowHeight + 'px');

			},
			//控制展开、收起
			slideCtrl: function(distance){
				var me = this;
				//折叠
				if(distance < 0 && !me.isSlideUp){
					//1 start -------------------------------------------------------------------------
					var headerTop = parseInt(me.$target.css('top').split('px')[0]),
							headerHeight = me.$target.find('.cal-header').height();
					//收起头部
					if(!me.header.isSlideUp){
						var ht = distance + headerTop;
						if(Math.abs(ht) < headerHeight){
							me.$target.css('top', ht + 'px');
						}else if(Math.abs(ht) >= headerHeight && Math.abs(headerTop) < headerHeight){
              me.$target.css('top', -headerHeight + 'px');
            }else{
							me.header.isSlideUp = true;
						}
					}
					//1 end -------------------------------------------------------------------------

					//2 start -------------------------------------------------------------------------
					var rowIndex = 0,
							prevRowHeight = 0,//在选中日期之前周高度的总和
							top = parseInt(me.$target.find('.cal-date-wrap').css('top').split('px')[0]),
							targetTop = parseInt(me.$target.css('top').split('px')[0]),
							oneweekHeight = me.$target.find('.cal-oneweek').height(),
							dayHeight = me.$target.find('.cal-day').height();
					//当前选中了第几行
					$('.cal-oneweek').each(function(index){
						if($(this).find('.cal-curdate').length > 0){
							rowIndex = index;
							prevRowHeight = rowIndex * oneweekHeight;
							return;
						}
					});

					//收起日历
					if(me.header.isSlideUp){
						var tp = distance + top;
						if(Math.abs(tp) < prevRowHeight){
							me.$target.find('.cal-date-wrap').css('top', tp + 'px');
							me.$target.height(me.$target.height() + distance);
						}else if(Math.abs(tp) >= prevRowHeight && Math.abs(top) < prevRowHeight){
              me.$target.find('.cal-date-wrap').css('top', -prevRowHeight + 'px');
							me.$target.height(me.$target.height() -(prevRowHeight - Math.abs(top)));
            }else if((me.$target.height() + targetTop) > (oneweekHeight + dayHeight)){
							if(me.$target.height() + targetTop + distance < oneweekHeight + dayHeight){
								me.$target.height(oneweekHeight + dayHeight - targetTop);
							}else{
								me.$target.height(me.$target.height() + distance);
							}
						}else{
							me.isSlideUp = true;
						}
					}
					//2 end -------------------------------------------------------------------------

					me.isSlideDown = false;

				}else if( distance > 0 && !me.isSlideDown){
					//展开body
					var top = parseInt(me.$target.find('.cal-date-wrap').css('top').split('px')[0]),
							tp = distance + top,
							targetTop = parseInt(me.$target.css('top').split('px')[0]),
							targetHeight = me.$target.height(),
							dateWrapHeight = me.$target.find('.cal-date-wrap').height(),
							dayHeight = me.$target.find('.cal-day').height();

					if(tp <= 0 && top < 0){
						me.$target.find('.cal-date-wrap').css('top', tp + 'px');
						me.$target.height(me.$target.height() + distance);
					}else if(tp > 0 && top > 0){
						me.$target.find('.cal-date-wrap').css('top', '0px');
						me.$target.height(me.$target.height() + Math.abs(top));
					}else if((me.$target.height() - Math.abs(targetTop)) < dateWrapHeight + dayHeight){
						if(me.$target.height() - Math.abs(targetTop) + distance >= dateWrapHeight + dayHeight){
							me.$target.height(dateWrapHeight + dayHeight + Math.abs(targetTop));
						}else{
							me.$target.height(me.$target.height() + distance);
						}
					}else if(me.header.isSlideUp){//展开header
							var ht = distance + targetTop;
							if(targetTop <= 0 && ht <= 0){
								me.$target.css('top', ht + 'px');
							}else if(targetTop <= 0 && ht > 0){
								me.$target.css('top', '0px');
								me.header.isSlideUp = false;
							}else{
								me.header.isSlideUp = false;
							}
					}else{
						me.isSlideDown = true;
					}
					me.isSlideUp = false;
				}
			},
			//打红点
			takeTags: function(dates){
				var me = this;
				if(dates instanceof Array){
					for(var i in dates){
						me.$target.find('.cal-date[data-date="' + dates[i] + '"]').addClass('cal-tag');
					}
				}
			},
			//取消红点
			cancleTags: function(dates){
				var me = this;
				for(var i in dates){
					me.$target.find('.cal-date[data-date="' + dates[i] + '"]').removeClass('cal-tag');
				}
			},
			//打红点
			takePreTags: function(dates){
				var me = this;
				if(dates instanceof Array){
					for(var i in dates){
						me.$target.find('.cal-pre[data-date="' + dates[i] + '"]').addClass('cal-tag');
					}
				}
			},
			//取消红点
			canclePreTags: function(dates){
				var me = this;
				for(var i in dates){
					me.$target.find('.cal-pre[data-date="' + dates[i] + '"]').removeClass('cal-tag');
				}
			},
			//打红点
			takeNextTags: function(dates){
				var me = this;
				if(dates instanceof Array){
					for(var i in dates){
						me.$target.find('.cal-next[data-date="' + dates[i] + '"]').addClass('cal-tag');
					}
				}
			},
			//取消红点
			cancleNextTags: function(dates){
				var me = this;
				for(var i in dates){
					me.$target.find('.cal-next[data-date="' + dates[i] + '"]').removeClass('cal-tag');
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
		startDay: 0,  //星期几作为第一列，周天：0，周一～周六：1～6，默认从星期天开始
		initSlideUp: true, //是否初始化就是折叠的日历
		tags: [],    //给当前月的日期打红点
		preTags: [],  //给前一个月的日期打红点
		nextTags: [] //给下一个月的日期打红点
	};

})(window, Zepto);
