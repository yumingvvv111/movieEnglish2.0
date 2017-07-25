//题目的修改
function change_title(title) {

  document.title = title;
  var $iframe = $('<iframe src="./images/loading.png"></iframe>');
  $iframe.on('load', function () {
    setTimeout(function () {
      $iframe.off('load').remove();
    }, 0);
  }).appendTo($('body'));
}




