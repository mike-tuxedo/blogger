import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import webp from 'webp-converter';
import fs from 'fs';
import path from 'path';

// Konfiguriere den Upload-Speicherort
const uploadDirectory = 'content/uploads/';

export const POST = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uniqueFilename = file.name.replace(/\s+/g, '-');
        const uploadedFilePath = path.join(uploadDirectory, uniqueFilename);
        
        // Save file to disk
        await fs.promises.writeFile(uploadedFilePath, buffer);

        const sizes = [300, 600, 1200];
        let savedFiles = [];

        const pathInfo = path.parse(uniqueFilename);
        const filenameWithoutExtension = pathInfo.name;

        try {
            for (let size of sizes) {
                const resizedFilePath = path.join(uploadDirectory, `${size}_${filenameWithoutExtension}.jpg`);
                const outputFilePath = path.join(uploadDirectory, `${size}_${filenameWithoutExtension}.webp`);

                // Resize image with Sharp
                await sharp(uploadedFilePath)
                    .resize(size)
                    .toFile(resizedFilePath);

                // Convert to WebP
                await webp.cwebp(resizedFilePath, outputFilePath, "-q 80");

                savedFiles.push(outputFilePath);

                // Remove temporary resized file
                await fs.promises.unlink(resizedFilePath);
            }

            return json({ success: true, filenames: savedFiles, filename: `${filenameWithoutExtension}.webp` });
        } catch (conversionError) {
            return json({ success: false, error: 'Failed to convert image to WebP' }, { status: 500 });
        }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
};
