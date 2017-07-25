<?php
include 'db.php';
//'multipleId', 'important', 'localVoice', 'serverVoice'
$multipleId = $_REQUEST['multipleId'];
$important = $_REQUEST['important'];
$localVoice = $_REQUEST['localVoice'];
$serverVoice = $_REQUEST['serverVoice'];
echo $multipleId;
//从字幕文件夹获取文件列表
function getFile($dir) {
    $fileArray[]=NULL;
    $fileList = array();
    if (false != ($handle = opendir ( $dir ))) {
        $i=0;
        echo '[';
        while ( false !== ($file = readdir ( $handle )) ) {
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != ".." && strpos($file,".") && preg_match('/\.srt/', $file) ) {
                $fileArray[$i]=$file;
                preg_match_all('/(.*)\.srt/', $file, $fileName, PREG_PATTERN_ORDER);
                 // echo $i;
                $fileName = $fileName[1][0];
                $fileList[] = '{"i": '.$i.',"n":"'.$fileName.'","p":""},';
                if($i==200){
                    break;
                }
                $i++;
            }
        }
        // echo '<pre>';
        // var_dump($fileList);
        // echo '</pre>';
        $lastItem = $fileList[count($fileList)-1];
        $lastItem = preg_replace('/,$/', '', $lastItem);
        $fileList[count($fileList)-1] = $lastItem;
        foreach ($fileList as $key => $value) {
            echo $value;
        }
        echo ']';
        //关闭句柄
        closedir ( $handle );
    }
    return $fileArray;
}
 
 // getFile("subtitle");


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
$result = mysql_query($query);
if(mysql_fetch_row($result)){
//update
echo 'update';
$query2 = "UPDATE `subtitleInfo` SET important = '{$important}', localVoice = '{$localVoice}', serverVoice = '{$serverVoice}' WHERE multipleMovieID = '{$multipleId}'";
mysql_query($query2);
}else{
//insert
    echo 'insert';
$query3 = "INSERT INTO `subtitleInfo` (`multipleMovieID`, `important`, `localVoice`, `serverVoice`) VALUES ('{$multipleId}', '{$important}', '{$localVoice}', '{$serverVoice}')";
mysql_query($query3);
}



// //从数据库获取
// function getMovieList($userId){
// $query = "SELECT * FROM `user` WHERE userId='" . $userId . "'";
// $userInfo = json_encode(getData($query, '[]', true, array(
//         "userId" => 0,
//          "userName" => 1,
//           "movieIds" => 2)));
// echo $userInfo;
// }

// getMovieList($userId);
?>
