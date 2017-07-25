<?php
header('Access-Control-Allow-Origin: *');

$url = $_GET['proxy'];
$grant_type = $_POST['grant_type'];
$appid = $_POST['appid'];
$secret = $_POST['secret'];
$fields = array(
            'grant_type'=>urlencode($grant_type),
            'appid'=>urlencode($appid),
            'secret'=>urlencode($secret),
        );


//url-ify the data for the POST
$fields_string = '';
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

//execute post
$result = curl_exec($ch);

print(preg_replace('/^1/', '', $result));

?>

{
  "nonceStr": "nw352a50t14qp60",
  "timestamp": "1488254520",
  "url": "https://weui.io/",
  "signature": "a0d344b0ad97a0c099848fd30d53354fa3b9f5e6",
  "appid": "wx5338462f141a2f51"
}