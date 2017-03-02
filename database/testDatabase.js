var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database/data/table_tennis.db');

db.serialize(function() {

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