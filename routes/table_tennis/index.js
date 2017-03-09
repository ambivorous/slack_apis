const RATINGS_CONSTANT = 32;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function(router) {
    router.post('/table-tennis/add-player', addPlayer);
    router.post('/table-tennis/remove-player', removePlayer);
    router.post('/table-tennis/challenge', challengePlayer);
    router.post('/table-tennis/accept', reserveMatch); // potentially unneeded
    router.post('/table-tennis/reserve-table', reserveTable);
    router.post('/table-tennis/add-match', addMatch);
    //router.post('/table-tennis/remove-match', removeMatch);
    router.get('/table-tennis/rankings', fetchRankings);
};

// add a new player to the database
function addPlayer(req, res) {
    var username = req.body.username;

    if (!username) {
        res.status(400);
        res.json({ error: 'Username entered is invalid.' });
        return;
    }

    db.get("SELECT username FROM player WHERE username = ?", [ username ] , function(err, row) {
        if (row) {
            res.status(409);
            res.json({ error: 'Player ' + username + ' already exists.' });
            return;
        }

        db.run("INSERT INTO player(username, ranking) VALUES(?, 1500)", [ username ], function(err) {
            if (err) {
                res.status(500);
                res.json({ error: 'INSERT failed: ' + err });
                return;
            }

            res.status(201);
            res.json({
                text: username + ' added to the player list.'
            });
            return;
        });
    });
}

// remove a player provided he has no matches
function removePlayer(req, res) {
    var username = req.body.username;

    if (!username) {
        res.status(400);
        res.json({ error: 'Username entered is invalid.' });
        return;
    }

    db.get("SELECT username FROM player WHERE username = ?", [ username ], function(err, row) {
        if (!row) {
            res.status(404);
            res.json({ error: 'Player ' + username + ' doesn\'t exists.' });
            return;
        }

        db.all("SELECT match_id FROM match WHERE winner = ?1 OR loser = ?1", [ username ], function(err, rows) {
            if (rows.length > 0) {
                res.status(409);
                res.json({ error: 'Player ' + username + ' has recorded matches.' });
                return;
            }

            db.run("DELETE FROM player WHERE username = ?", [ username ], function(err) {
                if (err) {
                    res.status(500);
                    res.json({ error: 'DELETE failed: ' + err });
                    return;
                }

                res.status(200);
                res.json({
                    text: 'Player deleted.'
                });
                return;
            });
        });
    });
}

function challengePlayer(req, res) {
    // challenge a player
}

function reserveMatch(req, res) {
    // challenge accepted
}

function reserveTable(req, res) {
    // international shotgun rules
}

// add match to the database and update rankings
function addMatch(req, res) {
    var p1 = req.body.player1,
        p2 = req.body.player2,
        p1Score = Number(req.body.score1),
        p2Score = Number(req.body.score2);

    if (!p1 || !p2 || p1Score < 0 || p2Score < 0) {
        res.status(400);
        res.json({ error: 'Input invalid.' });
        return;
    } else if (p1 == p2) {
        res.status(400);
        res.json({ error: 'Stop playing with yourself.' });
        return;
    }

    var p1Ranking, p2Ranking,
        p1Expected, p2Expected,
        rankingChange,
        weighting;
    var startDate,
        startDateInSeconds;

    db.get("SELECT ranking FROM player WHERE username = ?", [ p1 ], function(err, row) {
        if (!row) {
            res.status(404);
            res.json({ error: 'Can\'t find ' + p1 + ' in the player list.' });
            return;
        }
        p1Ranking = Number(row.ranking);

        db.get("SELECT ranking FROM player WHERE username = ?", [ p2 ],  function(err, row) {
            if (!row) {
                res.status(404);
                res.json({ error: 'Can\'t find ' + p2 + ' in the player list.' });
                return;
            }
            p2Ranking = Number(row.ranking);

            startDate = new Date();
            startDate.setDate(startDate.getDate() - 28);
            startDateInSeconds = startDate.getTime();

            db.get("SELECT COUNT(match_id) AS count FROM match WHERE ((winner = ?1 AND loser = ?2) OR (winner = ?2 AND loser = ?1)) AND date > ?3", [ p1, p2, startDateInSeconds ], function(err, row) {
                if (row.count >= 20) {
                    weighting = 0.25;
                } else {
                    //weighting = 1 - (((row.count * row.count) * 3)/1600); // y = -(x^2)*3/1600 + 1
                    weighting = 1 - ((row.count * 3)/80); // y = -x*3/80 + 1
                }

                // work out new ranking
                p1Expected = 1 / (1 + Math.pow(10, ((p1Ranking - p2Ranking) / 400)));
                p2Expected = 1 - p1Expected;
                rankingChange = Math.round(RATINGS_CONSTANT * ((p1Expected * p1Score) - (p2Expected * p2Score)) * weighting);
                p1Ranking += rankingChange;
                p2Ranking -= rankingChange;

                var winner, loser,
                    winnerWins, loserWins,
                    rankingGained,
                    dateInSeconds;
                var p1Sign, p2Sign;

                if (p1Score >= p2Score) {
                    winner = p1;
                    loser = p2;
                    winnerWins = p1Score;
                    loserWins = p2Score;
                    rankingGained = rankingChange;
                } else {
                    winner = p2;
                    loser = p1;
                    winnerWins = p2Score;
                    loserWins = p1Score;
                    rankingGained = -rankingChange;
                }

                if (rankingChange >= 0) {
                    p1Sign = '+';
                    p2Sign = '-';
                } else {
                    p1Sign = '-';
                    p2Sign = '+';
                }

                dateInSeconds = Date.now();

                var query = "BEGIN TRANSACTION; "
                    + "INSERT INTO match(winner, winner_wins, loser, loser_wins, date, ranking_change) VALUES('"
                    + winner + "', '" + winnerWins + "', '" + loser + "', '" + loserWins + "', '" + dateInSeconds + "', '" + rankingGained + "'); "
                    + "UPDATE player SET ranking = " + p1Ranking + " WHERE username = '" + p1 + "'; "
                    + "UPDATE player SET ranking = " + p2Ranking + " WHERE username = '" + p2 + "'; "
                    + "COMMIT"

                db.exec(query, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({ error: 'Updating database failed: ' + err });
                        return;
                    }

                    res.status(200);
                    res.json({
                        p1Ranking: p1Ranking,
                        p2Ranking: p2Ranking,
                        rankingChange: rankingChange,
                        text: 'Added match to the database and updated players\' rankings.',
                        attachments: [
                            {
                                text: p1 + ': ' + p1Ranking + ' (' + p1Sign + Math.abs(rankingChange) + ')\n'
                                    + p2 + ': ' + p2Ranking + ' (' + p2Sign + Math.abs(rankingChange) + ')'
                            }
                        ]
                    });
                });
            });
        });
    });
}

// remove a match from the database and update rankings
/*function removeMatch(req, res) {
    var matchID = Number(req.body.matchID);

    if (!matchID) {
        res.status(400);
        res.json({ error: 'Input invalid.' });
        return;
    }

    var players = [];
    var rankingChanges = [];
    var query;

    db.each("SELECT * FROM match WHERE match_id >= ? ORDER BY match_id DESC", [ match_id ], function(err, row) {
        if (match_id === matchID) {
            db.run("DELETE FROM match WHERE match_id = ?", [ match_id ], function(err) {
                // reverse rankings
                query = "SELECT * FROM players WHERE ";
                if (players.length() !== rankingChanges.length()) {
                    // something went wrong
                    res.status(500);
                    res.json({ error: 'I broked it. :C Try again.' });
                    return;
                }
                for (var i = 0; i < players.length(); i++) {
                    query += "username = " + players[i];
                }

                // recalculate rankings again
                db.each("SELECT * FROM match WHERE match_id > ?", [ match_id ], function(err, row) {

                });
            });
            return;
        }

        // store all ranking changes after match to delete
        if (players.indexOf(row.winner) < 0) {
            players.push(row.winner);
            rankingChanges.push(row.ranking_change);
        } else {
            var index = players.indexOf(row.winner);
            var value = rankingChanges[index];
            rankingChanges[index] = value + row.ranking_change;
        }
        if (players.indexOf(row.loser) < 0) {
            players.push(row.loser);
            rankingChanges.push(-row.ranking_change);
        } else {
            var index = players.indexOf(row.loser);
            var value = rankingChanges[index];
            rankingChanges[index] = value - row.ranking_change;
        }
    });
}*/

function fetchRankings(req, res) {
    var rankings = [];

    db.all("SELECT * FROM player ORDER BY ranking DESC", function(err, rows) {
        if (rows.length == 0) {
            res.status(204);
            res.json({
                text: 'No players in the database.'
            });
            return;
        }

        for (var i = 0; i < rows.length; i++) {
            rankings.push({ username: rows[i].username, ranking: rows[i].ranking });
        }

        res.status(200);
        res.json({
            rankings: rankings
        });
    });
}
