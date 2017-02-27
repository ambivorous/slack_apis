var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');
var check;
db.serialize(function() {

  //db.run("CREATE TABLE if not exists player (username TEXT PRIMARY KEY UNIQUE, ranking INTEGER)");
  //db.run("CREATE TABLE if not exists match (match_id INTEGER PRIMARY KEY AUTOINCREMENT, winner TEXT REFERENCES player (username), winner_wins INTEGER, loser TEXT REFERENCES player (username), loser_wins INTEGER, date INTEGER)");

  /*var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();*/

  //db.run("INSERT INTO player(username, ranking) VALUES('daniel.browne', 1500)");

  //db.run("UPDATE player SET ranking = 1500 WHERE username = 'daniel.browne'");

  db.each("SELECT rowid AS id, username, ranking FROM player", function(err, row) {
      console.log(row.id + ": " + row.username + " (" + row.ranking + ")");
  });

  /*db.each("SELECT * FROM match", function(err, row) {
      console.log(row.match_id + ": " + row.winner + " (" + row.winner_wins + ") " + row.loser + " (" + row.loser_wins + ") " + row.date);
  });*/
});

db.close();