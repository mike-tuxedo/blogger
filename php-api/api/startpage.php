<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

$databaseFile = "../../content/database.db";
$db = new SQLite3($databaseFile);

if (!$db) {
    die("Connection failed: " . $db->lastErrorMsg());
}

// Create a table if it doesn't exist, adjusted for the homepage specific content
$db->exec('CREATE TABLE IF NOT EXISTS startpage(id INTEGER PRIMARY KEY, draftContent BLOB, publishedContent BLOB, metatitle TEXT, metadescription TEXT, theme TEXT)');

// Handle POST requests for /api/homepage
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = json_decode(file_get_contents('php://input'), true);

    $stmt = $db->prepare('REPLACE INTO startpage(id, draftContent, publishedContent, metatitle, metadescription, theme) VALUES (:id, :draftContent, :publishedContent, :metatitle, :metadescription, :theme)');
    if (!$stmt) {
        echo json_encode([
            'error' => true,
            'message' => "Failed to prepare statement: " . $db->lastErrorMsg()
        ]);
        exit();
    }

    // Bind the values from $postData to the placeholders in the SQL statement
    $stmt->bindValue(':id', $postData['id'] ?? 1, SQLITE3_INTEGER); // Assuming there's only one homepage row or use a dynamic ID
    $stmt->bindValue(':draftContent', $postData['draftContent'], SQLITE3_BLOB);
    $stmt->bindValue(':publishedContent', $postData['publishedContent'], SQLITE3_BLOB);
    $stmt->bindValue(':metatitle', $postData['metatitle'], SQLITE3_TEXT);
    $stmt->bindValue(':metadescription', $postData['metadescription'], SQLITE3_TEXT);
    $stmt->bindValue(':theme', $postData['theme'], SQLITE3_TEXT);

    $result = $stmt->execute();
    
    if ($result) {
        echo json_encode([
            'error' => false,
            'message' => 'Homepage content created or replaced successfully.'
        ]);
    } else {
        echo json_encode([
            'error' => true,
            'message' => "Failed to execute statement: " . $db->lastErrorMsg()
        ]);
    }

    $db->close();
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Die Startseite könnte z.B. eine statische ID verwenden, da man in der Regel nur einen Eintrag dafür hat.
    // Falls es nötig ist, mehrere Einträge (z.B. Versionen oder Themen) zu handhaben, müssten Parameter wie `id` oder `theme` betrachtet werden.
    $stmt = $db->prepare('SELECT draftContent, publishedContent, metatitle, metadescription, theme FROM startpage WHERE id = 1');

    $result = $stmt->execute();

    $homeContent = $result->fetchArray(SQLITE3_ASSOC);

    if ($homeContent) {
        echo json_encode($homeContent);
    } else {
        echo json_encode([
            'error' => false,
            'message' => 'No content available.'
        ]);
    }

    $db->close();
} else {
    echo json_encode([
        'error' => true,
        'message' => 'Unsupported HTTP method'
    ]);
}
?>
