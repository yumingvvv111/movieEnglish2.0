<?php

/**
 * Created by 独自等待
 * Date: 2016/10/11
 * Time: 14:35
 * Name: ximalaya.php
 * 独自等待博客：http://www.waitalone.cn/
 */
print_r('
+---------------------------------------------------------------------+
                       喜马拉雅mp3批量下载工具
                     Site：http://www.waitalone.cn/
                        Exploit BY： 独自等待
                          Time：2016-10-11
+---------------------------------------------------------------------+
');
set_time_limit(0);
error_reporting(7);
if ($argc < 2) {
    print_r('
+---------------------------------------------------------------------+
Useage: php ' . $argv[0] . ' 喜马拉雅mp3专辑地址
Example: php ' . $argv[0] . ' http://www.ximalaya.com/1412917/album/239463
+---------------------------------------------------------------------+
    ');
    exit;
}

class ximalaya
{
    public $url;

    public function __construct($url)
    {
        $this->url = $url;
    }

    public function getpage()
    {
        $purl = array();
        $response = file_get_contents($this->url);
        if (preg_match_all('/class=\'pagingBar_page\'/', $response, $match)) {
            $pagelen = count($match[0]);
            for ($i = 1; $i <= $pagelen; $i++) {
                $purl[] = $this->url . '?page=' . $i;
            }
        } else {
            $purl[] = $this->url;
        }
        return $purl;
    }

    public function analyze($trackid)
    {
        $mp3_arr = array();
        $trackurl = 'http://www.ximalaya.com/tracks/' . $trackid . '.json';
        $response = file_get_contents($trackurl);
        $jsonobj = json_decode($response, true);
        $title = $jsonobj['title'];
        $mp3 = $jsonobj['play_path'];
        $mp3_arr['title'] = iconv('utf-8', 'gbk//IGNORE', $title);
        $mp3_arr['mp3'] = $mp3;
        return $mp3_arr;
    }

    public function getids($purl)
    {
        $ids = array();
        if (strpos($purl, 'sound')) {
            $ids[] = substr($purl, strrpos($purl, '/') + 1);
        } else {
            $response = file_get_contents($purl);
            preg_match('/sound_ids="(.+?)"/', $response, $match);
            $ids = explode(',', $match[1]);
        }
        return $ids;
    }

    public function down()
    {
        $todown = $this->getpage();
        foreach ($todown as $purl) {
            foreach ($this->getids($purl) as $ids) {
                $idsarr = $this->analyze($ids);
                $title = $idsarr['title'];
                $mp3_url = $idsarr['mp3'];
                $filename = $title . '.mp3';
                echo $filename . ' ' . $mp3_url . PHP_EOL;
                fwrite(fopen('mp3.txt', 'ab+'), $filename . ' | ' . $mp3_url . PHP_EOL);
                if (function_exists('system')) {
                    @ob_start();
                    $res = system('aria2c.exe -s 10 -j 10 ' . $mp3_url . ' --out=' . $filename);
                    @ob_get_contents();
                    @ob_end_clean();
                    if (strpos($res, 'OK')) {
                        echo $filename . ' 下载成功!' . PHP_EOL;
                    } else {
                        echo $filename . ' 下载失败!' . PHP_EOL;
                    }
                } else {
                    echo '请开启system函数以便多线程下载!tips: check disable_functions in php.ini' . PHP_EOL;
                }
            }
        }
    }
}

$ximalaya = new ximalaya($argv[1]);
$ximalaya->down();
?>