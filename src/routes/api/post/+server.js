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
}

export async function POST({ request }) {
    const db = await openDb();
    await initializeDb(db);

    const postData = await request.json();

    if (!postData.created) {
        return json({
            error: true,
            message: 'Createdate missing.'
        }, { status: 400 });
    }

    const created = postData.created;
    const alias = postData.alias;

    const aliasCheckStmt = await db.prepare('SELECT alias FROM posts WHERE alias = ? AND created != ?');
    const aliasCheckResult = await aliasCheckStmt.get(alias, created);

    if (aliasCheckResult) {
        return json({
            error: true,
            message: 'Same alias already.'
        }, { status: 400 });
    }

    const replaceStmt = await db.prepare('REPLACE INTO posts(draftHeadline, publishedHeadline, alias, created, published, showDraftHeroImage, showPublishedHeroImage, draftImage, publishedImage, draftContent, publishedContent, metatitle, metadescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    await replaceStmt.run(
        postData.draftHeadline,
        postData.publishedHeadline,
        alias,
        created,
        postData.published,
        postData.showDraftHeroImage,
        postData.showPublishedHeroImage,
        postData.draftImage,
        postData.publishedImage,
        postData.draftContent,
        postData.publishedContent,
        postData.metatitle,
        postData.metadescription
    );

    return json({
        error: false,
        message: 'Post created or replaced successfully.'
    });
}

export async function DELETE({ request }) {
    const db = await openDb();
    await initializeDb(db);

    const input = await request.json();
    const created = input.created;

    if (!created) {
        return json({
            error: true,
            message: 'No valid identifier provided'
        }, { status: 400 });
    }

    const deleteStmt = await db.prepare('DELETE FROM posts WHERE created = ?');
    const result = await deleteStmt.run(created);

    if (result.changes === 0) {
        return json({
            error: true,
            message: 'Post not found or could not be deleted'
        }, { status: 400 });
    }

    return json({
        message: 'Post deleted successfully'
    });
}
