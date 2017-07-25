var WXTOKEN = {};
var menuConfig = '{\
                    "button":[\
                        {\
                            "type":"view",\
                            "name":"在线报名",\
                            "url":"http://wwwv.applinzi.com/dist/app/index.php#apply"\
                        },\
                        {\
                            "type":"view",\
                            "name":"在线筛查",\
                            "url":"http://wwwv.applinzi.com/dist/app/index.php#home"\
                        },\
                        {\
                            "name":"需要帮助",\
                            "sub_button":[\
                                {\
                                    "type":"view",\
                                    "name":"激活账号",\
                                    "url":"http://wwwv.applinzi.com/dist/app/index.php#user-active"\
                                },\
                                {\
                                    "type":"view",\
                                    "name":"忘记密码",\
                                    "url":"http://wwwv.applinzi.com/dist/app/index.php#user-forgotpassword"\
                                }]\
                        }]\
                }';
var infoFromURL = utils.getInfoFromURL(location.href);
var CODE = infoFromURL.param.code;
var wxId = infoFromURL.param.wxId;
var pathUrl = infoFromURL.path;
$("#pathUrl").val(pathUrl);

var API = {
  apiSwitcher: 0,
  useProxy: true,
  hostList: [infoFromURL.host, 'http://localhost:8089/', 'http://192.168.1.105:8080/']
};
API.switchHost = function (pathArr) {
  var url = '';
  var host = API.hostList[API.apiSwitcher];
  var path = pathArr[(API.apiSwitcher === 1 ? 1 : 0)];
  if (API.useProxy && API.apiSwitcher !== 1) {
    var proxyHost = pathUrl;
    url = proxyHost + pathArr[1].replace(/controller/, 'proxy') + '?proxy=' + host + 'cmserverWeixin/' + path;
  }
  if (API.apiSwitcher === 0 || API.apiSwitcher === 1) {
    url = pathUrl + path;
  }
  return url;
};
//在线报名
API.apply = {
  checkMobile: {
    url: API.switchHost(['restWeixin/user/checkMobile', 'dist/action/controller/apply/checkMobile.php']),
    params: ['mobile', 'useType']
  },
  sendMessage: {
    url: API.switchHost(['restWeixin/userInfo/sendMessage', 'dist/action/controller/apply/sendMessage.php']),
    params: ['mobile']
  },
  checkIdcard: {
    url: API.switchHost(['restWeixin/user/checkIdcard', 'dist/action/controller/apply/checkIdcard.php'])
  },
  street: {
    url: API.switchHost(['restWeixin/dict/parTypesByModuleId', 'dist/action/controller/apply/street.php'])
  },
  save: {
    url: API.switchHost(['restWeixin/user/save', 'dist/action/controller/apply/save.php'])
  }
};
//激活
API.userActive = {
  activated: {
    url: API.switchHost(['restWeixin/user/activated', 'dist/action/controller/apply/activated.php']),
    params: ['mobile', 'password', 'confirmPassword', 'verificationCode']
  }
};
//获取用户的openId
API.user = {
  getOpenId: {
    url: API.switchHost(['restWeixin/pageToken/getCode', 'dist/action/controller/apply/getCode.php']),
    params: ['code']
  },
  findPassword: {
    url: API.switchHost(['restWeixin/user/findPassword', 'dist/action/controller/apply/getCode.php']),
    params: ['verificationCode', 'newPassword', 'confirmPassword', 'mobile']
  }
};

//var SESSION = {
// id: null,
//  expires: null
//};
var listeners = {};
$(function () {
  var pageManager = {
    $container: $('#container'),
    loginUrl: API.hostList[API.apiSwitcher] + 'checkLogin.php',
    deffered: {
      success: null,
      fail: null,
      then: function (successFn, failFn) {
        pageManager.deffered.success = successFn;
        pageManager.deffered.fail = failFn;
      }
    },
    _pageStack: [],
    //_configs: [],
    _pageAppend: function () {
    },
    _defaultPage: null,
    _pageIndex: 1,
    setDefault: function (defaultPage) {
      this._defaultPage = defaultPage || 'home';
      return this;
    },
    setPageAppend: function (pageAppend) {
      this._pageAppend = pageAppend;
      return this;
    },
    beforeInit: function () {
      var self = this;
      //获取用户openId

      if (CODE && !wxId) {
        pageManager.ajaxManager({
          url: API.user.getOpenId.url,
          type: 'get',
          data: {
            code: CODE
          },
          success: function (res) {
            if (res.code == 0) {
              var id = res.data.WXId;
              $('#wxId').val(id);
              window.wxId = id;
              self.init();
            } else {
              self.showTooltip("微信绑定数据异常！请返回主页从新登录！错误代码：1", "error");
            }
          },
          fail: function () {
            self.showTooltip("微信绑定超时数据异常！请返回主页从新登录！错误代码：2", "error");
          }
        })();
      } else if (wxId) {
        $('#wxId').val(wxId);
        window.wxId = wxId;
        self.init();
        return this;
      } else {
        self.showTooltip("微信绑定数据异常！请返回主页从新登录！错误代码：3", "error");
        // self.init();
      }
      return this;

    },
    init: function () {
      var self = this;

      $(window).on('hashchange', function (event) {
        var state = history.state || {};
        var page = utils.getInfoFromURL().hash || self._defaultPage;

        function watchURL(oldURL, newURL) {
          var isRefresh = false;
          var splits = newURL.split('#');
          var reg = /v=[^&]+(?:&|$)/g;
          var match = splits[1].match(reg);
          if (match) {
            isRefresh = true;
            splits[1] = splits[1].replace(reg, '');
            splits[0] = splits[0].replace(reg, '');
            splits[0] = splits[0].replace(/code=[^&]+(?:&|$)/g, '');
            splits[0] = splits[0].replace(/wxId=[^&]+(?:&|$)/g, '');
            splits[0] = splits[0] + '&' + match[0] + '&wxId=' + wxId + '&';
            splits[0] = splits[0].replace(/(?:&&)+/g, '&');
            splits[0] = splits[0].replace(/(\?&)+/g, '?');
            location.href = splits.join('#');
          }
          return isRefresh;
        }

        if (watchURL(event.oldURL, (event.newURL || location.href))) {
          return;
        }
        if (state._pageIndex <= self._pageIndex || self._findInStack(page)) {
          var remanentPagesLength = self._pageStack.length;
          var pagesArr = [], _page;
          while (remanentPagesLength--) {
            _page = self._pageStack[remanentPagesLength].page;
            pagesArr.push(_page);
            if (_page === page) {
              break;
            }
          }
          pagesArr.shift();
          for (var i = 0; i < pagesArr.length; i++) {
            self._back(pagesArr[i]);
          }
        } else {
          self._go(page);
        }
      });

      if (history.state && history.state._pageIndex) {
        this._pageIndex = history.state._pageIndex;
      }

      this._pageIndex--;

      var page = utils.getInfoFromURL().hash || self._defaultPage;
      self._go(page);
      return this;
    },
    showTooltip: function (msg, type) {
      type = type || 'error';
      var $tooltips = $('.js_tooltips');
      var showType = 'wait';
      if (type === 'error') {
        $tooltips.removeClass('weui-toptips_success');
        $tooltips.addClass('weui-toptips_error');
      }
      if (type === 'success') {
        $tooltips.removeClass('weui-toptips_error');
        $tooltips.addClass('weui-toptips_success');
      }
      if ($tooltips.css('display') != 'none') return;
      // toptips的fixed, 如果有`animation`, `position: fixed`不生效
      $('.page.cell').removeClass('slideIn');
      if (showType === 'wait' && $tooltips.css('display') === 'none') {
        $tooltips.text(msg);
        $tooltips.css('display', 'block');
        setTimeout(function () {
          $tooltips.css('display', 'none');
        }, 6000);
      }
    },
    ajaxManager: function (cfg) {
      var self = this;
      return function (e) {
        var pathURL = $('#pathUrl').val();

        function getSendData(data) {
          var result = null;
          var formElement = $(cfg.form) || $('#container').children().last().find('form');
          if (data) {
            if (Object.prototype.toString.call(data) === '[object Object]') {
              result = $.extend({}, {}, cfg.data);
            }
          } else {
            if (formElement.length !== 0) {
              result = $.extend({}, {}, formElement.serializeObject());
            }
          }
          return result;
        }

        function getSuccessHandler(cfg) {
          var fn;
          if (cfg.success) {
            fn = cfg.success;
          } else if (cfg.successResult) {
            fn = cfg.successResult;
          } else {
            fn = null;
          }
          return function (res) {
            if (res.code === 5008 || res.code === 5010 || res.code === 5007 || res.code === 5009) {
              self.securityVerification(res);
            } else {
              fn && fn(res);
            }
          };
        }

        function getErrorHandler(cfg) {
          if (cfg.fail) {
            return function (ex) {
              if (ex.responseText.match(/^\s*\[|{/)) {
                JSON.parse(ex.responseText);
              }
              console.error(ex);
              cfg.fail(ex);
            };
          } else {
            return function (ex) {
              pageManager.showTooltip('数据请求超时或者异常！请重试！');
              console.error(ex)
            };
          }
        }

        $.ajax({
          url: cfg.url || pathURL + cfg.pathUrl,
          type: cfg.type || 'post',
          data: getSendData(cfg.data),
          dataType: cfg.dataType || 'json',
          success: getSuccessHandler(cfg),
          error: getErrorHandler(cfg)
        });
        return this;
      }
    },
    clearPageStack: function (exceptPage) {
      var self = this;
      var newStack = [];
      var isAll = exceptPage === 'allPages';
      var containerChildren = $('#container').children();
      // 如果只剩一个login则返回
      if ((containerChildren.length === 1 && containerChildren.eq(0).hasClass('"' + exceptPage + '"'))
        || (self._pageStack.length === 1 && self._pageStack[0].page === exceptPage)) {
        return;
      }
      containerChildren.each(function (i, e) {
        if (isAll || !$(e).hasClass('"' + exceptPage + '"')) {
          $(e).remove();
        }
      });
      self._pageStack.forEach(function (e, i) {
        if (isAll && e.page === exceptPage) {
          newStack.push(e);
        }
      });
      self._pageStack = newStack;
    },
    securityVerification: function (res) {
      var self = this;
      self.clearPageStack('login');
      location.hash = 'login';
      var msg = res.message;
      //In addition to exit the other state
      if (res.code != 5009) {
        if ("" != msg) {
          self.showTooltip(msg, 'error');
        }
      }
    },
    getCookie: function (key) {
      var reg = /([^=]*)=([^=]*)(?:;|$)/g;
      var result = document.cookie.match(reg);
      var obj = {};
      if (result) {
        result.forEach(function (v) {
          var d = reg.exec(v);
          var key = d[1];
          var value = d[2];
          obj[key] = value;
        });
      }
      return obj[key];
    },
    setCookie: function (key, value) {
      document.cookie = key + '=' + value;
    },
    checkLogin: function (checkType) {
      var self = this;
      if (checkType === 'remote') {
        var config = {
          url: this.loginUrl,
          type: 'get',
          data: {
            openID: '',
            phoneNum: self.getCookie('phoneNum')
          },
          success: function (res) {
            self.deffered.success(res);
          },
          fail: function (ex) {
            self.deffered.fail(ex);
          }
        };
        setTimeout(function () {
          self.ajaxManager(config)();
        }, 0);
      }
      if (checkType === 'local') {
        var cookie = document.cookie;
        if (/SESSION/.test(cookie)) {
          self.deffered.success({login: 'logged'});
        } else {
          self.deffered.fail(ex);
        }
      }
      return this.deffered;
    },
    go: function (to) {
      if (!to) {
        return;
      }
      location.hash = to;
    },
    getPageHtml: function (page, callback, fail) {
      $.ajax({
        url: 'fragment/' + page + '.html?V=' + Math.random(),
        dataType: 'html',
        success: function (html) {
          callback(html);
        },
        error: function (ex) {
          fail(ex)
          console.log(ex);
        }
      });
    },
    compileHtml: function (html, page) {
      var $html = $(html);
      $html = $html.map(function (i, e) {
        if (e instanceof HTMLScriptElement && $(e).attr('id') && $(e).attr('id').indexOf('pageCfg') !== -1) {
          var _page = '".page-' + page + ' .page"';
          return $('<script>$(function(){' + $(e).text() + ';pageCfg.template = $(' + _page + ').html();$(' + _page + ').html(utils.getPageSegment(pageCfg));(pageCfg.afterRenderPage && pageCfg.afterRenderPage());_validator.init(".page-' + page + ' form");});<\/script>')[0];
        } else {
          return e;
        }
      });
      return $('<section class="page-' + page + '"><\/section>').append($html);
    },
    _go: function (page) {
      var self = this;
      this._pageIndex++;
      history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);
      var pageId = Math.random().toString().replace('0\.', '');
      var stackItem = {page: page, dom: null, id: pageId};
      self._pageStack.push(stackItem);
      this.getPageHtml(page, function (html) {
        var $html = self.compileHtml(html, page);
        $html.find('.page').addClass('slideIn').addClass(page);
        $html.on('animationend webkitAnimationEnd', function () {
          $html.find('.page').removeClass('slideIn').addClass('js_show');
        });
        var titleContent = $html.find('[name = title]').val();
        change_title(titleContent);
        $(document).off("click", "#login");
        self.$container.append($html);
        stackItem.dom = $html;
      }, function () {
        for (var i = 0; i < self._pageStack.length; i++) {
          if (self._pageStack[i].id === pageId) {
            self._pageStack.splice(i, 1);
          }
        }
      });

      return this;
    },
    back: function () {
      history.back();
    },
    _back: function (page) {
      this._pageIndex--;
      var self = this;
      var stack = this._pageStack.pop();
      if (!stack) {
        return;
      }

      var found = this._findInStack(utils.getInfoFromURL().hash);
      if (!found) {
        var pageId = Math.random().toString().replace('0\.', '');
        var stackItem = {page: page, dom: null, id: pageId};
        self._pageStack.push(stackItem);
        this.getPageHtml(page, function (html) {
          var $html = self.compileHtml(html, page);
          $html.find('.page').addClass('js_show').addClass(page);
          var titleContent = $html.find('[name = title]').val();
          change_title(titleContent);
          $html.insertBefore(stack.dom);
          stackItem.dom = $html;
        }, function () {
          for (var i = 0; i < self._pageStack.length; i++) {
            if (self._pageStack[i].id === pageId) {
              self._pageStack.splice(i, 1);
            }
          }
        });
      } else {
        var titleContent = self._pageStack[(self._pageStack.length - 1)].dom.find('[name = title]').val();
        change_title(titleContent);
      }

      stack.dom.find('.page').addClass('slideOut').on('animationend webkitAnimationEnd', function () {
        stack.dom.remove();
      });

      return this;
    },
    _findInStack: function (page) {
      var found = null;
      for (var i = 0, len = this._pageStack.length; i < len; i++) {
        var stack = this._pageStack[i];
        if (stack.page === page) {
          found = stack;
          break;
        }
      }
      return found;
    },
    _bind: function (page) {
      var events = page.events || {};
      for (var t in events) {
        for (var type in events[t]) {
          this.$container.on(type, t, events[t][type]);
        }
      }
      page.isBind = true;
    }
  };
  $('#container').click(function (e) {
    var target = $(e.target).closest('.js-router');
    var router;
    if (target.length > 0) {
      router = target.data('router');
      window.pageManager.go(router);
    }
  });


  function fastClick() {
    var supportTouch = function () {
      try {
        document.createEvent("TouchEvent");
        return true;
      } catch (e) {
        return false;
      }
    }();
    var _old$On = $.fn.on;

    $.fn.on = function () {
      if (/click/.test(arguments[0]) && typeof arguments[1] == 'function' && supportTouch) { // 只扩展支持touch的当前元素的click事件
        var touchStartY, callback = arguments[1];
        _old$On.apply(this, ['touchstart', function (e) {
          touchStartY = e.changedTouches[0].clientY;
        }]);
        _old$On.apply(this, ['touchend', function (e) {
          if (Math.abs(e.changedTouches[0].clientY - touchStartY) > 10) return;

          e.preventDefault();
          callback.apply(this, [e]);
        }]);
      } else {
        _old$On.apply(this, arguments);
      }
      return this;
    };
  }

  function preload() {
    $(window).on("load", function () {
      var imgList = [
        "./images/layers/content.png",
        "./images/layers/navigation.png",
        "./images/layers/popout.png",
        "./images/layers/transparent.gif"
      ];
      for (var i = 0, len = imgList.length; i < len; ++i) {
        new Image().src = imgList[i];
      }
    });
  }

  function androidInputBugFix() {
    // .container 设置了 overflow 属性, 导致 Android 手机下输入框获取焦点时, 输入法挡住输入框的 bug
    // 相关 issue: https://github.com/weui/weui/issues/15
    // 解决方法:
    // 0. .container 去掉 overflow 属性, 但此 demo 下会引发别的问题
    // 1. 参考 http://stackoverflow.com/questions/23757345/android-does-not-correctly-scroll-on-input-focus-if-not-body-element
    //    Android 手机下, input 或 textarea 元素聚焦时, 主动滚一把
    if (/Android/gi.test(navigator.userAgent)) {
      window.addEventListener('resize', function () {
        if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
          window.setTimeout(function () {
            document.activeElement.scrollIntoViewIfNeeded();
          }, 0);
        }
      })
    }
  }

  function setJSAPI() {
    var option = {
      title: '博奥颐和健康管理',
      desc: '博奥颐和健康管理',
      link: API.hostList[API.apiSwitcher],
      imgUrl: '#'
    };

    //获取ticket
    $.ajax({
      type: 'post',
      dataType: 'json',
      url: '../../movieEnglishService/getSignature.php?url=' + encodeURIComponent(location.href.split('#')[0]),
      success: function(res){
        WXTOKEN = res;
        wx.config({
          beta: true,
          debug: false,
          appId: res.appid,
          timestamp: res.timestamp,
          nonceStr: res.nonceStr,
          signature: res.signature,
          jsApiList: [
            //'onMenuShareTimeline',
            //'onMenuShareAppMessage',
            //'onMenuShareQQ',
            //'onMenuShareWeibo',
            //'onMenuShareQZone',
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'onVoicePlayEnd',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'translateVoice',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
          ]
        });
      },
      error: function(ex){
        console.log(ex.responseText);
      }
    });

    wx.ready(function () {
      wx.invoke('setNavigationBarColor', {
        color: 'red'
      });

      wx.invoke('setBounceBackground', {
        'backgroundColor': '#F8F8F8',
        'footerBounceColor': '#F8F8F8'
      });
      wx.onMenuShareTimeline(option);
      wx.onMenuShareQQ(option);
      wx.onMenuShareAppMessage({
        title: '博奥颐和健康管理',
        desc: '健康管理平台',
        link: location.href,
        imgUrl: '#'
      });

      //getMenu();
    });

    //function getMenu() {
    //  $.ajax({
    //    url: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + ACCESS_TOKEN,
    //    type: 'post',
    //    data: {
    //      body: encodeURIComponent(menuConfig)
    //    },
    //    success: function (res) {
    //      console.log(res)
    //    },
    //    error: function (ex) {
    //      console.log(ex);
    //    }
    //  });
    //}

    // });
  }

  function setPageManager() {
    var pages = {
      home: {
        name: 'home',
        template: '#tpl_home',
        url: '#'
      }
    };
    var winH = $(window).height();
    pageManager.setPageAppend(function ($html) {
      var $foot = $html.find('.page__ft');
      if ($foot.length < 1) return;

      if ($foot.position().top + $foot.height() < winH) {
        $foot.addClass('j_bottom');
      } else {
        $foot.removeClass('j_bottom');
      }
    })
      .setDefault('home')
      .beforeInit();
  }


  function init() {
    preload();
    fastClick();
    androidInputBugFix();
    setJSAPI();
    setPageManager();

    window.pageManager = pageManager;
    window.home = function () {
      location.hash = '';
    };
  }

  init();
});
