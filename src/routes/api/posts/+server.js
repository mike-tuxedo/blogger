import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { json } from '@sveltejs/kit';

const databaseFile = './content/database.db';

async function openDb() {
    return open({
        filename: databaseFile,
        driver: sqlite3.Database
    });
}

async function initializeDb(db) {
    await db.exec('CREATE TABLE IF NOT EXISTS posts(draftHeadline TEXT, publishedHeadline TEXT, alias TEXT, created INTEGER, published INTEGER, showDraftHeroImage INTEGER, showPublishedHeroImage INTEGER, draftImage TEXT, publishedImage TEXT, draftContent BLOB, publishedContent BLOB, metatitle TEXT, metadescription TEXT, PRIMARY KEY (created))');
    await db.exec('CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, password TEXT)');
}

export const GET = async ({ url }) => {
    const db = await openDb();
    await initializeDb(db);

    const alias = url.searchParams.get('alias');
    const published = url.searchParams.get('published');
    let stmt;
    let params = [];

    if (alias) {
        if (published !== null) {
            stmt = 'SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE alias = ? AND published = ?';
            params = [alias, parseInt(published)];
        } else {
            stmt = 'SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE alias = ?';
            params = [alias];
        }
    } else {
        if (published !== null) {
            stmt = 'SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts WHERE published = ? ORDER BY created DESC';
            params = [parseInt(published)];
        } else {
            stmt = 'SELECT draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription FROM posts ORDER BY created DESC';
        }
    }

    const posts = await db.all(stmt, ...params);
    await db.close();

    return json(posts);
};
