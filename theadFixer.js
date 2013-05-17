/*
 * theadFixer
 * 
 * https://github.com/Mystist/theadFixer
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/theadFixer/blob/master/MIT-LICENSE.txt
 *
 */

(function($) {

  var methods = {

    init: function(options) {
      var defaults = {
        "bindResize": true,
        "overflow_x": "auto",
        "floatMode": false,
        "renderbetter": "auto"
      };
      var settings = $.extend(defaults, options);
      var theadFixer = new TheadFixer();
      theadFixer.$this = this;
      theadFixer.initialize(settings);
      return theadFixer;
    }

  };

  function TheadFixer() {
    this.$this = null;
    this.resizeTimer = null;
    this.overflow_x = null;
    this.floatMode = null;
    this.winWidth = $(window).width();
    this.winHeight = $(window).height();
    this.t1 = null;
    this.t2 = null;
    this.t3 = null;
    this.t4 = null;
    this.hasUsed = false;
  }

  TheadFixer.prototype = {

    constructor: TheadFixer,

    initialize: function(st) {
      this.overflow_x = st.overflow_x;
      this.floatMode = st.floatMode;
      //根据参数不同,判断渲染优化是否启用
      if(st.renderbetter == "auto" || st.renderbetter.toLowerCase() == "theadfixer")
	  {
    	  //如果渲染优化参数传递的是auto(自动启用)或者TheadFixer,那么此时启用渲染优化
      	  $(this.$this[0]).find("table,thead,tbody").hide();
      }
  	  this.built();
      if (st.bindResize) {
        this.bindResize();
      }
      $(this.$this[0]).find("table,thead,tbody").show();
    },

    built: function() {
      this.setTdWidth();
      this.builtHtml();
      this.setWidth();
      if(this.floatMode) {
        this.appendTheadAndSetPosition();
      }
      this.syncScrollBar();
      this.hasUsed = true;
    },

    setTdWidth: function() {

      var tThis = this;
      
      var tableWidth = 0;

      tThis.$this.find("thead tr").children().each(function(i) {

        var tWidth = "";
        if ($(this).attr("width")) {
          tWidth = $(this).attr("width");
          $(this).attr("thewidth", tWidth);
        } else {
          tWidth = $(this).width() + "px";
          $(this).attr("thewidth", "none").attr("width", tWidth);
        }
        tThis.$this.find("tbody tr:first td").eq(i).attr("width", tWidth);
        tableWidth += tWidth;
      });

      this.t3 = tThis.$this.find("table").css("table-layout");
      tThis.$this.find("table").css({
        "table-layout": "fixed",
        "width": tableWidth
      });

    },

    builtHtml: function() {

      var tThis = this;

      this.t1 = tThis.$this.find("table").attr("style");
      this.t2 = tThis.$this.find("table").attr("class");
      this.t4 = tThis.$this.find("table").css("border-top");

      tThis.$this.find("table").wrap('<div class="m_innerwrapper"></div>');

      tThis.$this.find("thead").unwrap().wrap('<table></table>');
      tThis.$this.find("tbody").wrap('<table></table>');
      
      tThis.$this.find("table:first").attr("style", this.t1).attr("class", this.t2).css("table-layout", "fixed");
      tThis.$this.find("table:last").attr("style", this.t1).attr("class", this.t2).css({
        "table-layout": "fixed",
        "border-top": "none"
       });

      tThis.$this.find("thead").parent().wrap('<div class="m_wrap" style="overflow:hidden;"></div>');

      var height = tThis.$this.children().height() - tThis.$this.find("table:first").outerHeight(true);
      tThis.$this.find("tbody").parent().wrap('<div class="m_wrapper" style="height:' + height + 'px; width: 100%; overflow-y:auto; overflow-x:' + tThis.overflow_x + '">');

    },
    
    setWidth: function() {

      var tThis = this;
      
      var fixNumber = 0;
      if (tThis.$this.find(".m_wrapper").height() < tThis.$this.find("table:last").outerHeight(true)) {
        fixNumber = 17;
      }
      tThis.$this.find("table:first").css("width", tThis.$this.find("table:first").width() - fixNumber + "px");
      tThis.$this.find("table:last").css("width", tThis.$this.find("table:last").width() + "px");

      var fixNumber2 = 0;
      if (tThis.$this.find(".m_wrapper").width() < tThis.$this.find("table:last").outerWidth(true) && fixNumber!=0) {
        fixNumber2 = 17;
      }
      tThis.$this.find(".m_wrap").css("width", tThis.$this.find(".m_wrapper").width() - fixNumber2 + "px");

    },
    
    appendTheadAndSetPosition: function() {
    
      var tThis = this;
      
      tThis.$this.find(".m_innerwrapper")
        .width(tThis.$this.find(".m_innerwrapper").width())
        .height(tThis.$this.find(".m_innerwrapper").height());
      
      tThis.$this.find(".m_wrapper").height(tThis.$this.children().height());
      
      tThis.$this.find(".m_wrap").css({
        "position": "absolute",
        "z-index": 1
      });
      
      tThis.$this.find(".m_wrapper").css({
        "position": "absolute",
        "z-index": 0
      });
      
      tThis.$this.find("table:last").css("border-top", tThis.t4);
      
      var el = tThis.$this.find("table:first thead")[0].outerHTML;
      
      tThis.$this.find("table:last").prepend(el);
    
    },
    
    removeTheadAndRevertPosition: function() {
    
      var tThis = this;

      tThis.$this.find("table:last").find("thead").remove();
      
      tThis.$this.find(".m_wrap").css({
        "position": ""
      });
      
      tThis.$this.find(".m_wrapper").css({
        "position": ""
      });
      
    },
    
    revertHtml: function() {

      var tThis = this;

      tThis.$this.find("tbody").parent().unwrap();
      tThis.$this.find("tbody").unwrap();
      tThis.$this.find("thead").parent().unwrap();
      tThis.$this.find("thead").unwrap();
      tThis.$this.find(".m_innerwrapper").wrapInner('<table style="' + this.t1 + '" class="' + this.t2 + '"></table>');
      tThis.$this.find("table").unwrap();

    },

    revertTdWidth: function() {

      var tThis = this;

      tThis.$this.find("thead tr").children().each(function(i) {
        if ($(this).attr("thewidth") == "none") {
          $(this).removeAttr("thewidth").removeAttr("width");
        } else {
          $(this).attr("width", $(this).attr("thewidth")).removeAttr("thewidth");
        }
        tThis.$this.find("tbody tr:first td").eq(i).removeAttr("width");
      });

      tThis.$this.find("table").css({
        "table-layout": this.t3,
        "width": ""
      });

    },

    syncScrollBar: function() {

      var tThis = this;

      tThis.$this.find(".m_wrapper").bind("scroll", function() {
        var first = tThis.$this.find(".m_wrap");
        var last = tThis.$this.find(".m_wrapper");
        if (first.scrollLeft() != last.scrollLeft()) {
          first.scrollLeft(last.scrollLeft());
        }
      });

    },

    bindResize: function() {

      var tThis = this;

      $(window).unbind("resize").resize(function() {

        var winNewWidth = $(window).width(),
          winNewHeight = $(window).height();

        if(Math.abs(tThis.winWidth-winNewWidth)>20 || Math.abs(tThis.winHeight-winNewHeight)>20) {
          clearTimeout(tThis.resizeTimer);
          tThis.resizeTimer = setTimeout(function() {
            tThis.revert();
            tThis.built();
          },
          200);
        }

        tThis.winWidth = winNewWidth;
        tThis.winHeight = winNewHeight;

      });

    },

    revert: function() {

      if(this.hasUsed) {
      
        if(this.floatMode) {
          this.removeTheadAndRevertPosition();
        }
        this.revertHtml();
        this.revertTdWidth();
        this.hasUsed = false;

      }

    }

  };

  $.fn.theadFixer = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('No ' + method + ' method.');
    }
  };

})(jQuery);