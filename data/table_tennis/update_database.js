const LATEST = 1.1;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function() {
    var version;
    var query = "BEGIN TRANSACTION; ";

    db.get("SELECT version FROM version WHERE key = ?", [ "database" ], function(err, row) {
        version = row.version;

        if (version < LATEST) {
            query += "CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY UNIQUE, username TEXT UNIQUE, nickname TEXT, ranking INTEGER); ";
            query += "INSERT INTO user (user_id, username, ranking) SELECT rowid, username, ranking FROM player; ";
            query += "DROP TABLE player; ";

            query += "ALTER TABLE match ADD COLUMN winner_id; ";
            query += "ALTER TABLE match ADD COLUMN loser_id; ";
            query += "UPDATE match SET winner_id = (SELECT user_id FROM user WHERE user.username = match.winner); ";
            query += "UPDATE match SET loser_id = (SELECT user_id FROM user WHERE user.username = match.loser); ";
            query += "ALTER TABLE match RENAME TO match_orig; ";
            query += "CREATE TABLE IF NOT EXISTS match (match_id INTEGER PRIMARY KEY UNIQUE, winner INTEGER REFERENCES user(user_id), winner_wins INTEGER, "
                + "loser INTEGER REFERENCES user(user_id), loser_wins INTEGER, date INTEGER, ranking_change INTEGER); ";
            query += "INSERT INTO match (match_id, winner, winner_wins, loser, loser_wins, date, ranking_change) "
                + "SELECT match_id, winner_id, winner_wins, loser_id, loser_wins, date, ranking_change FROM match_orig; ";
            query += "DROP TABLE match_orig; ";

            query += "UPDATE version SET version = " + LATEST + " WHERE key = 'database'; ";
        }
        query += "COMMIT";

        if (version < LATEST) {
            db.exec(query, function(err) {
                if (err) {
                    // fuck, i need a logfile
                    console.log("Failed to update database. Error: " + err);
                    return;
                }

                // woo, updated? seriously; log file
                console.log("Database updated to version " + LATEST + " successfully!");
            });
        } else {
            // database is up to date (log file)
            console.log("Database already up to date with latest version: " + LATEST);
        }
    });
};
