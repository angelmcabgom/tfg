<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if (isset($_GET['latitude']) && isset($_GET['longitude'])) {
    $latitude = $_GET['latitude'];
    $longitude = $_GET['longitude'];
    $apiKey = 'a67c4cfea78c47ba8616870b4751fa8f';
    $url = "https://api.opencagedata.com/geocode/v1/json?q={$latitude}+{$longitude}&key={$apiKey}";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if ($data && isset($data['results'][0]['components']['ISO_3166-1_alpha-2'])) {
        $countryCode = $data['results'][0]['components']['ISO_3166-1_alpha-2'];
        echo json_encode(['countryCode' => $countryCode]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No country found for the provided coordinates.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid parameters.']);
}
