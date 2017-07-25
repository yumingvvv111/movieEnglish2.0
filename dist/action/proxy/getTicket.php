<?php
header('Access-Control-Allow-Origin: *');

$url = $_GET['proxy'];
$access_token = $_POST['access_token'];
$type = $_POST['type'];
$fields = array(
            'access_token'=>urlencode($access_token),
            'type'=>urlencode($type)
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