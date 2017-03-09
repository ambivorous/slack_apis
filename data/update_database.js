var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function() {
    db.serialize(function() {
        var version;
        var latest = 1.0;
        var query = "BEGIN TRANSACTION; ";

        db.get("SELECT version FROM version WHERE key = ?", [ "database" ], function(err, row) {
            if (row.version) {
                version = row.version;
            } else {
                // no database version yet (log file)
            }

            if (version < latest) {
                // EXAMPLE: update to 1.0
            }
            query += "COMMIT";

            if (version < latest) {
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
        });
    });

    db.close();
};
