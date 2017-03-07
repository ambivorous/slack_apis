var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
  db.run("ALTER TABLE match ADD ranking_change INTEGER");
});

db.close();