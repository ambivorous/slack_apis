var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS player (username TEXT PRIMARY KEY UNIQUE, ranking INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS match (match_id INTEGER PRIMARY KEY AUTOINCREMENT, winner TEXT REFERENCES player (username), winner_wins INTEGER, loser TEXT REFERENCES player (username), loser_wins INTEGER, date INTEGER, ranking_change INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS version (key TEXT PRIMARY KEY UNIQUE, version FLOAT)");
    db.run("INSERT INTO version(key, version) VALUES(\"database\", 1.0)");
});

db.close();