var pageManager = {
  pageRecorder: [],
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
            if (!location.href.match(/canNotGetWxId/)) {
              window.location.href = window.location.href + '?v=canNotGetWxId';
            }
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
        var formElement = cfg.form ? $(cfg.form) : $('#container').children().last().find('form');
        if (data) {
          if (Object.prototype.toString.call(data) === '[object Object]') {
            result = $.extend({}, {wxId: window.wxId}, cfg.data);
          } else if (typeof data === 'string') {
            result = data;
          }
        } else {
          if (formElement.length !== 0) {
            result = $.extend({}, {wxId: window.wxId}, formElement.serializeObject());
          } else {
            result = $.extend({}, {wxId: window.wxId});
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
  clearPageStack: function (pageName, isContain, notReturn) {
    var self = this;
    var newStack = [];
    var isAll = pageName === 'allPages';
    var containerChildren = $('#container').children('section');
    // 如果只剩一个login则返回
    if (!notReturn &&
      ((containerChildren.length === 1 && containerChildren.eq(0).hasClass('"' + pageName + '"')) || (self._pageStack.length === 1 && self._pageStack[0].page === pageName))
    ) {
      return;
    }
    containerChildren.each(function (i, e) {
      var hasClass = $(e).hasClass('page-' + pageName);
      if (isAll || (isContain ? hasClass : !hasClass)) {
        $(e).remove();
      }
    });
    self._pageStack.forEach(function (e, i) {
      var isEqual = e.page === pageName;
      if (!(isAll || (isContain ? isEqual : !isEqual))) {
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
        //添加自定义的选择框ios除外
        $('.page-' + page).find('select').each(function (i, e) {
          var selectWrapperElement, componentCfg;
          selectWrapperElement = $(e).closest('[data-component*=yy-select]');
          if (selectWrapperElement.length === 0) {
            $(e).parent().attr('data-component', 'yy-select');
            selectWrapperElement = $(e).closest('[data-component*=yy-select]');
          }
          componentCfg = selectWrapperElement.data('component');
          $(e).parent().addClass('weui-cell-mask');
          if (!$(e).prev()[0] || $(e).prev()[0].tagName.toUpperCase() !== 'EM') {
            $('<em></em>').insertBefore($(e));
          }
          if (utils.getDeviceInfo().isIphone) {
            if (!componentCfg || !componentCfg.disabled) {
              try {
                selectWrapperElement.find('.weui-cell-mask em').remove();
              } catch (ex) {
                console.log(ex)
              }
            }
          }
        });

      },
      error: function (ex) {
        fail(ex)
        console.log(ex);
      }
    });
  },
  compileHtml: function (html, page) {
    var $html, scripts;
    if (/beforeRenderPage/.test(html)) {
      html = html.replace(/(class="page[^"]+)"/, '$1 hidden"');
    }
    $html = $(html);
    scripts = [];
    $html = $html.map(function (i, e) {
      if (e instanceof HTMLScriptElement && $(e).attr('id') && $(e).attr('id').indexOf('pageCfg') !== -1) {
        var _page = '".page-' + page + ' .page"';
        var scriptSrc = $(e).attr('src');
        if (scriptSrc) {
          scripts.push({
            type: 'src',
            content: scriptSrc
          });
        } else {
          scripts.push({
            type: 'string',
            content: $(e).text()
          });
        }
        function getOtherScriptStr() {
          var innerScript = $(e).text();
          var scriptStr = '';
          var additionalScript = ';\n pageCfg.template = $(' + _page + ').html()'
            + ';\n $(' + _page + ').html(utils.getPageSegment(pageCfg))'
            + ';\n (pageCfg.afterRenderPage && pageCfg.afterRenderPage())'
            + ';\n _validator.init(".page-' + page + ' form")';
          if (/beforeRenderPage/.test(innerScript)) {
            scriptStr = '<script>$(function(){'
              + innerScript
              + '$.when(pageCfg.beforeRenderPage())'
              + '.then('
              + 'function(res){\n $(' + _page + ').removeClass("hidden");' + additionalScript + '},'
              + 'function(ex){\n  setTimeout(function(){pageManager.clearPageStack("' + page + '",true,true);},0);console.log("服务器错误");})'
              + ';});<\/script>';
          } else {
            scriptStr = '<script>$(function(){'
              + innerScript
              + additionalScript
              + ';\n });<\/script>';
          }
          return scriptStr;
        }

        return $(getOtherScriptStr())[0];
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
    //添加进度图标缓冲视觉
    var toastCfg = {
      type: 'append',
      viewModel: {
        text: '数据加载中'
      }
    };
    var toastComponent = createComponent('toast', toastCfg);
    this.getPageHtml(page, function (html) {
      var $html = self.compileHtml(html, page);
      $html.find('.page').addClass('slideIn').addClass(page);
      $html.find('.page').on('animationend webkitAnimationEnd', function () {
        $html.find('.page').removeClass('slideIn').addClass('js_show');
      });
      var titleContent = $html.find('[name = title]').val();
      change_title(titleContent);
      $(document).off("click", "#login");
      toastComponent.destroy();
      self.$container.append($html);
      stackItem.dom = $html;
      getFooterText(page, $html);
      _validator.initForQuestionnaire(page);
    }, function () {
      for (var i = 0; i < self._pageStack.length; i++) {
        if (self._pageStack[i].id === pageId) {
          self._pageStack.splice(i, 1);
        }
      }
    });
    setRefreshPage(page);
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
      //添加进度图标缓冲视觉
      var toastCfg = {
        type: 'append',
        viewModel: {
          text: '数据加载中'
        }
      };
      var toastComponent = createComponent('toast', toastCfg);
      this.getPageHtml(page, function (html) {
        var $html = self.compileHtml(html, page);
        $html.find('.page').addClass('js_show').addClass(page);
        var titleContent = $html.find('[name = title]').val();
        change_title(titleContent);
        toastComponent.destroy();
        $html.insertBefore(stack.dom);
        stackItem.dom = $html;
        getFooterText(page, $html);
        _validator.initForQuestionnaire(page);
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
    setRefreshPage(page);
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