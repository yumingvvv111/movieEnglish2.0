<?php
$path = $_GET['path'];
$auth = $_GET['auth'];
$contenttype = $_GET['contenttype'];
$id = $_GET['id'];

$response = file_get_contents('https://api.pcloud.com/getvideolinks?path=' . $path .'&auth=' . $auth. '&contenttype='. $contenttype. '&id='. $id);
echo $response;
?>