<?php
header('Access-Control-Allow-Origin: *');

$appid = 'wx5246e0bfe2bb346c';
$secret = '8d1bef8ca4b8142af3a1db5b1cd85100';


$currentURL = urldecode($_GET['url']);
$nonceStr = 'yy352a50t66qp68';
$timestamp = time();
$url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$appid.'&secret='.$secret;

$tokenString = file_get_contents($url);
preg_match('/access_token\":\"([^\"]+)\"/', $tokenString, $token);
$token = $token[1];
$url2 = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='.$token.'&type=jsapi';
$ticket = file_get_contents($url2);
preg_match('/ticket\":\"([^\"]+)\"/', $ticket, $ticket);
// var_dump($ticket[1]);
$ticket = $ticket[1];
$signature = 'jsapi_ticket='.$ticket.'&noncestr='.$nonceStr.'&timestamp='.$timestamp.'&url='.$currentURL;
// echo $signature;
$signature = sha1($signature);
print <<<kkk
{
  "nonceStr": "{$nonceStr}",
  "timestamp": "{$timestamp}",
  "url": "{$currentURL}",
  "signature": "{$signature}",
  "appid": "{$appid}",
  "secret": "{$secret}",
  "token": "{$token}",
  "jsTicket": "{$ticket}"
}
kkk;

?>

