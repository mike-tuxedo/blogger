import { json } from '@sveltejs/kit';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Datenbankdatei festlegen
const databaseFile = './content/database.db';

// Funktion zur Öffnung der Datenbank
async function openDb() {
    return open({
        filename: databaseFile,
        driver: sqlite3.Database
    });
}

// Funktion zur Initialisierung der Datenbank
async function initializeDb(db) {
    await db.exec('CREATE TABLE IF NOT EXISTS startpage(id INTEGER PRIMARY KEY, draftContent BLOB, publishedContent BLOB, metatitle TEXT, metadescription TEXT, theme TEXT)');
}

// GET-Anfrage: Startseiteninhalt abrufen
export const GET = async () => {
    const db = await openDb();
    await initializeDb(db);

    const stmt = await db.prepare('SELECT draftContent, publishedContent, metatitle, metadescription, theme FROM startpage WHERE id = ?');
    const homeContent = await stmt.get(1); // Statische ID 1 für die Startseite
    
    await stmt.finalize();
    await db.close();

    if (homeContent) {
        // Buffer in String konvertieren
        homeContent.draftContent = homeContent.draftContent ? homeContent.draftContent.toString('utf-8') : null;
        homeContent.publishedContent = homeContent.publishedContent ? homeContent.publishedContent.toString('utf-8') : null;
        
        return json(homeContent);
    } else {
        return json({ error: true, message: 'No content available.' }, { status: 404 });
    }
};

// POST-Anfrage: Startseiteninhalt erstellen oder ersetzen
export const POST = async ({ request }) => {
    const db = await openDb();
    await initializeDb(db);

    const postData = await request.json();

    const stmt = await db.prepare('REPLACE INTO startpage(id, draftContent, publishedContent, metatitle, metadescription, theme) VALUES (?, ?, ?, ?, ?, ?)');
    
    try {
        await stmt.run(
            postData.id || 1, // Statische ID 1 oder dynamische ID
            postData.draftContent,
            postData.publishedContent,
            postData.metatitle,
            postData.metadescription,
            postData.theme
        );
        await stmt.finalize();
        await db.close();

        return json({ error: false, message: 'Homepage content created or replaced successfully.' });
    } catch (error) {
        await stmt.finalize();
        await db.close();

        return json({ error: true, message: `Failed to execute statement: ${error.message}` }, { status: 500 });
    }
};
