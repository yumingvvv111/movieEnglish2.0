<?php
include 'db.php';
$media_id = $_REQUEST['serverId'];
$token = $_REQUEST['token'];

$multipleId = $_REQUEST['multipleId'];
$sentenceId = $_REQUEST['sentenceId'];

$important = $_REQUEST['important'];
$localVoice = $_REQUEST['localVoice'];
$serverVoice = $token.'___'.$media_id;

$audioId = $multipleId."_".$sentenceId;


// var_dump($_REQUEST);

$url = 'https://api.weixin.qq.com/cgi-bin/media/get';
//url-ify the data for the POST
$fields_string = '';
$fields = array('media_id' => $media_id, 'access_token' => $token);
foreach($fields as $key=>$value) {
  $fields_string .= $key.'='.$value.'&';
}
$fields_string = rtrim($fields_string,'&');
//echo $fields_string;



//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch,CURLOPT_POST,count($fields));
curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//execute post
$result = curl_exec($ch);

$myfile = fopen($audioId.'.amr', "w+") or die("Unable to open file!");
fwrite($myfile, $result);
fclose($myfile);

echo $audioId;

// print(preg_replace('/^1/', '', $result));

//持久化
function getData($query, $nullVal, $isArray, $originalArray) {
    $result = mysql_query($query);
    $schema = array("code" => 0, "message" => '', "data" => "");
    if ($result) {
        $data = array();
        while (!!$info = mysql_fetch_row($result)) {
            $num = 0;
            foreach ($originalArray as $key => $value) {
                $originalArray[$key] = $info[$value];
                // var_dump($key.'-----'.$info[$value]);
                $num++;
            }
            
            $data[] = $originalArray;
            $schema['message'] = 'success';
            $schema['data'] = $isArray ? $data : $data[0];
    }
    } else {
        $schema['code'] = 1;
        $schema['message'] = 'error';
        $schema['data'] = $nullVal;
    }
    return $schema;
}

$query = "SELECT * from `subtitleInfo` WHERE multipleMovieID = '".$multipleId."'";

$fetchRow = getData($query, 'null', true, array(
        "important" => 1,
        "localVoice" => 2,
        "voiceUrl" => 4
          ));
// var_dump($fetchRow);
if($fetchRow['data'][0] != '' && $fetchRow['data'][0] != 'null'){
    //update
// $oldImportant = json_decode($fetchRow['data']['important']);
// $oldLocalVoice = json_decode($fetchRow['data']['localVoice']);
$oldVoiceUrl = json_decode($fetchRow['data'][0]['voiceUrl'], true);

$oldVoiceUrl[strval($sentenceId)] = 1;
// var_dump($oldVoiceUrl);
$newVoiceUrl = json_encode($oldVoiceUrl);

$query2 = "UPDATE `subtitleInfo` SET important = '{$important}', localVoice = '{$localVoice}', serverVoice = '{$serverVoice}', voiceUrl = '{$newVoiceUrl}' WHERE multipleMovieID = '{$multipleId}'";
mysql_query($query2);
}else{
	//insert
$newVoiceUrl = array();
$newVoiceUrl[strval($sentenceId)] = 1;
$newVoiceUrl = json_encode($newVoiceUrl);

$query3 = "INSERT INTO `subtitleInfo` (`multipleMovieID`, `important`, `localVoice`, `serverVoice`, `voiceUrl`) VALUES ('{$multipleId}', '{$important}', '{$localVoice}', '{$serverVoice}', '{$newVoiceUrl}')";
mysql_query($query3);
}
?>