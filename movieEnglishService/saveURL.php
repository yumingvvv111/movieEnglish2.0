<?php
include 'db.php';
$url = $_REQUEST['url'];
$movieId = $_REQUEST['movieId'];
$query2 = "UPDATE `movie` SET url = '{$url}' WHERE movieId = '{$movieId}'";
mysql_query($query2);
?>