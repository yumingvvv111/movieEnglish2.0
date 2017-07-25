<?php
// header('Content-Type:video/mp4');
// header('Content-disposition: attachment; filename="1.mp4"');
// header('Cache-Control: no-cache, must-revalidate');
// header('Content-Length: 339721');

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'http://wwwv.applinzi.com/movieEnglishService/CmuI2nDMtDode69LTbxcPWqU7RUCr_r3CSt8A4lq6vTE8DBamdtOayeTfsl41i5K.amr');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$contents = curl_exec($ch);
// echo $contents;

$myfile = fopen("newfile.amr", "w+") or die("Unable to open file!");
// $txt = "Bill Gates\n";
fwrite($myfile, $contents);
fclose($myfile);


?>