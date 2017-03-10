var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

db.serialize(function() {
    db.run("UPDATE user SET username = 'clive' WHERE username = 'clive.crous'");
    db.run("UPDATE user SET username = 'peet' WHERE username = 'peet.joubert'");
    db.run("UPDATE match SET ranking_change = 32 WHERE match_id = 8");
    db.run("UPDATE match SET ranking_change = 32 WHERE match_id = 9");
    db.run("UPDATE match SET ranking_change = 35 WHERE match_id = 10");

    db.each("SELECT * FROM user", function(err, row) {
        console.log(row.user_id + ": " + row.username + " (" + row.ranking + ")");
    });

    db.each("SELECT match.match_id AS match_id, match.winner_wins AS winner_wins, match.loser_wins AS loser_wins, match.ranking_change AS ranking_change, "
        + "match.date AS date, winner.username AS winner, loser.username AS loser FROM match INNER JOIN user AS winner ON match.winner = winner.user_id "
        + "INNER JOIN user AS loser ON match.loser = loser.user_id", function(err, row) {
        console.log(row.match_id + ": " + row.winner + " (" + row.winner_wins + ") " + row.loser + " (" + row.loser_wins + ") [" + row.ranking_change + "] " + Date(row.date));
    });

    db.each("SELECT * FROM version", function(err, row) {
        console.log(row.key + ": " + row.version);
    });
});

db.close();
