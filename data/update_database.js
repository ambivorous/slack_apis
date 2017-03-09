var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function() {
    var version;
    var latest = 1.0;
    var query = "BEGIN TRANSACTION; ";

    db.get("SELECT version FROM version WHERE key = ?", [ "database" ], function(err, row) {
        version = row.version;

        if (version < latest) {
            query += "UPDATE version SET version = " + latest + " WHERE key = 'database'; ";
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
};
