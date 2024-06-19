<?php

require_once("../clases/conexion.php");
require_once("../vendor/autoload.php");

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$con = new Conexion;

/* Verificacion token */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'verifyToken') {
    if (isset($_POST['token'])) {
        $token = $_POST['token'];
        $key = 'your_secret_key';
        $algorithm = 'HS256';
        try {
            $decoded = JWT::decode($token, new Key($key, $algorithm));
            header("HTTP/1.1 200 OK");
            echo json_encode(array("message" => "valid", "data" => $decoded));
        } catch (Exception $e) {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("message" => "invalid", "error" => $e->getMessage()));
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Token not provided"));
    }
    exit();
}

/* Login */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];

        // Al usar sentencias preparadas se evitan ataques por inyeccion SQL
        $sql = "SELECT password, id, imagen FROM usuarios WHERE username = ?";

        try {
            $stmt = $con->prepare($sql);
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $passwordDB = $row['password'];
                $id = $row['id'];
                $imagen = $row['imagen'];

                if (password_verify($password, $passwordDB)) {
                    $expiresIn = time() + 3600;
                    $payload = array(
                        "id" => $id,
                        "exp" => $expiresIn
                    );
                    $key = 'your_secret_key';
                    $algorithm = 'HS256';
                    $jwt = JWT::encode($payload, $key, $algorithm);
                    header("HTTP/1.1 200 OK");
                    echo json_encode(array("token" => $jwt, "imagen" => $imagen));
                    exit();
                } else {
                    header("HTTP/1.1 401 Unauthorized");
                    echo json_encode(array("message" => "Invalid username or password"));
                }
            } else {
                header("HTTP/1.1 404 Not Found");
            }

            $stmt->close();
        } catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 500 Internal Server Exception");
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Username or password not provided"));
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'register') {
    if (
        isset($_POST['username']) && isset($_POST['name'])
        && isset($_POST['email']) && isset($_POST['password'])
        && isset($_POST['imagen'])
    ) {
        $username = $_POST['username'];
        $name = $_POST['name'];
        $email = $_POST['email'];
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

        $imagen = $_POST['imagen'];

        $sql = "INSERT INTO `usuarios` (`username`, `nombre`, `email`, `password`, `imagen`) 
        VALUES (?, ?, ?, ?, ?)";

        try {
            $stmt = $con->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }

            $stmt->bind_param("sssss", $username, $name, $email, $password, $imagen);

            $stmt->execute();
            if ($stmt->error) {
                throw new Exception("Execution failed: " . $stmt->error);
            }

            if ($stmt->affected_rows > 0) {
                header("HTTP/1.1 201 CREATED");
                echo json_encode($stmt->insert_id);
            } else {
                header("HTTP/1.1 500 Internal server exception");
            }

            $stmt->close();
        } catch (Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(array("message" => $e->getMessage()));
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Invalid register parameter"));
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'uploadImage') {
    if (isset($_FILES['imagen'])) {
        $uploadDirectory = "../assets/profileImg/";

        $maxSize = 5 * 1024 * 1024;
        if ($_FILES['imagen']['size'] > $maxSize) {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(array("message" => "Error: File size exceeded"));
            exit();
        }

        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];
        $extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        if (!in_array(strtolower($extension), $extensionesPermitidas)) {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(array("message" => "Error: File type not permitted"));
            exit();
        }

        if ($_FILES["imagen"]["error"] == UPLOAD_ERR_OK) {
            $tmpFilePath = $_FILES["imagen"]["tmp_name"];
            $imageName = uniqid() . "_" . basename($_FILES["imagen"]["name"]);
            $imagePath = $uploadDirectory . $imageName;

            if (move_uploaded_file($tmpFilePath, $imagePath)) {
                echo json_encode(array("success" => true, "imagePath" => $imageName));
            } else {
                header("HTTP/1.1 500 Internal Server Error");
                echo json_encode(array("message" => "Error uploading image"));
            }
        } else {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(array("message" => "Error: " . $_FILES["imagen"]["error"]));
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Image not provided"));
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT imagen FROM usuarios WHERE 1 ";

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $sql .= "AND id=?";
    }

    try {
        $stmt = $con->prepare($sql);

        if (isset($_GET['id'])) {
            $stmt->bind_param("s", $id);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $imagen = $result->fetch_all(MYSQLI_ASSOC);
            header("HTTP/1.1 200 OK");
            echo json_encode($imagen);
        } else {
            header("HTTP/1.1 404 Not Found");
            echo json_encode(array("message" => "User not found"));
        }

        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        header("HTTP/1.1 500 Internal Server Error");
        echo json_encode(array("message" => "Internal Server Error"));
    }
    exit;
}

/* Añadir a favoritos */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'favouriteDriver') {
    if (isset($_POST['token']) && isset($_POST['driver'])) {
        $token = $_POST['token'];
        $driver = $_POST['driver'];
        $key = 'your_secret_key';
        $algorithm = 'HS256';

        try {
            $decoded = JWT::decode($token, new Key($key, $algorithm));
            $userId = $decoded->id;

            $sql = "INSERT INTO favoritos (user_id, driver) VALUES (?, ?)";
            $stmt = $con->prepare($sql);

            $stmt->bind_param("is", $userId, $driver);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                header("HTTP/1.1 201 CREATED");
                echo json_encode(array("message" => "Driver added to favourites"));
            } else {
                header("HTTP/1.1 500 Internal Server Error");
                echo json_encode(array("message" => "Failed to add driver to favourites"));
            }

            $stmt->close();
        } catch (Exception $e) {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("message" => "Invalid token", "error" => $e->getMessage()));
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Token or driver not provided"));
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'unfavouriteDriver') {
    if (isset($_POST['token']) && isset($_POST['driver'])) {
        $token = $_POST['token'];
        $driver = $_POST['driver'];
        $key = 'your_secret_key';
        $algorithm = 'HS256';

        try {
            $decoded = JWT::decode($token, new Key($key, $algorithm));
            $userId = $decoded->id;

            $sql = "DELETE FROM favoritos WHERE user_id = ? AND driver = ?";
            $stmt = $con->prepare($sql);

            $stmt->bind_param("is", $userId, $driver);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                header("HTTP/1.1 200 OK");
                echo json_encode(array("message" => "Driver removed from favourites"));
            } else {
                header("HTTP/1.1 404 Not Found");
                echo json_encode(array("message" => "No matching driver found in favourites"));
            }

            $stmt->close();
        } catch (Exception $e) {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("message" => "Invalid token", "error" => $e->getMessage()));
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Token or driver not provided"));
    }
    exit();
}

/* Comprobar si esta fav */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'checkFavouriteDriver') {
    if (isset($_POST['token']) && isset($_POST['driver'])) {
        $token = $_POST['token'];
        $driver = $_POST['driver'];
        $key = 'your_secret_key';
        $algorithm = 'HS256';

        try {
            $decoded = JWT::decode($token, new Key($key, $algorithm));
            $userId = $decoded->id;

            $sql = "SELECT COUNT(*) AS count FROM favoritos WHERE user_id = ? AND driver = ?";
            $stmt = $con->prepare($sql);

            if ($stmt === false) {
                throw new Exception("Prepare failed: " . $con->error);
            }

            $stmt->bind_param("is", $userId, $driver);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();

            header("Content-Type: application/json");
            if ($count > 0) {
                echo json_encode(array("favourited" => true));
            } else {
                echo json_encode(array("favourited" => false));
            }

            $stmt->close();
        } catch (Exception $e) {
            header("Content-Type: application/json");
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("message" => "Invalid token", "error" => $e->getMessage()));
        }
    } else {
        header("Content-Type: application/json");
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(array("message" => "Token or driver not provided"));
    }
    exit();
}



/* No se encontro un metodo valido */
header("HTTP/1.1 400 Bad Request");
echo json_encode(array("message" => "Invalid request method or action parameter"));
