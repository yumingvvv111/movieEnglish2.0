<?php
header("Content:text/json;charset=utf-8");
$linkID = @mysql_connect('localhost', 'uu156964', 'vaKEzOdn');
$bd = @mysql_select_db('movieEnglish');
mysql_query('set names utf8');
?>