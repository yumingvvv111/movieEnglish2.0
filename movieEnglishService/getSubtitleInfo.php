<?php
include 'db.php';
//'multipleId', 'important', 'localVoice', 'serverVoice'
$multipleId = $_REQUEST['multipleId'];


function getData($query, $nullVal, $isArray, $originalArray) {
    $result = mysql_query($query);
    $schema = array("code" => 0, "message" => '', "data" => "");
    if ($result) {
        $data = array();
        while (!!$info = mysql_fetch_row($result)) {
            $num = 0;
            foreach ($originalArray as $key => $value) {
                $originalArray[$key] = $info[$value];
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
$result = json_encode(getData($query, '[]', true, array(
        "multipleId" => 0,
         "important" => 1,
          "localVoice" => 2,
          "voiceUrl" => 4
          )));

echo $result;

?>
