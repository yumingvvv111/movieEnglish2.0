$(function(){
  var pageManager = {};
  var API = {};
  var _myTimer = null;
  $('#resetTime').keyup(function(event){
    var val = parseInt(this.value) || 0;
    clearTimeout(_myTimer);
    _myTimer = setTimeout(function(){
      pageCfg.viewModel.subtitle.forEach(function(e, i){
        var st = +(e.t[0]);
        var et = +(e.t[1]);
        e.t = [st+=val, et+=val];
      });
      $('#video')[0].currentTime = 0;
    }, 3000);
  });
  pageManager.ajaxManager = function (cfg) {
    var self = this;
    return function (e) {
      var pathURL = $('#pathUrl').val();

      function getSendData(data) {
        var result = null;
        var formElement = $(cfg.form) || $('#container').children().last().find('form');
        if (data) {
          if (Object.prototype.toString.call(data) === '[object Object]') {
            result = $.extend({}, {wxId: window.wxId}, cfg.data);
          }
        } else {
          if (formElement.length !== 0) {
            result = $.extend({}, {wxId: window.wxId}, formElement.serializeObject());
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
  }
  API.movie = {
    getAuth: {
      url: 'https://api.pcloud.com/userinfo?getauth=1&logout=1&username=956532364@qq.com&password=cctv1983'
    },
    getMoviePath: {
      url: '../../movieEnglishService/getMovieURL.php',
      params: ['auth', 'path', 'fileid']
    },
    getSubtitle: {
      url: '../../movieEnglishService/getSubtitle.php',
      params: ['movieName', 'type']
    },
//    setSubtitleInfo: {
//      url: '../../movieEnglishService/setSubtitleInfo.php',
//      params: ['multipleId', 'important', 'localVoice', 'serverVoice']
//    },
    getSubtitleInfo: {
      url: '../../movieEnglishService/getSubtitleInfo.php',
      params: ['multipleId']
    },
    getHighVoiceFormWXServer: {
      url: 'https://api.weixin.qq.com/cgi-bin/media/get/jssdk',
      params: ['access_token', 'media_id']
    },
    uploadVoiceToServer: {
      url: '../../movieEnglishService/uploadVoiceToServer.php',
      params: ['multipleId', 'sentenceId', 'serverId', 'token']
    }
  };
  if (!window.getWordTranslation) {
    window.getWordTranslation = function (data) {
      if (data.errorCode === 0) {
        var str = '';
        data.web && data.web.forEach(function (v) {
          str += v.value.join(',') + '<br>';
        });
        var dialogCfg = {
          type: 'append',
          viewModel: {
            id: 'iosDialog1',
            isShowTitle: true,
            isShowFooter: false,
            title: data.query,
            content: '<h3>翻译：</h3><p>' + data.translation.join(',') + '</p>' + '<h3>解释：</h3><p>' + data.basic.explains.join(',') + '</p>' + '<h3>网络释义：</h3><p>' + str + '</p>',
            primaryText: '是',
            onClickPrimaryText: function (event, data) {
            },
            defaultText: '否',
            onClickDefault: function (event, data) {
            },
            onClickMask: function () {
              dialogComponent.destroy();
            }
          }
        };
        var dialogComponent = createComponent('dialog', dialogCfg);
      }
    };
  }
  // $('body').append('<input type="hidden" id="infoFromURL" value=\'{"host":"http://wwwv.applinzi.com/","hash":"movie-player","path":"http://wwwv.applinzi.com/","param":{"wxId":"123","userId":"u007","movieName":"WALL-E","movieId":"m1488519093994","url":"https://p-def1.pcloud.com/cfZl0WmGkZDEtorkZLxrnZ7ZeUJd67ZQ5ZZA1FZZxybj1ZgVZTVZqXZ1XZekZSVZLkZoXZIZ17ZoZVXZ0ZmXZgwVc57dLFgQLd5XFElagx7xd0svy/95730.mp4","subtitleUrl":"WALL-E.srt"}}\'>');
  var urlInfo = JSON.parse($('#infoFromURL').val()).param;
  function getMovieUrl() {
    var movieUrl = urlInfo.url;

    function getAuth() {
      var deferred = $.Deferred();
      pageManager.ajaxManager({
        url: API.movie.getAuth.url,
        data: {},
        type: 'get',
        success: function (res) {
          var auth = res.auth;
          deferred.resolve({auth: auth});
        },
        fail: function (ex) {
          deferred.reject({ex: ex});
        }
      })();
      return deferred.promise();
    }

    debugger;
    if (!/http|https/.test(movieUrl)) {
      if (!/^\//.test(movieUrl)) {
        movieUrl = '../../movieEnglishService/subtitle' + movieUrl;
      } else {
        //Get movie url
        $.when(getAuth()).then(function (res) {
          var auth = res.auth;
          var p = {
            auth: auth,
            path: movieUrl,//encodeURI(movieUrl),
//            fileid:1383359129,
            contenttype: 'video/mp4',
            id: (new Date()).getTime()
          };
          var url = 'https://api.pcloud.com/getvideolinks?path=' + p.path + '&auth=' + p.auth + '&contenttype=' + p.contenttype + '&id=' + p.id;
          $('body').append('<iframe id="movieLinks" src="' + url + '"><\/iframe>');

//          setTimeout(function(){
//            alert($('#movieLinks')[0].contentWindow.document.body.innerHTML);
//          }, 3000);
          debugger;

        });
//          pageManager.ajaxManager({
//            url: 'https://api.pcloud.com/getvideolinks',//?path=%2FNodejs%2FNode.js%20Tutorial%20for%20Beginners%20-%203%20-%20Basic%20Concepts.mp4&auth=' + auth,//url,//API.movie.getMoviePath.url,
//            type: 'get',
//            data: p,
//            async: true,
//            crossDomain: true,
//            headers:{
//              "cache-control": "no-cache",
//              "postman-token": "0d895e9c-e461-87d9-1468-05d002bf6cf0"
//            },
//            dataType: 'json',
//            success: function (res) {
//              var url;
//              debugger;
//              if (res.result === 0) {
//                var result = res.variants[0]
//                url = 'https://' + result.hosts[0] + result.path;
//                $('#video source').attr({
//                  type: 'video/mp4',//'application/x-mpegURL',
//                  src: url
//                });
//                $('#video')[0].load();
//                pageCfg.viewModel.movieUrl = url;
//                pageCfg.viewModel.movieType = 'application/x-mpegURL';

//                pageManager.ajaxManager({
//                  url: API.movie.getMoviePath.url,
//                  data: {
//                    proxy: url
//                  },
//                  dataType: 'html',
//                  type: 'get',
//                  success: function (res) {
//                    var url = res.match(/https:\\\/\\\/p-def\d.pcloud.com.*?\.mp4/)[0];
//                    url = url.replace(/\\\//g, '/');
//                    var poster = res.match(/https:\/\/api.pcloud.com\/getpubthumb[^"]*/)[0];
//                    poster = poster.replace(/\\\//g, '/');
//                    pageCfg.viewModel.movieUrl = url;
//                    $('.movie-player #video').attr('poster', poster);
//                  },
//                  fail: function (ex) {
//                    console.log(ex);
//                  }
//                })();
//              } else {
//                pageManager.showTooltip(res.error);
//              }
//            },
//            fail: function (ex) {
//              pageManager.showTooltip('获取电影路径失败');
//            }
//          })();
//        }, function (ex) {
//          pageManager.showTooltip('获取Cloud Auth失败');
//        });
      }
    }
    return movieUrl;
  }

  var multipleId = ($('.page-video-list #userId').val() || urlInfo.userId) + '_' + urlInfo.movieId;
  window.pageCfg = {
    viewModel: {
      title: urlInfo.movieName,
      movieUrl: getMovieUrl(),
      movieType: 'video/mp4',
      oldCheckedButton: null,
      subtitle: [
        {i: 0, t: [0, 0], s: '字幕'}
      ],
      changeURL: function () {
        var dialogCfg = {
          type: 'append',
          viewModel: {
            id: 'iosDialog1',
            isShowTitle: true,
            isShowFooter: true,
            title: '切换播放地址',
            content: '<div class="weui-cells weui-cells_form">\
            <div class="weui-cell">\
            <div class="weui-cell__bd">\
              <textarea class="weui-textarea" name="movieURL" placeholder="请输入地址" rows="3"></textarea>\
              <div class="weui-textarea-counter"><span>0</span>/200</div>\
            </div>\
            </div>\
            </div>',
            primaryText: '否',
            onClickPrimaryText: function (event, data) {
              dialogComponent.destroy();
            },
            defaultText: '是',
            onClickDefault: function (event, data) {
              var url = $('textarea[name=movieURL]').val();
              pageManager.ajaxManager({
                url: '../../movieEnglishService/saveURL.php',
                data: {
                  url: url,
                  movieId: urlInfo.movieId
                },
                type: 'post',
                dataType: 'text',
                success: function (res) {
                  pageManager.showTooltip('Save Success', 'success');
                },
                fail: function (ex) {
                  pageManager.showTooltip(ex.responseText, 'error');
                }
              })();
              $('#video source').attr({
                type: 'video/mp4',
                src: url
              });
              $('#video')[0].load();
            },
            onClickMask: function () {
              dialogComponent.destroy();
            }
          }
        };
        var dialogComponent = createComponent('dialog', dialogCfg);
      },
      onClickSubtitle: function (event) {
        var target = $(event.target);
        var repeatButton = target.closest('.repeat');
        var recordButton = target.closest('.record');
        var playButton = target.closest('.play');
        var uploadButton = target.closest('.upload');
        var downloadButton = target.closest('.download');
        var importantButton = target.closest('.important');
        var sentence = target.closest('b');
        var video = $('#video')[0];

        function switchButton(button, onChecked, onCancel) {
          if (pageCfg.oldCheckedButton && pageCfg.oldCheckedButton[0] !== button[0]) {
            pageCfg.oldCheckedButton.removeClass('checked');
          }
          if (button.hasClass('checked')) {
            button.removeClass('checked');
            onCancel && onCancel(button);
          } else {
            button.addClass('checked');
            pageCfg.oldCheckedButton = button;
            onChecked && onChecked(button);
          }
        }

        //点击复读
        if (repeatButton.length > 0) {
          var video = $('#video')[0];
          var liElement = repeatButton.closest('li');
          var pointer = liElement.index();
          var timeRange = pageCfg.getTimeRange(pointer);
          video.currentTime = timeRange[0];
          pageCfg.pointer = pointer;
          $('.subtitle li').removeClass('active');
          liElement.addClass('active');
          switchButton(repeatButton);
          pageCfg.switchReapeat(repeatButton);
        }
        //点击录音
        if (recordButton.length > 0) {
          video.pause();
          switchButton(recordButton, function (button) {
            wx.startRecord();
          }, function (button) {
            wx.stopRecord({
              success: function (res) {
                var localId = res.localId;
                button.closest('li').attr('localId', localId);
              }
            });
          });
        }
        //点击播放
        if (playButton.length > 0) {
          video.pause();
          switchButton(playButton, function (button) {
            var liElement = button.closest('li');
            var localId = liElement.attr('localId');
            var voiceUrl = liElement.attr('voiceUrl');
            if (localId) {
              if (voiceUrl) {
                voiceUrl = '../../movieEnglishService/' + voiceUrl + '.amr';
                // File Reader 返回 buffer array
                function readBlob(blob, callback) {
                  var reader = new FileReader();
                  reader.onload = function (e) {
                    var data = new Uint8Array(e.target.result);
                    callback(data);
                  };
                  reader.readAsArrayBuffer(blob);
                }

                // AMR 解码
                function playAmrArray(array) {
                  var samples = AMR.decode(array);
                  if (!samples) {
                    // alert('Failed to decode!');
                    return;
                  }
                  playPcm(samples);
                }

                // 播放 AudioContext
                function playPcm(samples) {
                  var ctx = getAudioContext();
                  var src = ctx.createBufferSource();
                  var buffer = ctx.createBuffer(1, samples.length, 8000);
                  if (buffer.copyToChannel) {
                    buffer.copyToChannel(samples, 0, 0)
                  } else {
                    var channelBuffer = buffer.getChannelData(0);
                    channelBuffer.set(samples);
                  }

                  src.buffer = buffer;
                  src.connect(ctx.destination);
                  src.start();
                }

                // 返回 AudioContext 音频处理对象
                // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
                function getAudioContext() {
                  if (!gAudioContext) {
                    gAudioContext = new AudioContext();
                  }
                  return gAudioContext;
                }

                var gAudioContext = new AudioContext();
                debugger;
                fetch(voiceUrl)
                  .then(function (res) {
                    return res.blob();
                  })
                  .then(function (myBlob) {
                    readBlob(myBlob, function (data) {
                      playAmrArray(data);
                    });
                  });
              } else {
                wx.playVoice({
                  localId: localId
                });
              }
            } else {
              alert('请先录音...');
            }
          }, function (button) {
            var localId = button.closest('li').attr('localId');
            wx.stopVoice({
              localId: localId
            });
          });
        }
        //点击上传
        if (uploadButton.length > 0) {
          video.pause();
          switchButton(uploadButton, function (button) {
            var localId = button.closest('li').attr('localId');
            var importantSentence = [];
            var localVoice = {};
            $('.page-movie-player .subtitle li').each(function (i, e) {
              $element = $(e);
              var localId = $element.attr('localId');
              var serverId = $element.attr('serverId');
              if ($element.hasClass('important')) {
                importantSentence.push(i);
              }
              if (localId) {
                localVoice[i] = localId;
              }
            });
            if (localId) {
              wx.uploadVoice({
                localId: localId,
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                  var serverId = res.serverId; // 返回音频的服务器端ID
                  var postData = {
                    serverId: serverId,
                    token: WXTOKEN.token,
                    multipleId: multipleId,
                    sentenceId: '' + button.closest('li').index(),
                    important: JSON.stringify(importantSentence),
                    localVoice: JSON.stringify(localVoice)
                  };

                  button.closest('li').attr('serverId', serverId);

                  pageManager.ajaxManager({
                    url: API.movie.uploadVoiceToServer.url,
                    data: {
                      serverId: serverId,
                      token: WXTOKEN.token,
                      multipleId: multipleId,
                      sentenceId: button.closest('li').index(),
                      important: JSON.stringify(importantSentence),
                      localVoice: JSON.stringify(localVoice)
                    },
                    type: 'post',
                    dataType: 'text',
                    success: function (res) {
                      var dialogCfg = {
                        type: 'append',
                        viewModel: {
                          id: 'iosDialog1',
                          isShowTitle: true,
                          isShowFooter: false,
                          title: 'aaa',
                          content: res,
                          primaryText: '是',
                          onClickPrimaryText: function (event, data) {
                          },
                          defaultText: '否',
                          onClickDefault: function (event, data) {
                          },
                          onClickMask: function () {
                            dialogComponent.destroy();
                          }
                        }
                      };
                      var dialogComponent = createComponent('dialog', dialogCfg);
                    },
                    fail: function (ex) {
                      pageManager.showTooltip(ex.responseText, 'error');
                    }
                  })();
                }
              });
            } else {
              alert('请先录音...');
            }
          }, function (button) {
//            var serverId = button.closest('li').attr('serverId');
//            wx.downloadVoice({
//              serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
//              isShowProgressTips: 1, // 默认为1，显示进度提示
//              success: function (res) {
//                var localId = res.localId; // 返回音频的本地ID
//                alert(localId);
//              }
//            });
          });
        }
        //点击下载
//        if(downloadButton.length > 0){
//          switchButton(downloadButton, function (button) {
        //暂时不用这种方式的下载而是下载真正的音频文件
//            wx.downloadVoice({
//              serverId: button.closest('li').attr('serverId'), // 需要下载的音频的服务器端ID，由uploadVoice接口获得
//              isShowProgressTips: 1, // 默认为1，显示进度提示
//              success: function (res) {
//                var localId = res.localId; // 返回音频的本地ID
//              }
//            });
//$('body').append('<iframe id="voiceIframe" src="https://api.weixin.qq.com/cgi-bin/media/get?media_id=' + button.closest('li').attr('serverId') + '&access_token='+ WXTOKEN.token +'"></iframe>');
//            setTimeout(function(){
//              $('iframe#voiceIframe').remove();
//            }, 2000);
//          }, function(button){});
//        }
        //点击重点句
        if (importantButton.length > 0) {
          switchButton(importantButton, function (button) {
            button.closest('li').addClass('important');
          }, function (button) {
            button.closest('li').removeClass('important');
          });
        }
        //点击每条句子
        if (sentence.length > 0) {
          //点击每个单词
          if (event.target.tagName.toUpperCase() === 'I') {
            var _word = target.text();
            var youdaoAPI = 'http://fanyi.youdao.com/openapi.do?keyfrom=movieEnglishMaster&key=1411892318&type=data&doctype=jsonp&callback=getWordTranslation&version=1.1&q=' + _word;
            if ($('#youdao_' + _word).length === 0) {
              var scriptElement = document.createElement('script');
              scriptElement.id = 'youdao_' + _word;
              scriptElement.src = youdaoAPI;
              scriptElement.type = 'text/javascript';
              document.body.appendChild(scriptElement);
            }
          }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
      },
//      setSubtitleInfo: function(){
//        var importantSentence = [];
//        var localVoice = {}, serverVoice = {};
//        $('.page-movie-player .subtitle li').each(function(i, e){
//          $element = $(e);
//          var localId = $element.attr('localId');
//          var serverId = $element.attr('serverId');
//          if($element.hasClass('important')){
//            importantSentence.push(i);
//          }
//          if(localId){
//            localVoice[i] = localId;
//          }
//          if(serverId){
//            serverVoice[i] = serverId;
//          }
//        });
//        pageManager.ajaxManager({
//          url: API.movie.setSubtitleInfo.url,
//          type: 'post',
//          dataType: 'text',
//          data: {
//            multipleId: multipleId,
//            important: JSON.stringify(importantSentence),
//            localVoice: JSON.stringify(localVoice),
//            serverVoice: JSON.stringify(serverVoice)
//          },
//          success: function(res){
//            console.log(res);
//          }
//        })();
//      }
    },
    pointer: 0,
    autoRepeat: true,
    pointerRecorder: [],
    repeatPointer: 0,
    isRepeat: false,
    isRecording: false,
    bindtimeupdate: function (currentTime) {
      var video = $('#video')[0];
      var currentTime = parseInt(currentTime);
      var range = this.getTimeRange.call(this, this.repeatPointer);
      if (this.autoRepeat) {
        if (/(\d+,)\1\1/.test(this.pointerRecorder.join(''))) {
          $('.subtitle li').eq(this.pointer + 1).find('.repeat').trigger('click');
          this.pointerRecorder = [];
          this.focusSentence.call(this, this.getTimeRange.call(this, this.pointer)[0] + 1);
        }
        ;
      }
      if (this.isRepeat && currentTime > range[1]) {
        video.currentTime = range[0];
        this.pointerRecorder.push(this.pointer + ',');
      }
      !this.isRepeat && this.focusSentence.call(this, currentTime);
    },
    getTimeRange: function (index) {
      var range = this.viewModel.subtitle[index].t;
      return [Math.floor(parseInt(range[0]) / 1000), Math.ceil(parseInt(range[1]) / 1000)];
    },
    focusSentence: function (currentTime) {
      for (var i = 0, len = this.viewModel.subtitle.length, range = null; i < len; i++) {
        range = this.getTimeRange.call(this, i);
        if (currentTime > range[0] && currentTime < range[1]) {
          this.pointer = i;
          var $currentLi = $('.subtitle li').eq(i);
//          var offsetTop = 0;
//          $('.subtitle li').each(function (n, e) {
//            if (n < i) {
//              offsetTop += $(e).height();
//            }
//          });
          $('li.active').removeClass('active');
          $currentLi.addClass('active');
//          $('.subtitle').css('top', 100 - offsetTop > 0 ? 0 : 100 - offsetTop);
          try {
            var prevLi = $currentLi.prev();
            prevLi[0].scrollIntoView();
            if (/<i>/.test(prevLi.find('b').html())) {
              prevLi.find('b').html(prevLi.find('b').text());
            }
            if (!/<i>/.test($currentLi.find('b').html())) {
              var htmlStr = $currentLi.find('b').text().replace(/\b([^\s\d]+)\b/g, '<i>$1</i>');
              $currentLi.find('b').html(htmlStr);
            }
          } catch (ex) {
            $currentLi[0].scrollIntoView();
            if (!/<i>/.test($currentLi.find('b').html())) {
              var htmlStr = $currentLi.find('b').text().replace(/\b([^\s\d]+)\b/g, '<i>$1</i>');
              $currentLi.find('b').html(htmlStr);
            }
          }
        }
      }
    },
    switchReapeat: function (e) {
      this.isRepeat = e.hasClass('checked');
      console.log(this.isRepeat);
      this.repeatPointer = this.isRepeat ? this.pointer : 0;
    },
    afterRenderPage: function () {
      var video = $('#video')[0];
      setTimeout(function () {
        video.play();
        var subTitle = pageCfg.viewModel.subtitle;
        setInterval(function () {
          var currentTime = video.currentTime;
          pageCfg.bindtimeupdate.call(pageCfg, currentTime);
        }, 1000);
      }, 15000);
//      $('#saveConfig')[0].onclick = function(event){
//        pageCfg.viewModel.setSubtitleInfo();
//      };


      //Get subtitle
      // pageManager.ajaxManager({
      //   url: API.movie.getSubtitle.url,
      //   type: 'get',
      //   data: {
      //     subtitleUrl: utils.getInfoFromURL().param.subtitleUrl
      //   },
      //   success: function (res) {
      pageCfg.viewModel.subtitle = SUBTITLE;
      //     pageManager.ajaxManager({
      //       url: API.movie.getSubtitleInfo.url,
      //       type: 'get',
      //       data: {
      //         multipleId: multipleId
      //       },
      //       success: function (res) {
      //         debugger;
      //         var liCollection = $('.page-movie-player .subtitle li');
      //         var data = res.data[0];
      //         var important = /^\[/.test(data.important) && JSON.parse(data.important);
      //         var localVoice = /^\{/.test(data.localVoice) && JSON.parse(data.localVoice);
      //         var voiceUrl = /^\{/.test(data.voiceUrl) && JSON.parse(data.voiceUrl);
      //         important.forEach(function (v) {
      //           liCollection.eq(v).addClass('important');
      //         });
      //         for (var l in localVoice) {
      //           liCollection.eq(l).attr('localId', localVoice[l]);
      //         }
      //         for (var s in voiceUrl) {
      //           var _url = multipleId + '_' + s;
      //           liCollection.eq(s).attr('voiceUrl', _url);
      //         }
      //       },
      //       fail: function (ex) {
      //         pageManager.showTooltip('获取字幕信息失败');
      //       }
      //     })();
      //   },
      //   fail: function (ex) {
      //     pageManager.showTooltip('获取字幕失败');
      //   }
      // })();
    }
  };
  $('.subtitle')[0].onclick = pageCfg.viewModel.onClickSubtitle;
  ;pageCfg.afterRenderPage()});