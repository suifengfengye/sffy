/**
* @desc 图片预览
* @author jianfeng_huang
* @date 20160426 14:27
*/
(function(window, $){

  var Preview = (function(ele, settings){

      //preview对象
      var preview = function(ele, settings){
          this.$target = $(ele);
          this.init(settings);
      };

      //preview方法
      preview.prototype = {
        init: function(settings){
          this.cfg = {};
  				$.extend(true, this.cfg, $.fn.preview.default);
  				$.extend(true, this.cfg, settings);
        }
      };

      return preview;
  })();

  $.fn.preview = function(){
    return this.each(function(){
      var instance = $(this).data('instance');
      if(!instance){
        instance = new Preview(this, settings);
        $(this).data('instance', instance);
      }
    });
  };

  //设置
  $.fn.preview.defaults = {

  };

})(window, Zepto);
