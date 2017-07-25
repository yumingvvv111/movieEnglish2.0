<?php
session_start();
require_once 'db.php';

//'20140304121259583'.'892';//year.month.date.hour.minute.second.msecond.random*3

$userName = $_POST['user_name'];
$userPassword = md5($_POST['user_password']);

$query2 = "SELECT * FROM `video_user` WHERE name='{$userName}'";

$result2 = mysql_query($query2) or die(mysql_error());
$num = mysql_num_rows($result2);

if ($num == 0) {
	// $result = mysql_query($query) or die(mysql_error());
	// if ($result) {
	// //FIXME: Y/N
	// //$_SESSION['userName'] = $userName;
	// echo "<success3>{$userName}</success3>";
	// } else {
	// echo "<error3>注册失败</error3>";
	// mysql_close();
	// }
	echo '<error4>用户不存在</error4>';
} else {
	$userInfo = mysql_fetch_array($result2);
	if ($userPassword != $userInfo["password"]) {
		echo '<error4>password wrong</error4>';
	} else {
		//$_SESSION['userName'] = $userName;
		$_SESSION["userID"] = $userInfo["userID"];//$userInfo["userID"];
		//setcookie("userName",$userInfo["userName"],time()+3600*6);
		//setcookie("userID",$userInfo["userID"],time()+3600*6);
		
		//session_register("userID");
		//$userID = $userInfo['userID'];
		echo '<success4>{"userName":"' . $userInfo["name"] . '","userID":"' . $userInfo["userID"] . '"}</success4>';
	}
}
//$sql = "insert into member values('','" . $_POST['member_user'] . "','" . md5($_POST['member_password']) . "','" . $_POST['member_name'] . "','" . $_POST['member_sex'] . "','" . $_POST['member_qq'] . "','" . $_POST['member_phone'] . "','" . $_POST['member_email'] . "')";
?>