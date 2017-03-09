var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
    db.run("DELETE FROM user");
    db.run("DELETE FROM match");
});

db.close();