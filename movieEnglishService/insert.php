<?
session_start();
include 'db.php';
//header('Content-Type: text/javascript');
$table = $_POST['table'];
$movieID = $_POST['movieID'];
$URL = $_POST['url'];
$userID = $_SESSION['userID'];
// if ($table == 'movies') {
	// $query = "INSERT INTO `video_" . $table . "` (`ID`, `URL`, `userID`) VALUES ('{$movieID}', '{$URL}', '{$userID}')";
	// $result = msql_query($query);
// }
	$query = "INSERT INTO `uu156964`.`video_" . $table . "` (`movieID`, `URL`, `userID`) VALUES ('{$movieID}', '{$URL}', '{$userID}')";
	$result = mysql_query($query);

mysql_close();
?>