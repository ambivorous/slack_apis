var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function() {
    db.serialize(function() {
        var version;
        var query = "BEGIN TRANSACTION; ";

        db.run("CREATE TABLE IF NOT EXISTS version (key TEXT PRIMARY KEY UNIQUE, version REAL)");
        db.run("INSERT INTO version(key, version) VALUES(\"database\", 1.0)");

        /*db.get("SELECT version FROM version WHERE key = ?", [ "database" ], function(err, row) {
            if (row.version) {
                version = row.version;
            } else {
                // no database version yet (log file)
            }

            if (version < 1.0) {
                // EXAMPLE: update to 1.0
            }
            query += "COMMIT";

            if (version == 1.0) {
                db.exec(query, function(err) {
                    if (err) {
                        // fuck, i need a logfile
                        return;
                    }

                    // woo, updated? seriously; log file
                });
            } else {
                // database is up to date (log file)
            }
        });*/
    });

    db.close();
};
