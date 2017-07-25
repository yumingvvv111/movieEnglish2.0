<?php

$request = new HttpRequest();
$request->setUrl('https://api.pcloud.com/getvideolinks');
$request->setMethod(HTTP_METH_GET);

$request->setQueryData(array(
  'path' => '/Nodejs/Node.js Tutorial for Beginners - 3 - Basic Concepts.mp4',
  'auth' => 'e4crhkZLxrnZ5Jip9XwekgJGmlJjxtCFjV2gj0V7'
));

$request->setHeaders(array(
  'postman-token' => 'b307f612-a655-4b21-114a-21bc2a355084',
  'cache-control' => 'no-cache'
));

try {
  $response = $request->send();

  echo $response->getBody();
} catch (HttpException $ex) {
  echo $ex;
}