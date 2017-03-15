var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY UNIQUE, username TEXT UNIQUE, nickname TEXT, ranking INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS match (match_id INTEGER PRIMARY KEY UNIQUE, winner INTEGER REFERENCES user(user_id), winner_wins INTEGER, "
        + "loser INTEGER REFERENCES user(user_id), loser_wins INTEGER, date INTEGER, ranking_change INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS version (key TEXT PRIMARY KEY UNIQUE, version FLOAT)");
    db.run("INSERT INTO version (key, version) VALUES (\"database\", 1.1)");
});

db.close();
