var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
  db.run("CREATE TABLE if not exists player (username TEXT PRIMARY KEY UNIQUE, ranking INTEGER)");
  db.run("CREATE TABLE if not exists match (match_id INTEGER PRIMARY KEY AUTOINCREMENT, winner TEXT REFERENCES player (username), winner_wins INTEGER, loser TEXT REFERENCES player (username), loser_wins INTEGER, date INTEGER, ranking_change INTEGER)");
});

db.close();