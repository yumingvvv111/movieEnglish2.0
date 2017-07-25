<?php
include 'db.php';
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



//从数据库获取
function getMovieList(){
$query = "select * from `movie`  limit 0,1000";
$userInfo = json_encode(getData($query, '[]', true, array(
        "movieId" => 0,
         "movieName" => 1,
          "url" => 2,
          "subtitleUrl" => 3
          )));
echo $userInfo;
}

getMovieList();
?>
