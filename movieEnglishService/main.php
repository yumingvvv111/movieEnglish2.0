<?
session_start();
include 'db.php';

$callback = $_REQUEST['callback'];
$kind = $_REQUEST['kind'];
//TODO: movieID AND userID can not be serial number
$userID = $_SESSION['userID'];
//$_SESSION['userID']? $_SESSION['userID'] : 0;
$final_result = null;

function getData($query, $nullVal, $isArray) {
	$result = mysql_query($query);
	if ($result) {
		$data = array();
		while (!!$info = mysql_fetch_row($result)) {
			$data[] = $info[0];
		}
		return $isArray ? $data : $data[0];
	} else {
		return $nullVal;
	}
}

function getKindResult($kind, $pointers, $userID) {
	$query = "SELECT * FROM `video_movies` WHERE kind='" . $kind . "'";
	$result = mysql_query($query);
	$data = array();
	while (!!$info = mysql_fetch_row($result)) {
		$data[] = array(
		"id" => $info[0],
		 "title" => $info[1],
		  "posters" => $info[2],
		   "kind" => $info[3],
		    "userID" => $info[4],
		     "subtitleURL" => $info[5],
		      "movieURL" => array(
		      "remote" => getData("SELECT URL FROM `video_remoteurl` WHERE movieID='{$info[0]}' AND (userID='{$userID}' OR userID='u140312083306571')", 0, true),
		       "local" => getData("SELECT URL FROM `video_localurl` WHERE movieID='{$info[0]}' AND (userID='{$userID}')", 0, true),
		        "remote_pointer" => (is_null($pointers["remote"][$info[0]]) ? 1 : $pointers["remote"][$info[0]]),
		         "local_pointer" => (is_null($pointers["local"][$info[0]]) ? 1 : $pointers["local"][$info[0]])
				 ));
	}
	return $data;
	//$final_result = '{"movies":' . $json . '}';
}

$pointers = json_decode(getData("SELECT pointer FROM `video_user` WHERE userID='{$userID}'", "{\"remote\":\"0\",\"local\":\"0\"}", false), true);
$final_result = '{"movies":' . json_encode(getKindResult($kind, $pointers, $userID)) . '}';

mysql_close();
//$output = array('movies' => array( array("id" => 01, "title" => "Pompeii", "posters" => "http://content9.flixster.com/movie/11/17/55/11175511_det.jpg", "kind" => "classic_movie",
//      "year"=> "2014",
//      "runtime"=> "102",

//"movieURL" => array("remote" => array("http://muban.us/videoplayer/it1-3.mp4", "http://muban.us/videoplayer/it1-3.mp4"), "remote_pointer" => 1, "local_pointer" => 1, "local" => 0)), array("id" => 02, "title" => "Pompeii", "posters" => "http://content7.flixster.com/movie/11/17/49/11174993_det.jpg", "kind" => "classic_movie", "year" => "2014", "runtime" => "102", "movieURL" => array("remote" => array("http://muban.us/videoplayer/it1-3.mp4", "http://muban.us/videoplayer/it1-3.mp4"), "remote_pointer" => 1, "local_pointer" => 1, "local" => array("file:///F:/e2php_12_20/htdocs/videoplayer/it1_3.mp4", "file:///F:/e2php_12_20/htdocs/videoplayer/it1_3.mp4")))));
// }

//if ($kind == 'classic_movie') {
//	$output = array('movies' => array( array("id" => 01, "title" => "hhompeii", "posters" => "http://content9.flixster.com/movie/11/17/55/11175511_det.jpg", "kind" => "classic_movie", "year" => "2014", "runtime" => "102", "movieURL" => array("remote" => array("http://muban.us/videoplayer/it1-3.mp4", "http://muban.us/videoplayer/it1-3.mp4"), "remote_pointer" => 1, "local_pointer" => 2, "local" => array("file:///F:/e2php_12_20/htdocs/videoplayer/it1_3.mp4", "file:///F:/e2php_12_20/htdocs/videoplayer/it1_3.mp4"))), array("id" => 02, "title" => "Pompeii", "posters" => "http://content7.flixster.com/movie/11/17/49/11174993_det.jpg", "kind" => "classic_movie", "year" => "2014", "runtime" => "102", "movieURL" => array("remote" => array("http://muban.us/videoplayer/it1-3.mp4", "http://muban.us/videoplayer/it1-3.mp4"), "remote_pointer" => 1, "local" => 0))));
//}

if ($callback) {
	header('Content-Type: text/javascript');
	echo $callback . '(' . $final_result . ');';
} else {
	header('Content-Type: application/x-json');
	echo json_encode($final_result);
}
?>