const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const uuid = require('uuid');

/** Create db after server is started the first time */
let db = new sqlite3.Database('./blogger.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the SQlite database.');

    db.run('CREATE TABLE IF NOT EXISTS posts(name STRING, alias STRING, published CHAR(1), teaserText STRING, teaserImage STRING, draftContent STRING, publishedContent STRING)');
    console.log('Created database posts.');

    db.run('CREATE TABLE IF NOT EXISTS users(name STRING, password BLOB)');
    console.log('Created database users.');

    // Close db connection after writing
    db.close((err) => {
        if (err) return console.error(err.message);
        console.log('Close the database connection.');
    });
});

const app = express();
const port = 3030;
app.get('/posts', (req, res) => {
    db.all('SELECT teaserText, teaserImage FROM posts', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});
app.get('/post', (req, res) => {
    db.all('SELECT * FROM posts WHERE rowid=' + req.body.rowid, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// Websocket Server für direkte kollaboration
/**
const server = new WebSocket.Server({
    port: 8080
});

let clients = [];
server.on('connection', function (client) {
    client.id = uuid.v4();
    clients.push(client);

    client.on('message', function (msg) {
        const post = JSON.parse(msg);

        // Upsert
        db.run('REPLACE INTO posts(rowid, name, alias, published, teaserText, teaserImage, draftContent, publishedContent) VALUES (:rowid, :name, :alias, :published, :teaserText, :teaserImage, :draftContent, :publishedContent)', post)

        // Broadcast changes
        clients.forEach(c => {
            if (c.id !== client.id) {
                c.send(JSON.stringify(post));
                console.log(`clientId: ${c.id}`);
            }
        });
        console.log('Sync message was sent to all clients.');
    });

    // When a client closes, or disconnects, remove it from the array.
    client.on('close', function () {
        clients = clients.filter(s => s !== client);
    });
});
*/