<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

$databaseFile = "../content/database.db";
// Überprüfen und Erstellen der blogger.db Datei
$db = new SQLite3($databaseFile);
if (!$db) {
    die("Connection failed: " . $db->lastErrorMsg());
}

// Create tables if not exists with the new fields for draft and published versions
$db->exec('CREATE TABLE IF NOT EXISTS posts(draftHeadline TEXT, publishedHeadline TEXT, alias TEXT, created INTEGER, published INTEGER, showDraftHeroImage INTEGER, showPublishedHeroImage INTEGER, draftImage TEXT, publishedImage TEXT, draftContent BLOB, publishedContent BOMB,  metatitle TEXT, metadescription TEXT, PRIMARY KEY (created))');
$db->exec('CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, password TEXT)');

// Handle GET requests for /api/posts
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($_GET['alias'] !== null) {
        $postAlias = $_GET['alias'];
        $postPublished = $_GET['published'];

        if ($postPublished !== null) {
            $stmt = $db->prepare('SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE alias = :alias AND published = :published');
            $stmt->bindValue(':alias', $postAlias, SQLITE3_TEXT);
            $stmt->bindValue(':published', $postPublished, SQLITE3_INTEGER);
        } else {
            $stmt = $db->prepare('SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE alias = :alias');
            $stmt->bindValue(':alias', $postAlias, SQLITE3_TEXT);
        }
    } else {
        if ($_GET['published'] !== null) {
            $postPublished = $_GET['published'];
            $stmt = $db->prepare('SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE published = :published ORDER BY created DESC');
            $stmt->bindValue(':published', $postPublished, SQLITE3_INTEGER);
        } else {
            $stmt = $db->prepare('SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts ORDER BY created DESC');
        }
    }

    $result = $stmt->execute();

    $posts = array();
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($posts, $row);
    }

    echo json_encode($posts);

    $db->close();
}
?>
