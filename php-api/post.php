<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

$databaseFile = "../content/database.db";
$db = new SQLite3($databaseFile);

if (!$db) {
    die("Connection failed: " . $db->lastErrorMsg());
}

// Create tables if not exists with updated fields
$db->exec('CREATE TABLE IF NOT EXISTS posts(draftHeadline TEXT, publishedHeadline TEXT, alias TEXT, created INTEGER, published INTEGER, showDraftHeroImage INTEGER, showPublishedHeroImage INTEGER, draftImage TEXT, publishedImage TEXT, draftContent BLOB, publishedContent BLOB, metatitle TEXT, metadescription TEXT, PRIMARY KEY (created))');
$db->exec('CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, password TEXT)');

// Handle POST requests for /api/post
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = json_decode(file_get_contents('php://input'), true);
    $created = isset($postData['created']) ? $postData['created'] : time();

    // Check if alias already exists, if yes, append a number to make it unique
    $alias = $postData['alias'];
    $stmt = $db->prepare('SELECT alias FROM posts WHERE alias = :alias');
    $stmt->bindValue(':alias', $alias, SQLITE3_TEXT);
    $result = $stmt->execute();
    $count = 0;

    $stmt = $db->prepare('REPLACE INTO posts(draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription) VALUES (:draftHeadline, :publishedHeadline, :alias, :created, :published, :showDraftHeroImage, :showPublishedHeroImage, :draftImage, :publishedImage, :draftContent, :publishedContent, :metatitle, :metadescription)');

    if (!$stmt) {
        echo "Post could not be created";
        die("Failed to prepare statement: " . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':draftHeadline', $postData['draftHeadline'], SQLITE3_TEXT);
    $stmt->bindValue(':publishedHeadline', $postData['publishedHeadline'], SQLITE3_TEXT);
    $stmt->bindValue(':alias', $alias, SQLITE3_TEXT);
    $stmt->bindValue(':created', $created, SQLITE3_INTEGER);
    $stmt->bindValue(':published', $postData['published'], SQLITE3_INTEGER);
    $stmt->bindValue(':showDraftHeroImage', $postData['showDraftHeroImage'], SQLITE3_INTEGER);
    $stmt->bindValue(':showPublishedHeroImage', $postData['showPublishedHeroImage'], SQLITE3_INTEGER);
    $stmt->bindValue(':draftImage', $postData['draftImage'], SQLITE3_TEXT);
    $stmt->bindValue(':publishedImage', $postData['publishedImage'], SQLITE3_TEXT);
    $stmt->bindValue(':draftContent', $postData['draftContent'], SQLITE3_BLOB);
    $stmt->bindValue(':publishedContent', $postData['publishedContent'], SQLITE3_BLOB);
    $stmt->bindValue(':metatitle', $postData['metatitle'], SQLITE3_TEXT);
    $stmt->bindValue(':metadescription', $postData['metadescription'], SQLITE3_TEXT);
	
    $stmt->execute();

    echo "Post replaced successfully";

    $db->close();
} else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $created = $input['created']; // Der Zeitstempel des Posts, der gelöscht werden soll

    if (isset($created)) {
        $stmt = $db->prepare('DELETE FROM posts WHERE created = :created');
        $stmt->bindValue(':created', $created, SQLITE3_INTEGER);
        $result = $stmt->execute();

        if ($result) {
            echo json_encode(["message" => "Post deleted successfully"]);
        } else {
            echo json_encode(["error" => "Post not found or could not be deleted"]);
        }
    } else {
        echo json_encode(["error" => "No valid identifier provided"]);
    }

    $db->close();
    exit();
}
?>
