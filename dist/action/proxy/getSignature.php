<?php
header('Access-Control-Allow-Origin: *');

$appid = 'wx7883f3fde466515d';
$currentURL = urldecode($_GET['url']);
$nonceStr = 'nw352a50t66qp60';
$timestamp = time();
$url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$appid.'&secret=89f807980f4cc951504a3325fd8edfec';

$tokenString = file_get_contents($url);
preg_match('/access_token\":\"([^\"]+)\"/', $tokenString, $token);
$url2 = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='.$token[1].'&type=jsapi';
$ticket = file_get_contents($url2);
preg_match('/ticket\":\"([^\"]+)\"/', $ticket, $ticket);
// var_dump($ticket[1]);

$signature = 'jsapi_ticket='.$ticket[1].'&noncestr='.$nonceStr.'&timestamp='.$timestamp.'&url='.$currentURL;
// echo $signature;
$signature = sha1($signature);
print <<<kkk
{
  "nonceStr": "{$nonceStr}",
  "timestamp": "{$timestamp}",
  "url": "{$currentURL}",
  "signature": "{$signature}",
  "appid": "{$appid}"
}
kkk;

?>

