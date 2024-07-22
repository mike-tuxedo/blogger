<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

require 'vendor/autoload.php';

use WebPConvert\WebPConvert;

function resizeImageWithImagick($filePath, $width, $outputFilePath)
{
    $imagick = new Imagick($filePath);
    $imagick->resizeImage($width, 0, Imagick::FILTER_LANCZOS, 1);
    $imagick->setImageFormat('jpg');
    $imagick->writeImage($outputFilePath);
    $imagick->destroy();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $uploadDirectory = '../../content/uploads/';
	$uniqueFilename = str_replace(' ', '-', $_FILES['file']['name']);
    $uploadedFilePath = $uploadDirectory . $uniqueFilename;

    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadedFilePath)) {
        $sizes = [300, 600, 1200];
        $savedFiles = [];

        $pathInfo = pathinfo($uniqueFilename);
        $filenameWithoutExtension = $pathInfo['filename'];

        foreach ($sizes as $size) {
            $resizedFilePath = $uploadDirectory . $size . '_' . $filenameWithoutExtension . '.jpg';
            $outputFilePath = $uploadDirectory . $size . '_' . $filenameWithoutExtension . '.webp';

            try {
                // Resize image with Imagick
                resizeImageWithImagick($uploadedFilePath, $size, $resizedFilePath);

                // Convert to WebP
                WebPConvert::convert($resizedFilePath, $outputFilePath);
                $savedFiles[] = $outputFilePath;

                // Remove temporary resized file
                unlink($resizedFilePath);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Failed to convert image to WebP']);
                exit;
            }
        }

        echo json_encode(['success' => true, 'filenames' => $savedFiles, 'filename' => $filenameWithoutExtension . '.webp']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or file upload error']);
}
?>
