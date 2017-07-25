<?php
$subtitle = $_GET['subtitleUrl'];
$file = file_get_contents('subtitle/' . $subtitle);

// $file = iconv("gb2312", "utf-8//IGNORE", $file);

//echo '<pre>';
// var_dump($file);
//echo '</pre>';
$num = 0;
preg_match_all('/([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*-->\s*([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})[\r\n\s]+((?:[^\r\n]+)[\r\n\s]+(?:[^\r\n]+)?(?=[\r\n\s]*\d))/', $file, $result, PREG_PATTERN_ORDER);

//echo '<pre>';
//var_dump($result);
//echo '</pre>';

$result = $result[0];
function fn($m2){
		$hour = intval($m2[1])*60*60*1000;
		$minute = intval($m2[2])*60*1000;
		$second = intval($m2[3])*1000;
		$millisecond = intval($m2[4]);
		return $hour + $minute + $second + $millisecond;
	}
function callback($m){
	$v1 = $m[1];
	$v2 = $m[2];
	$v3 = $m[3];
	$reg = '/(\d{2}):(\d{2}):(\d{2}),(\d{3})/';
	
	$v1 = preg_replace_callback($reg, 'fn', $v1);
	$v2 = preg_replace_callback($reg, 'fn', $v2);
	$v3 = preg_replace('/[\r\n\s]+\d+$/', '', $v3);

	//echo $v3.'<br><br><br><br><br><br><br>';
	return '{"i":__index__, "t":["'.$v1.'","'.$v2.'"],"s":"'.$v3.'"},';
}


echo '[';
foreach ($result as $line) {
	$newLine = preg_replace('/\"/', '\"', $line);
	//echo $newLine.'<br><br><br><br>';
	$li = preg_replace_callback('/([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*-->\s*([0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})[\r\n\s]+([\s\S]*)/', 'callback', $newLine);
	$li = preg_replace('/__index__/', $num, $li);
	$li = preg_replace('/[\r\n]/', '', $li);
	$num++;
	echo $li;
}
echo '{"t":["0","0"],"s":""}';
echo ']';
?>