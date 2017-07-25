<?php

$movieURL = $_GET['movieURL'];
$subtitle = $_GET['subtitle'];
$movieID = $_GET['movieID'];

print <<<MAIN

<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="selector.css" type="text/css">
<link href="bootstrap.min.css" rel="stylesheet" type="text/css" />
<link href="bootstrap-dialog.min.css" rel="stylesheet" type="text/css" />
<link type="text/css" rel="stylesheet" href="style.css"/>
		<script type="text/javascript" src="jquery-2.1.4.min.js"></script>
    <script src="bootstrap.min.js"></script>
    <script src="bootstrap-dialog.min.js"></script>
		<script type="text/javascript" src="FileSaver.min.js"></script>
		<script type="text/javascript">
		function getMovieID(){
			return '$movieID';
		}
		function getMovieName(){
			return '$movieURL'.replace(/\.\w+$/,'');
		}
		</script>
		<style>
		body{padding:0;margin:0; zoom: 0.5;}
		.close-translate,.add-word{width: 60px;height: 60px; position:absolute;right: -30px;display:block; z-index:999999;background: white;border-radius: 30px;text-align: center;font-size: 50px;font-weight: normal;color: #dfdfdf;line-height:60px;}
		.close-translate{top: -20px;}
		.add-word{bottom: -20px;font-size:60px;line-height:30px;}
		#myWords{width:50%;min-height:300px;overflow:scroll;}
    .canvas-pic{width:33.33%;height:33.33%;float:left;}
    #video{object-fit:fill;}
    #YOUDAO_SELECTOR_WRAPPER, #YOUDAO_SELECTOR_WRAPPER iframe{
    width: 690px !important;
    height: 320px !important;
  }
		</style>

	<body>
		<div class="main">
			<div class="video-container">
				<video id="video" controls="" preload="none" height=470 width=800 src="movies/$movieURL">	
				</video>
        <div id="mp4"></div>
				<div id="subtitle">
					<span>subtitle loading...</span>
				</div>
			</div>
			<div class="dialogue">
				
				<select id="targetLangSel">
	<option value="OK">选择语言</option>
  <option value="zh-CN">中文(简体)</option>				
  <option value="zh-TW">中文(繁体)</option>
  <option value="en">英语</option>
  <option value="de">德语</option>
  <option value="ru">俄语</option>
  <option value="fr">法语</option>
  <option value="ja">日语</option>
  <option value="ko">韩语</option>
  <option value="sq">阿尔巴尼亚语</option>
  <option value="ar">阿拉伯语</option>
  <option value="am">阿姆哈拉语</option>
  <option value="az">阿塞拜疆语</option>
  <option value="ga">爱尔兰语</option>
  <option value="et">爱沙尼亚语</option>
  <option value="eu">巴斯克语</option>
  <option value="be">白俄罗斯语</option>
  <option value="bg">保加利亚语</option>
  <option value="is">冰岛语</option>
  <option value="pl">波兰语</option>
  <option value="bs">波斯尼亚语</option>
  <option value="fa">波斯语</option>
  <option value="af">布尔语(南非荷兰语)</option>
  <option value="da">丹麦语</option>
  <option value="tl">菲律宾语</option>
  <option value="fi">芬兰语</option>
  <option value="fy">弗里西语</option>
  <option value="km">高棉语</option>
  <option value="ka">格鲁吉亚语</option>
  <option value="gu">古吉拉特语</option>
  <option value="kk">哈萨克语</option>
  <option value="ht">海地克里奥尔语</option>
  <option value="ha">豪萨语</option>
  <option value="nl">荷兰语</option>
  <option value="ky">吉尔吉斯语</option>
  <option value="gl">加利西亚语</option>
  <option value="ca">加泰罗尼亚语</option>
  <option value="cs">捷克语</option>
  <option value="kn">卡纳达语</option>
  <option value="co">科西嘉语</option>
  <option value="hr">克罗地亚语</option>
  <option value="ku">库尔德语</option>
  <option value="la">拉丁语</option>
  <option value="lv">拉脱维亚语</option>
  <option value="lo">老挝语</option>
  <option value="lt">立陶宛语</option>
  <option value="lb">卢森堡语</option>
  <option value="ro">罗马尼亚语</option>
  <option value="mg">马尔加什语</option>
  <option value="mt">马耳他语</option>
  <option value="mr">马拉地语</option>
  <option value="ml">马拉雅拉姆语</option>
  <option value="ms">马来语</option>
  <option value="mk">马其顿语</option>
  <option value="mi">毛利语</option>
  <option value="mn">蒙古语</option>
  <option value="bn">孟加拉语</option>
  <option value="my">缅甸语</option>
  <option value="hmn">苗语</option>
  <option value="xh">南非科萨语</option>
  <option value="zu">南非祖鲁语</option>
  <option value="ne">尼泊尔语</option>
  <option value="no">挪威语</option>
  <option value="pa">旁遮普语</option>
  <option value="pt">葡萄牙语</option>
  <option value="ps">普什图语</option>
  <option value="ny">齐切瓦语</option>
  <option value="sv">瑞典语</option>
  <option value="sm">萨摩亚语</option>
  <option value="sr">塞尔维亚语</option>
  <option value="st">塞索托语</option>
  <option value="si">僧伽罗语</option>
  <option value="eo">世界语</option>
  <option value="sk">斯洛伐克语</option>
  <option value="sl">斯洛文尼亚语</option>
  <option value="sw">斯瓦希里语</option>
  <option value="gd">苏格兰的盖尔语</option>
  <option value="ceb">宿务语</option>
  <option value="so">索马里语</option>
  <option value="tg">塔吉克语</option>
  <option value="te">泰卢固语</option>
  <option value="ta">泰米尔语</option>
  <option value="th">泰语</option>
  <option value="tr">土耳其语</option>
  <option value="cy">威尔士语</option>
  <option value="ur">乌尔都语</option>
  <option value="uk">乌克兰语</option>
  <option value="uz">乌兹别克语</option>
  <option value="iw">希伯来语</option>
  <option value="el">希腊语</option>
  <option value="es">西班牙语</option>
  <option value="haw">夏威夷语</option>
  <option value="sd">信德语</option>
  <option value="hu">匈牙利语</option>
  <option value="sn">修纳语</option>
  <option value="hy">亚美尼亚语</option>
  <option value="ig">伊博语</option>
  <option value="it">意大利语</option>
  <option value="yi">意第绪语</option>
  <option value="hi">印地语</option>
  <option value="su">印尼巽他语</option>
  <option value="id">印尼语</option>
  <option value="jw">印尼爪哇语</option>
  <option value="yo">约鲁巴语</option>
  <option value="vi">越南语</option>
</select>
				<!--//<input id="minus" class="trimming" value="-" type="button"/>
				<input id="adjustValue" value="0" type="text"/>
				<input id="plus" class="trimming" value="+" type="button"/>-->
				<div class="ul-wrap">
					<ul>

MAIN;


$file = file_get_contents('movies/' . $subtitle);
// print($file);
// $file = iconv("gb2312", "utf-8//IGNORE", $file);
// var_dump($file);
$num = 0;
preg_match_all('/([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*?-->\s*?([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})([\s\S]*?)(?:[\r\n\s]{4,})/', $file, $result, PREG_PATTERN_ORDER);

$result = $result[0];
foreach ($result as $line) {
	$li = preg_replace('/([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*?-->\s*?([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})([\s\S]*?)(?:[\r\n\s]{4,})/', '<li data-st="$1" data-et="$2" data-index="' . $num . '"><b onclick="ulWrapLiBHandler.call(this,null)"><span>$3</span></b><input type="button" value="REPEAT"><input type="button" value="IMPORTANT"></li>', $line);
	$num++;
	echo $li;
}

print <<<MAIN2
</ul>
				</div>
			</div>
		</div>
		<input id="up" type="button" value="up"/>
		<input id="down" type="button" value="down"/>
		<script type="text/javascript" src="player.js"></script>
		
		<script type="text/javascript">
			importantCallback();
		</script>
<div id="YOUDAO_SELECTOR_WRAPPER" style="display:none; z-index:9999; margin:0; border:0; padding:0; width:690px; height:920px;"></div>
<button id="prev" class="btn btn-primary" title="Prev Sentence">&lt;</button>
<button id="showWords" class="btn btn-primary" title="OPen Words">OW</button>
<button id="addMask" class="btn btn-primary" title="Add Mask">AM</button>
<button id="onlyImportant" type="button" class="btn only-important btn-primary" title="Only Important">OI</button>
<button id="downloadImportant" class="btn download-important btn-primary" title="Download Important">DI</button>
<button id="downloadLanguage" class="btn btn-primary download-language" title="Download Language">DL</button>
<button id="downloadWords" class="btn btn-primary download-words" title="Download Words">DW</button>
<button id="changeMask" class="btn btn-primary change-mask" title="Change Mask">CM</button>
<button id="autoRepeat" class="btn btn-primary auto-repeat" title="Auto Repeat">AR</button>
<button id="next" class="btn btn-primary" title="Next Sentence">&gt;</button>



<div id="myWords" style="display:none;"></div>
<input id="allWords" type="hidden" />
<div id="maskLayer" style="width:70%; height:100%; position:absolute; left:0; top:0; z-inde:999999; background: #fff; display:none;">
<canvas class="canvas-pic" id="maskCanvas1"></canvas>
<canvas class="canvas-pic" id="maskCanvas2"></canvas>
<canvas class="canvas-pic" id="maskCanvas3"></canvas>
<canvas class="canvas-pic" id="maskCanvas4"></canvas>
<canvas class="canvas-pic" id="maskCanvas5"></canvas>
<canvas class="canvas-pic" id="maskCanvas6"></canvas>
<canvas class="canvas-pic" id="maskCanvas7"></canvas>
<canvas class="canvas-pic" id="maskCanvas8"></canvas>
<canvas class="canvas-pic" id="maskCanvas9"></canvas>
</div>
<script type="text/javascript" src="translate.js" charset="utf-8"></script>
MAIN2;
?>
