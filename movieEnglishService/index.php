<?php

print <<<INDEX



INDEX;


//获取文件列表
function getFile($dir) {
    $fileArray[]=NULL;
    if (false != ($handle = opendir ( $dir ))) {
        $i=0;
        while ( false !== ($file = readdir ( $handle )) ) {
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != ".." && strpos($file,".") && preg_match('/\.mp4/', $file) ) {
                $fileArray[$i]=$file;
                preg_match_all('/(.*)\.mp4/', $file, $fileName, PREG_PATTERN_ORDER);
                // echo '<pre>';
                // var_dump($fileName);
                // echo '</pre>';
                $fileName = $fileName[1][0];
                echo '<p><a href="factory.php?movieURL=' . $fileName . '.mp4&subtitle=' . $fileName . ' [English].srt&movieID=' . $fileName . '-1" target="_blank">' . $file . '</a>'. '<br></p>';
                if($i==100){
                    break;
                }
                $i++;
            }
        }
        //关闭句柄
        closedir ( $handle );
    }
    return $fileArray;
}
 
 getFile("movies");


?>
