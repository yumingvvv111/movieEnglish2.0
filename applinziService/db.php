<?php
// 用户名　 :  SAE_MYSQL_USER
// 密　　码 :  SAE_MYSQL_PASS
// 主库域名 :  SAE_MYSQL_HOST_M
// 从库域名 :  SAE_MYSQL_HOST_S
// 端　　口 :  SAE_MYSQL_PORT
// 数据库名 :  SAE_MYSQL_DB
header("Content:text/json;charset=utf-8");
$linkID = @mysql_connect(SAE_MYSQL_HOST_M.':'.SAE_MYSQL_PORT, SAE_MYSQL_USER, SAE_MYSQL_PASS);
$bd = @mysql_select_db(SAE_MYSQL_DB);
mysql_query('set names utf8');
?>