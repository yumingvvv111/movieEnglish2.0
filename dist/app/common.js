;(function ($) {
    //创建回调函数的集合
    $.Callbacks = function (options) {
        options = $.extend({}, options)

        var memory,
          fired,
          firing,
          firingStart,
          firingLength,
          firingIndex,
          list = [],
          stack = !options.once && [],
          fire = function (data) {
              memory = options.memory && data
              fired = true
              firingIndex = firingStart || 0
              firingStart = 0
              firingLength = list.length
              firing = true
              for (; list && firingIndex < firingLength; ++firingIndex) {
                  if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                      memory = false
                      break
                  }
              }
              firing = false
              if (list) {
                  if (stack) stack.length && fire(stack.shift())
                  else if (memory) list.length = 0
                  else Callbacks.disable()
              }
          },

          Callbacks = {
              add: function () {
                  if (list) {
                      var start = list.length,
                        add = function (args) {
                            $.each(args, function (_, arg) {
                                if (typeof arg === "function") {
                                    if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                                }
                                else if (arg && arg.length && typeof arg !== 'string') add(arg)
                            })
                        }
                      add(arguments)
                      if (firing) firingLength = list.length
                      else if (memory) {
                          firingStart = start
                          fire(memory)
                      }
                  }
                  return this
              },
              remove: function () {
                  if (list) {
                      $.each(arguments, function (_, arg) {
                          var index
                          while ((index = $.inArray(arg, list, index)) > -1) {
                              list.splice(index, 1)
                              // Handle firing indexes
                              if (firing) {
                                  if (index <= firingLength) --firingLength
                                  if (index <= firingIndex) --firingIndex
                              }
                          }
                      })
                  }
                  return this
              },
              has: function (fn) {
                  return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
              },
              empty: function () {
                  firingLength = list.length = 0
                  return this
              },
              disable: function () {
                  list = stack = memory = undefined
                  return this
              },
              disabled: function () {
                  return !list
              },
              lock: function () {
                  stack = undefined
                  if (!memory) Callbacks.disable()
                  return this
              },
              locked: function () {
                  return !stack
              },
              fireWith: function (context, args) {
                  if (list && (!fired || stack)) {
                      args = args || []
                      args = [context, args.slice ? args.slice() : args]
                      if (firing) stack.push(args)
                      else fire(args)
                  }
                  return this
              },
              fire: function () {
                  return Callbacks.fireWith(this, arguments)
              },
              fired: function () {
                  return !!fired
              }
          }

        return Callbacks
    }
})($)

//定义deferred对象
;
(function ($) {
    var slice = Array.prototype.slice

    function Deferred(func) {
        var tuples = [
              // action, add listener, listener list, final state
              ["resolve", "done", $.Callbacks({once: 1, memory: 1}), "resolved"],
              ["reject", "fail", $.Callbacks({once: 1, memory: 1}), "rejected"],
              ["notify", "progress", $.Callbacks({memory: 1})]
          ],
          state = "pending",
          promise = {
              state: function () {
                  return state
              },
              always: function () {
                  deferred.done(arguments).fail(arguments)
                  return this
              },
              then: function (/* fnDone [, fnFailed [, fnProgress]] */) {
                  var fns = arguments
                  return Deferred(function (defer) {
                      $.each(tuples, function (i, tuple) {
                          var fn = $.isFunction(fns[i]) && fns[i]
                          deferred[tuple[1]](function () {
                              var returned = fn && fn.apply(this, arguments)
                              if (returned && $.isFunction(returned.promise)) {
                                  returned.promise()
                                    .done(defer.resolve)
                                    .fail(defer.reject)
                                    .progress(defer.notify)
                              } else {
                                  var context = this === promise ? defer.promise() : this,
                                    values = fn ? [returned] : arguments
                                  defer[tuple[0] + "With"](context, values)
                              }
                          })
                      })
                      fns = null
                  }).promise()
              },

              promise: function (obj) {
                  return obj != null ? $.extend(obj, promise) : promise
              }
          },
          deferred = {}

        $.each(tuples, function (i, tuple) {
            var list = tuple[2],
              stateString = tuple[3]

            promise[tuple[1]] = list.add

            if (stateString) {
                list.add(function () {
                    state = stateString
                }, tuples[i ^ 1][2].disable, tuples[2][2].lock)
            }

            deferred[tuple[0]] = function () {
                deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
                return this
            }
            deferred[tuple[0] + "With"] = list.fireWith
        })

        promise.promise(deferred)
        if (func) func.call(deferred, deferred)
        return deferred
    }

    $.when = function (sub) {
        var resolveValues = slice.call(arguments),
          len = resolveValues.length,
          i = 0,
          remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
          deferred = remain === 1 ? sub : Deferred(),
          progressValues, progressContexts, resolveContexts,
          updateFn = function (i, ctx, val) {
              return function (value) {
                  ctx[i] = this
                  val[i] = arguments.length > 1 ? slice.call(arguments) : value
                  if (val === progressValues) {
                      deferred.notifyWith(ctx, val)
                  } else if (!(--remain)) {
                      deferred.resolveWith(ctx, val)
                  }
              }
          }

        if (len > 1) {
            progressValues = new Array(len)
            progressContexts = new Array(len)
            resolveContexts = new Array(len)
            for (; i < len; ++i) {
                if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                    resolveValues[i].promise()
                      .done(updateFn(i, resolveContexts, resolveValues))
                      .fail(deferred.reject)
                      .progress(updateFn(i, progressContexts, progressValues))
                } else {
                    --remain
                }
            }
        }
        if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
        return deferred.promise()
    }

    $.Deferred = Deferred
})($)

/**
 * 公共方法: 模板编译
 * @param segment{$HTMLElement} jquery dom 对象
 * @param data{Object} 数据模型对象
 * @return {$HTMLElement} 编译后的$dom对象
 * @example 在构造函数中
 * compile.call(this, $(htmlString), this.viewModel)
 * */

function templateCompile(segment, data, parentData, $index, $parentIndex, dataPath) {
    var self = this;
    var $excludeElement = segment.find('[data-bind*=foreach]').find('[data-bind]');
    dataPath = dataPath || [];
    //segment.find('[data-bind]').filter(function (i, e) {
    //  return !parentsHasProperty($(e), 'data-bind', 'foreach');
    //});
    function myEval(str, data) {
        var func = 'with(data){' +
          'var result;' +
          'if(typeof str === "undefined"){str = "";}' +
          'str = str.replace(/{#([^{}]+)}/g, function(m1, m2){return data[m2];});' +
          'try{result = eval(str)}catch(ex){result = str; console.log(ex);} return result;}';
        return (new Function('data', 'str', func))(data, str);
    }

    function reDraw(newVal, matchs, evalScope, $elem, $index, dataPath) {
        var self = this;
        var evalStr = matchs instanceof Array ? matchs[2] : matchs;
        var _data = newVal || myEval(evalStr, evalScope);
        var _fragment = document.createDocumentFragment();
        var oldTemplate = $elem._template || ($elem._template = $elem.html());

        function createNewFragment(cfg) {
            var _compileElement;
            var _cloneElement = $elem.clone();
            _cloneElement.html(oldTemplate);
            _compileElement = (self.compile || templateCompile).call(self, _cloneElement, cfg.data, cfg.parentData, cfg.index, cfg.parentIndex, cfg.dataPath);
            _compileElement.children().each(function (index, element) {
                //var e = $(element).clone()[0];
                _fragment.appendChild(element);
            });
        }

        var _path;
        if (_data instanceof Array) {
            for (var i = 0, len = _data.length; i < len; i++) {
                _path = (dataPath.push(evalStr + '[' + i + ']'), dataPath);
                createNewFragment.call(self, {
                    data: _data[i],
                    parentData: (function () {
                        var num = 0;
                        var len = _path.length;
                        if (len > 0) {
                            num = len - 2;
                            num = num < 0 ? 0 : num;
                            return eval(_path[num]);
                        } else {
                            return null;
                        }
                    }()),
                    index: i,
                    parentIndex: $index,
                    dataPath: _path
                });
            }
        } else if (Object.prototype.toString.call(_data) === '[object Object]') {
            _path = (dataPath.push(evalStr), dataPath);
            createNewFragment.call(self, {
                data: _data,
                parentData: parentData,
                index: $index,
                parentIndex: $parentIndex,
                dataPath: _path
            });
        }
        $elem.html('');
        $elem.append(_fragment);
    }

    var bindElementsArray = Array.prototype.slice.call(segment.find('[data-bind]'));

    function forEachBindElements(index, element, parentData, $parentIndex) {
        var self = this;
        var $elem = $(element);
        var expression = $elem.attr('data-bind').replace(/\$root/g, 'self.viewModel');
        var dataAttrNames = ['data-if', 'data-href', 'data-attr', 'data-bind', 'data-class'];

        function getMatchs(expression) {
            var matchs = expression.match(/^\b(\w*?)\b:(.*)/);
            var matchs2 = expression.match(/^\{(.*)\}$/);
            var bindMatch = expression.match(/\(\(([^\(\)]+)\)\)/);
            var isBindMatch = false;
            if (matchs2) {
                return {
                    isArray: true,
                    array: matchs2[1].split(',')
                }
            }
            if (!matchs) {
                if (bindMatch) {
                    return {
                        isOnlyBind: true,
                        matchs: bindMatch[1]
                    };
                } else {
                    return false;
                }
            }
            if (bindMatch) {
                matchs[2] = bindMatch[1];
                isBindMatch = true;
            }
            return {
                matchs: matchs,
                isBindMatch: isBindMatch
            };
        }

        if (elemIsInForeach($elem, $excludeElement)) {
            return;
        }
        if (typeof data === 'array') {
            data = {_arr_: data};
        }
        var watchList = [];
        with (data) {
            var ifAttr = $elem.attr(dataAttrNames[0]);
            var hrefAttr = $elem.attr(dataAttrNames[1]);
            var attrData = $elem.attr(dataAttrNames[2]);
            var $parent = parentData;
            var evalScope = $.extend({}, data, {
                $parent: parentData,
                $index: $index,
                $parentIndex: $parentIndex,
                self: self
            });
            var _bindEvent = function ($elem, matchs, $index, myEval, evalScope, data) {
                $elem[0][('on' + matchs[1])] = (function ($index) {
                    return function (event) {
                        myEval(matchs[2], evalScope).call(this, event, data, $index);
                    }
                })($index);
            };
            var isEventName = function (text) {
                var result = false;
                var textArr = ['click', 'blur', 'change', 'touch', 'focus', 'load', 'scroll', 'select'];
                textArr.forEach(function (v) {
                    if (v === text) {
                        result = true;
                    }
                });
                return result;
            };
            if (ifAttr) {
                ifAttr = ifAttr.replace(/\$root/g, 'self.viewModel');
                if (!myEval(ifAttr, evalScope)) {
                    $elem.remove();
                    return;
                }
            }
            if (hrefAttr) {
                hrefAttr = hrefAttr.replace(/\$root/g, 'self.viewModel');
                hrefAttr = myEval(hrefAttr, evalScope);
                $elem.attr('href', hrefAttr);
            }
            var classAttr = $elem.attr(dataAttrNames[4]);
            if (classAttr) {
                classAttr = classAttr.replace(/\$root/g, 'self.viewModel');
                classAttr = myEval(classAttr, evalScope);
                $elem.addClass(classAttr);
            }
            if (attrData) {
                var attrMatchs;
                attrMatchs = myEval('attrMatchs=' + attrData, evalScope);
                for (var _name in attrMatchs) {
                    var _val = attrMatchs[_name];
                    if (_name === 'param' || _name === 'remoteCheck') {
                        _val = JSON.stringify(_val);
                        _name = 'data-' + _name;
                    }
                    if (_name === 'addClass') {
                        $elem.addClass(_val);
                    } else {
                        $elem.attr(_name, _val);
                    }
                }
            }

            var matchResult = getMatchs(expression);
            if (matchResult) {
                if (matchResult.isArray) {
                    for (var _m = 0, _item, itemMatchResult; _m < matchResult.array.length; _m++) {
                        _item = matchResult.array[_m];
                        itemMatchResult = getMatchs(_item);
                        if (itemMatchResult) {
                            putValues.call(self, itemMatchResult.matchs, itemMatchResult.isBindMatch, evalScope, $elem, watchList, reDraw, myEval, isEventName, _bindEvent);
                        }
                    }
                } else if (matchResult.isOnlyBind) {
                    $elem._template = $elem.html();
                    watchList.push({
                        key: matchResult.matchs,
                        Func: function (newVal) {
                            reDraw.call(self, newVal, matchResult.matchs, evalScope, $elem, $index, dataPath);
                        }
                    });
                } else {
                    putValues.call(self, matchResult.matchs, matchResult.isBindMatch, evalScope, $elem, watchList, reDraw, myEval, isEventName, _bindEvent);
                }
            }

            function putValues(matchs, isBindMatch, evalScope, $elem, watchList, reDraw, myEval, isEventName, _bindEvent) {
                var self = this;
                if (matchs) {
                    switch (matchs[1]) {
                        case 'text':
                            if (matchs[2] === '[]') {
                                $elem.text(data);
                            } else {
                                $elem.text(myEval(matchs[2], evalScope));
                                if (isBindMatch) {
                                    watchList.push({
                                        key: matchs[2],
                                        Func: function (newVal) {
                                            $elem.text(newVal);
                                        }
                                    });
                                }
                            }
                            break;
                        case 'html':
                            $elem.html(myEval(matchs[2], evalScope));
                            if (isBindMatch) {
                                watchList.push({
                                    key: matchs[2],
                                    Func: function (newVal) {
                                        $elem.html(newVal);
                                    }
                                });
                            }
                            break;
                        case 'foreach':
                            $elem._template = $elem.html();
                            reDraw.call(self, null, matchs, evalScope, $elem, evalScope.$index, dataPath);
                            if (isBindMatch) {
                                watchList.push({
                                    key: matchs[2],
                                    Func: function (newVal) {
                                        reDraw.call(self, newVal, matchs, evalScope, $elem, evalScope.$index, dataPath);
                                    }
                                });
                            }
                            break;
                        case 'attr':
                            //todo:attr:{a:'t1', b:'t2'}
                            var attrMatchs = matchs[2].match(/{(\w.*?):(.*)}/);
                            var _evalResult = myEval(attrMatchs[2], evalScope);
                            $elem.attr(attrMatchs[1], (attrMatchs[1] === 'data-param' || attrMatchs[1] === 'data-remote-check') ? JSON.stringify(_evalResult) : _evalResult);
                            var match2, watchStr;
                            if ((match2 = /^([\w\.]+)\b.*?\?.*:/.exec(attrMatchs[2])) !== null) {
                                watchStr = match2[1];
                            }
                            if (isBindMatch) {
                                watchList.push({
                                    key: matchs[2],
                                    Func: function (newVal) {
                                        $elem.attr(attrMatchs[1], myEval(attrMatchs[2], evalScope));
                                    }
                                });
                            }
                            break;
                        default:
                            if (isEventName(matchs[1])) {
                                _bindEvent($elem, matchs, $index, myEval, evalScope, data);
                            }
                            break;
                    }
                }
            }

            // console.log('%c%s', 'color:green', self);
            watch.call(self, watchList, data, self.viewModel);
        }
        //dataAttrNames.forEach(function (e) {
        //  $elem.removeAttr(e);
        //});

    }

    for (var _i = 0; _i < bindElementsArray.length; _i++) {
        // if($(bindElementsArray[_i]).closest('[data-bind^="(("]').length !== 0 && $(bindElementsArray[_i]).closest('[data-bind^="(("]')[0] !== bindElementsArray[_i]){
        forEachBindElements.call(self, _i, bindElementsArray[_i], parentData, $parentIndex);
        // }
    }

    dataPath.pop();

    return segment;

    function elemIsInForeach($elem, $excludeElement) {
        var result = false;
        $excludeElement.each(function (index, elem) {
            if (elem === $elem[0]) {
                result = true;
            }
        });
        return result;
    }

    function parentsHasProperty(element, proName, proValue) {
        var parent = element.parent();
        var _proName = proName;
        var reg = new RegExp('\\b' + proValue + '\\b');
        var isHas = false;
        element.parents().each(function () {
            var proName = $(this).attr(_proName);
            if (typeof proName !== 'undefined' && reg.test(proValue)) {
                isHas = true;
            }
        });
        return isHas;
    }

    function watch(watchList, obj, modelRoot) {
        var self = this;
        for (var i = 0, item, arr = []; i < watchList.length; i++) {
            item = watchList[i];
            item.Func = [item.Func];
            for (var n = 0, item2, isRepeat = false; n < arr.length; n++) {
                item2 = arr[n];
                if (item.key === item2.key) {
                    item2.Func = item2.Func.concat(item.Func);
                    isRepeat = true;
                }
            }
            !isRepeat && arr.push(item);
        }
        watchList = arr;
        watchList.forEach(function (item) {
            var watchStr = item.key, value, watchHandler, watchObj, match;
            var defaultSetFunc = function (newVal) {
                var oldVal = value;
                value = newVal;
                if (watchHandler instanceof Array) {
                    watchHandler.forEach(function (handler) {
                        handler.call(self, newVal, oldVal);
                    });
                } else {
                    watchHandler.call(self, newVal, oldVal);
                }
            };
            if ((match = /self.viewModel.(.*)/.exec(watchStr))) {
                watchObj = modelRoot;
                watchStr = match[1];
            } else {
                watchObj = obj;
            }
            if (/\./.test(watchStr)) {
                var splitter = watchStr.split(/\./);
                watchStr = splitter.pop();
                watchObj = myEval(splitter.join('.'), watchObj)
            }
            if (/\{#([^{}]+)\}/.test(watchStr)) {
                watchStr = /\{#([^{}]+)\}/.exec(watchStr)[1];
            }
            value = watchObj[watchStr];
            (function (scope) {
                watchHandler = typeof item.Func !== 'string' ? item.Func : eval(item.Func);
            })(obj);

            Object.defineProperty(watchObj, watchStr, {
                get: function () {
                    return value;
                },
                set: defaultSetFunc
            });
        });
    }

}

/**
 * 组件基类
 * @param dataModel{object}[optional] 视图层的数据模型
 * @param template{string}[required] html模板字符串
 * @param container{string}[optional] 指定渲染的容器
 * @param onEmpty{fuction}[optional] 当空数据的时候
 * @param type{string}[optional] 加到页面里的方法
 * */
function Component(dataModel, template, templateCompile, container, type) {
    var segment;
    var container = $(container || '#widgetContainer');
    this.init = function () {
        this.viewModel = dataModel;
        this.compile = templateCompile;
        segment = this.compile($(template), this.viewModel);
        container.css('zIndex', 9999999);
    };
    this.destroy = function () {
        segment.fadeOut(100);
        setTimeout(function () {
            segment.remove();
        }, 100);
        container.css('zIndex', -9);
    };
    this.init();
    segment.css('display', 'none');
    if (type === 'append') {//如果append方式就添加进页面否则就替换原有的内容
        container.append(segment);
        segment.fadeIn(200);
    } else {
        container.html(segment);
        segment.fadeIn(200);
    }

}


//表单字段验证器
var _validator = {
    hasBindSubmit: false,
    submitHandler: function (event) {
        var target = event.target;
        var hasError = false;
        var formElement = $($(target).closest('.page').find('form'));
        var action = formElement.attr('action');
        var callback = formElement.attr('data-callback');
        var checkArray = [];
        formElement.find('[data-rule]').each(function (i, e) {
            checkArray.push(_validator.checkRule.call(this));
        });
        function postData() {
            _validator.removeAllErrorIcon();
            pageManager.ajaxManager({
                url: action,
                form: formElement,
                success: function (res) {
                    if (!_validator.responseHandler(res)) {
                        if (callback) {
                            location.hash = callback.replace('#', '') + 'v=' + Math.random();
                        }
                    }
                },
                fail: function () {
                    pageManager.showTooltip('数据连接超时或异常', 'error');
                }
            })();
        }

        $.when.apply($, checkArray).done(function () {
            var args = Array.prototype.slice.call(arguments);
            args.forEach(function (res) {
                if (res._error) {
                    hasError = true;
                }
            });
            if (!hasError) {
                postData();
            }
        }).fail(function (ex) {
            console.warn(ex);
        }).always(function (res) {
            console.log(res);
        });
        _validator.hasBindSubmit = true;
        event.preventDefault();
        event.stopPropagation();
        return false;
    },
    init: function (formSelector) {
        $(formSelector || 'form').find('[data-rule]').each(function (i, e) {
            var oldBlur = this.onblur;
            var elem = this;
            var onblurHandler = function (e) {
                $.when(_validator.checkRule.call(this, e)).then(
                  function (res) {//没错误时
                      oldBlur && oldBlur.call(elem, e);
                  },
                  function (msg) {//有错误时
                      console.warn(msg);
                  }
                );
            };
            this.onblur = onblurHandler;
        });
    },
    responseHandler: function (res) {
        if (res.code != 0) {
            _validator.addErrorMsg.call(this, res.message);
            console.log('%c%s', 'color:orange', 'error');
            return res.message;
        } else {
            console.log('%c%s', 'color:green', 'success');
            return false;
        }
    }
    ,
    checkRule: function () {
        var deferred = $.Deferred();
        var targetElement = this;
        var msg = _validator.getError.call(this);
        var remoteCheck = $(this).attr('data-remoteCheck');
        var paramData = $(this).attr('data-param');
        if (msg) {//前端校验
            _validator.addErrorMsg.call(this, msg);
            deferred.reject({_error: msg});
            return deferred.promise();
        } else {//后端校验
            paramData = paramData ? JSON.parse(paramData) : {};
            remoteCheck = remoteCheck ? JSON.parse(remoteCheck) : {};
            if (remoteCheck.url) {
                var _paramData = {};
                if (remoteCheck.params) {
                    remoteCheck.params.forEach(function (v) {
                        _paramData[v] = null;
                    });
                }
                _paramData[$(this).attr('name')] = $(this).val();
                window.pageManager.ajaxManager({
                    url: remoteCheck.url,
                    type: 'post',
                    data: $.extend({}, _paramData, paramData),
                    success: function (res) {
                        var msg = _validator.responseHandler.call(targetElement, res);
                        if (msg) {
                            deferred.reject({_error: msg});
                        } else {
                            _validator.removeErrorMsg.call(targetElement);
                            deferred.resolve({_noError: true});
                        }
                    },
                    fail: function (ex) {
                        deferred.reject({_error: ex});
                        console.log(ex);
                    }
                })();
            } else {
                _validator.removeErrorMsg.call(this);
                deferred.resolve({_noError: true});
            }
        }
        return deferred.promise();
    }
    ,
    getError: function () {
        var element = this;
        var formElement = $(this).closest('.weui-cells_form');
        var rules = {
            mobile: {
                reg: '(\\+86)\?1[3,5,6,7,8]\\d{9}',
                errorMsg: '手机号格式不正确'
            },
            number: {
                reg: '\\d+',
                errorMsg: '请输入正确的数字'
            },
            verification: {
                reg: '\\d{6}',
                errorMsg: '请输入正确的验证码'
            },
            idCard: {
                reg: '[0-9a-zA-Z]{15,20}',
                errorMsg: '您输入的身份证号有误，请核对后再次输入'
            },
            streetDetail: {
                reg: '\\S+',
                errorMsg: '详细地址不能为空'
            },
            birthday: {
                reg: '\\S+',
                errorMsg: '出生日期不能为空'
            },
            password: {
                reg: '[^\\s\\t\\n\\r]{8,}',
                errorMsg: '密码格式不正确，输入英文大小写字母，数字，特殊符号均可，至少8位'
            },
            verifyPassword: [{
                reg: '[^\\s\\t\\n\\r]{8,}',
                errorMsg: '密码格式不正确，输入英文大小写字母，数字，特殊符号均可，至少8位'
            }, {
                expression: '"{#confirmPassword}" === "{#password}" || "{#confirmPassword}" === "{#newPassword}"',
                errorMsg: '两次输入的密码不一致'
            }],
            name: {
                reg: '[^\\s\\t\\n\\r]{2,10}',
                errorMsg: '请输入2-10个字的名字'
            }
        };
        var thisRule = rules[$(this).attr('data-rule')];
        var regFromAttr = $(this).attr('pattern');
        if (thisRule) {
            if (!(thisRule instanceof Array)) {
                thisRule = [thisRule];
            }
            for (var i = 0, _rule, regStr; i < thisRule.length; i++) {
                _rule = thisRule[i];
                if (_rule.reg) {
                    regStr = _rule.reg || regFromAttr;
                    var reg = new RegExp('^' + regStr + '$');
                    if (!reg.test($(this).val())) {
                        return _rule.errorMsg || '请输入正确的' + $(this).attr('title');
                    }
                }
                if (_rule.expression) {
                    _rule.expression = _rule.expression.replace(/{#([^{}]+)}/g, function (m1, m2) {
                        return formElement.find('[name="' + m2 + '"]').val() || '';
                    });
                    var _result;
                    try {
                        _result = eval(_rule.expression);
                    } catch (ex) {
                        console.log('_result', ex);
                        _result = false;
                    }
                    if (!_result) {
                        return _rule.errorMsg || '请输入正确的' + $(this).attr('title');
                    }

                }
            }
        }
    }
    ,
    removeAllErrorIcon: function () {
        $('.weui-cell_warn').removeClass('weui-cell_warn');
    }
    ,
    removeErrorMsg: function () {
        $(this).closest('.weui-cell').removeClass('weui-cell_warn');
        // $('.weui-toptips_warn').hide();
    }
    ,
    addErrorMsg: function (msg) {
        $(this).closest('.weui-cell').addClass('weui-cell_warn');
        pageManager.showTooltip(msg);
    }
};

utils = {
    getDeviceInfo: function () {
        var userAgent = navigator.userAgent;
        return {
            isIphone: /[Ii][Pp]hone/.test(userAgent),
            isAndroid: /[Aa]droid/.test(userAgent)
        };
    },
    getInfoFromURL: function (url) {
        var host, hash, paramObj = {}, paramStr = '', paramArr = [], paramObj = {}, match1, match2;
        url = url || location.href;
        match1 = /(((?:http|https):\/\/[^\/]+)(?:.*?)\/)dist\/.*?#?(.*)$/.exec(url);
        //临时增加的
        try{
        var path = match1[1];
        host = match1[2];
        if (match1[3]) {
            match2 = /(?:\?([^#]*))?#([^\?]*)(?:\?([^#]*))?/.exec(match1[3]);
            hash = match2[2];
            paramStr = match2[1] + (match2[3] ? '&' + match2[3] : '');
            if (paramStr) {
                paramArr = paramStr.split('&');
                if (paramArr && paramArr.length > 0) {
                    paramArr.forEach(function (v) {
                        var d = v.split('=');
                        var key = d[0];
                        var value = d[1];
                        paramObj[key] = value;
                    });
                }
            }
        }
        return {
            host: host + '/',
            hash: hash,
            path: path,
            param: paramObj
        };
        }catch(ex){
            return {
                host: null,
                hash: null,
                path: null,
                param: null
            };
        }
    },
    /**获得编译后的页面片段*/
    getPageSegment: function (cfg) {
        return templateCompile.call(cfg, $(cfg.template), cfg.viewModel)
    }
};

var myConfirm = window.confirm;//暂存原生方法
window.confirm = function (message) {
    try {
        var iframe = document.createElement("IFRAME");//创建一个iframe然后调用它的confirm就不会有标题
        var id = 'confirmIframe';
        iframe.id = id;
        iframe.setAttribute('id', id)
        iframe.style.display = "none";
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        var alertFrame = window.document.getElementById(id);
        var iwindow = alertFrame.window || alertFrame.contentWindow
        return iwindow.confirm(message);
    } catch (exc) {
        return myConfirm(message);
    } finally {
        iframe.parentNode.removeChild(iframe);//去掉临时创建的iframe
    }
}

//添加form表单ajax提交的参数方法
$.fn.serializeObject = function () {
    var obj = {};
    var array = this.serializeArray();
    array.forEach(function (v) {
        obj[v.name] = v.value;
    });
    this.find('input[type="checkbox"]').each(function (i, e) {
        var name = $(this).attr('name');
        var checkbox = obj[name];
        if (!(checkbox instanceof Array)) {
            obj[name] = [];
        }
        if (this.checked) {
            obj[name].push($(this).val());
        }
    });
    return obj;
};

/**
 * 创建自定义组件的方法
 * @param componentName{string}[required]组件的名称
 * @param cfg{string}[required] 配置
 * */
function createComponent(componentName, cfg) {
    var template = cfg.templateSelector
      ? $(cfg.templateSelector).html()
      : $('#component' + componentName.replace(/^(.)/, function (m1, m2) {
          return m2.toUpperCase();
      })).html().match(/<!\[CDATA\[([\s\S]*?)\]\]>/m)[1].trim();
    return new Component(cfg.viewModel, template, templateCompile, cfg.container, cfg.type);
}

//监听其它点击事件
function onClickContainer(event) {
    var target = $(event.target);
    var component = target.closest('[data-component]');
    var router = target.closest('.js-router');
    var submitButton = target.closest('.submit');
    var tagName = target[0].tagName.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        target[0].focus();
    }
    if (submitButton.length > 0) {
        if(target[0].tagName.toUpperCase() === 'EM'){
            target[0].onclick();
        }else{
            _validator.submitHandler(event);
        }
    }
    //点击router
    if (router.length > 0) {
        router = router.data('router');
        window.pageManager.go(router);
    }
    //点击自定义组件
    if (component.length > 0) {
        var componentCfg = component.data('component');
        var componentName = componentCfg;
        if (componentCfg.toString() === '[object Object]') {
            componentName = componentCfg.name;
        }
        switch (componentName.replace('yy-', '')) {
            case 'select':
                if (target[0].tagName.toUpperCase() !== 'EM' || componentCfg.disabled) {
                    return false;
                }
                var optionData = [];
                var hideFirst = componentCfg.hideFirst;
                component.find('select').find('option').each(function (i, e) {
                    if (i === 0 && (hideFirst || $(e).attr('hidden') == 'true' || /选择/.test($(e).text()))) {
                        return;
                    }
                    optionData.push({
                        value: $(e).attr('value'),
                        checked: e.selected,
                        name: $(e).text()
                    });
                });
                var IdNum = parseInt(Math.random() * 1000000, 10);
                var newSelectId = 'select' + IdNum;
                component.find('select').attr('data-widgetID', newSelectId);
                var dialogCfg = {
                    type: 'append',
                    viewModel: {
                        id: 'dialog' + IdNum,
                        isShowTitle: false,
                        isShowFooter: false,
                        title: '标题',
                        content: '',
                        primaryText: '是',
                        onClickPrimaryText: function (event, data) {
                        },
                        defaultText: '否',
                        onClickDefault: function (event, data) {
                        },
                        onClickMask: function (event, data) {
                            setSelectData();
                        }
                    }
                };

            function setSelectData() {
                var value;
                var elementId = '[data-widgetID="' + newSelectId + '"]';
                $('.component-select').find('input').each(function (i, e) {
                    if (e.checked) {
                        value = e.value;
                    }
                });
                $(elementId).val(value);
                $(elementId).trigger('change');
                $(elementId).children().each(function (i, e) {
                    if (e.value === value) {
                        $(e).trigger('click');
                    }
                });
                setTimeout(function () {
                    $('#widgetContainer')[0].onclick = null;
                    dialogComponent.destroy();
                }, 0);
            }

                var dialogComponent = createComponent('dialog', dialogCfg);
                var selectCfg = {
                    container: '#dialog' + IdNum + ' .weui-dialog__bd',
                    type: 'html',
                    viewModel: {
                        onSelected: function (event, data, index) {
                            var target = $(event.target);
                            var item = target.closest('.weui-check__label');
                            $(item).siblings().find('input').each(function (i, e) {
                                e.checked = false;
                            });
                            item.find('input')[0].checked = true;
                            setSelectData();
                            return false;
                        },
                        options: optionData //下拉选项的值和选中所组成的数组
                    }
                };
                createComponent('select', selectCfg);
                $('[checked=false]').removeAttr('checked');
                break;

        }
        return false;
    }

}
$(function(){
    document.getElementById('container').addEventListener('click', onClickContainer, true);
});
