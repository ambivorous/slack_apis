const RATINGS_CONSTANT = 32;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function(router) {
    router.post('/table-tennis/add-player', addPlayer);
    router.post('/table-tennis/remove-player', removePlayer);
    router.post('/table-tennis/set-nickname', setNickname);
    router.post('/table-tennis/challenge', challengePlayer);
    router.post('/table-tennis/accept', reserveMatch); // potentially unneeded
    router.post('/table-tennis/reserve-table', reserveTable);
    router.post('/table-tennis/add-match', addMatch);
    //router.post('/table-tennis/remove-match', removeMatch);
    router.get('/table-tennis/rankings', fetchRankings);
    router.get('/table-tennis/match-history', fetchMatchHistory);
    router.get('/table-tennis/match-history/:username', fetchMatchHistory);
    router.get('/table-tennis/player/:username', fetchPlayerDetails);
};

// add a new player to the database
function addPlayer(req, res) {
    var username = req.body.username;
    var mode = req.query.mode;

    if (!username) {
        res.status(400);
        res.json({ error: 'Username entered is invalid.' });
        return;
    }

    db.get("SELECT username FROM user WHERE username = ?", [ username ] , function(err, row) {
        if (row) {
            res.status(409);
            res.json({ error: 'Player ' + username + ' already exists.' });
            return;
        }

        if (mode != "test") {
            db.run("INSERT INTO user (username, ranking) VALUES (?, 1500)", [ username ], function(err) {
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
        } else {
            res.status(200);
            res.json({
                mode: 'test',
                text: username + ' added to the player list.'
            });
            return;
        }
    });
}

// remove a player provided he has no matches
function removePlayer(req, res) {
    var username = req.body.username;
    var mode = req.query.mode;

    if (!username) {
        res.status(400);
        res.json({ error: 'Username entered is invalid.' });
        return;
    }

    db.get("SELECT username FROM user WHERE username = ?", [ username ], function(err, row) {
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

            if (mode != "test") {
                db.run("DELETE FROM user WHERE username = ?", [ username ], function(err) {
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
            } else {
                res.status(200);
                res.json({
                    mode: 'test',
                    text: 'Player deleted.'
                });
                return;
            }
        });
    });
}

function setNickname(req, res) {
    var username = req.body.username;
    var nickname = req.body.nickname;
    var mode = req.query.mode;

    if (!username || !nickname) {
        res.status(400);
        res.json({ error: 'Input is invalid.' });
        return;
    }

    db.get("SELECT * FROM user WHERE username = ?", [ username ], function(err, row) {
        if (!row) {
            res.status(404);
            res.json({ error: 'Player ' + username + ' doesn\'t exists.' });
            return;
        }
        if (nickname == row.nickname) {
            res.status(200);
            res.json({
                error: 'Nickname unchanged.'
            });
            return;
        }

        if (mode != "test") {
            db.run("UPDATE user SET nickname = ? WHERE username = ?", [ nickname, username ], function(err) {
                if (err) {
                    res.status(500);
                    res.json({ error: 'UPDATE failed: ' + err });
                    return;
                }

                res.status(201);
                res.json({
                    text: 'Nickname \'' + nickname + '\' added to player ' + username + '.'
                });
                return;
            });
        } else {
            res.status(200);
            res.json({
                mode: 'test',
                text: 'Nickname \'' + nickname + '\' added to player ' + username + '.'
            });
            return;
        }
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
    var mode = req.query.mode;

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
        p1ID, p2ID,
        p1Expected, p2Expected,
        rankingChange,
        weighting;
    var startDate,
        startDateInSeconds;

    db.get("SELECT user_id, ranking FROM user WHERE username = ?", [ p1 ], function(err, row) {
        if (!row) {
            res.status(404);
            res.json({ error: 'Can\'t find ' + p1 + ' in the player list.' });
            return;
        }
        p1Ranking = Number(row.ranking);
        p1ID = Number(row.user_id);

        db.get("SELECT user_id, ranking FROM user WHERE username = ?", [ p2 ],  function(err, row) {
            if (!row) {
                res.status(404);
                res.json({ error: 'Can\'t find ' + p2 + ' in the player list.' });
                return;
            }
            p2Ranking = Number(row.ranking);
            p2ID = Number(row.user_id);

            startDate = new Date();
            startDate.setDate(startDate.getDate() - 28);
            startDateInSeconds = startDate.getTime();

            db.get("SELECT COUNT(match_id) AS count FROM match WHERE ((winner = ?1 AND loser = ?2) OR (winner = ?2 AND loser = ?1)) AND date > ?3",
                [ p1ID, p2ID, startDateInSeconds ], function(err, row) {

                // work out new ranking
                if (row.count >= 20) {
                    weighting = 0.25;
                } else {
                    weighting = 1 - ((row.count * 3)/80); // y = -x*3/80 + 1
                }

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
                    winner = p1ID;
                    loser = p2ID;
                    winnerWins = p1Score;
                    loserWins = p2Score;
                    rankingGained = rankingChange;
                } else {
                    winner = p2ID;
                    loser = p1ID;
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
                    + "INSERT INTO match (winner, winner_wins, loser, loser_wins, date, ranking_change) VALUES ('"
                    + winner + "', '" + winnerWins + "', '" + loser + "', '" + loserWins + "', '" + dateInSeconds + "', '" + rankingGained + "'); "
                    + "UPDATE user SET ranking = " + p1Ranking + " WHERE user_id = '" + p1ID + "'; "
                    + "UPDATE user SET ranking = " + p2Ranking + " WHERE user_id = '" + p2ID + "'; "
                    + "COMMIT"

                if (mode != "test") {
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
                } else {
                    res.status(200);
                    res.json({
                        mode: 'test',
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
                }
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

    db.all("SELECT * FROM user ORDER BY ranking DESC", function(err, rows) {
        if (rows.length == 0) {
            res.status(204);
            res.json({
                text: 'No players in the database.'
            });
            return;
        }

        for (var i = 0; i < rows.length; i++) {
            rankings.push({
                nickname: rows[i].nickname,
                username: rows[i].username,
                ranking: rows[i].ranking
            });
        }

        res.status(200);
        res.json({
            rankings: rankings
        });
    });
}

function fetchMatchHistory(req, res) {
    var username = req.params.username;
    var matchHistory = [];

    var query = "SELECT match.match_id AS match_id, match.winner_wins AS winner_wins, match.loser_wins AS loser_wins, match.ranking_change AS ranking_change, "
        + "match.date AS date, winner.username AS winner, winner.nickname AS winner_nickname, loser.username AS loser, loser.nickname AS loser_nickname "
        + "FROM match INNER JOIN user AS winner ON match.winner = winner.user_id INNER JOIN user AS loser ON match.loser = loser.user_id ";

    if (username) {
        query += "WHERE winner.username = \"" + username + "\" OR loser.username = \"" + [ username ] + "\" ";
    }

    query += "ORDER BY date DESC";

    db.all(query, function(err, rows) {
        if (rows.length == 0) {
            res.status(204);
            res.json({
                text: 'No matches in the database.'
            });
            return;
        }

        for (var i = 0; i < rows.length; i++) {
            matchHistory.push({
                winner: rows[i].winner,
                winner_nickname: rows[i].winner_nickname,
                winner_wins: rows[i].winner_wins,
                loser: rows[i].loser,
                loser_nickname: rows[i].loser_nickname,
                loser_wins: rows[i].loser_wins,
                ranking_change:  rows[i].ranking_change,
                date: rows[i].date
            });
        }

        res.status(200);
        res.json({
            matchHistory: matchHistory
        });
    });
}

function fetchPlayerDetails(req, res) {
    var username = req.params.username;
    var userID;
    var nickname;
    var ranking;
    var count = 0,
        marksFarmed = 0,
        points = 0,
        avePoints = 0.0,
        accuracy = 0.0;

    if (!username) {
        res.status(400);
        res.json({ error: 'Username entered is invalid.' });
        return;
    }

    db.get("SELECT * FROM user WHERE username = ?", [ username ], function(err, row) {
        if (!row) {
            res.status(404);
            res.json({ error: 'Player ' + username + ' doesn\'t exists.' });
            return;
        }
        userID = row.user_id;
        nickname = row.nickname;
        ranking = row.ranking;

        db.all("SELECT * FROM match WHERE match.winner = ?1 OR match.loser = ?1 ORDER BY date DESC", [ userID ], function(err, rows) {
            if (rows.length == 0) {
                res.status(204);
                res.json({
                    text: 'No matches for player ' + username + ' in the database.'
                });
                return;
            }

            db.get("SELECT user_id FROM user WHERE username = 'mark.oosthuizen'", function(err, row) {
                markID = row.user_id;

                for (var i = 0; i < rows.length; i++) {
                    count += 1;
                    points += rows[i].ranking_change;
                    if (markID != userID && rows[i].loser == markID) {
                        marksFarmed += 1;
                    }
                }
                avePoints = points / count;
                accuracy = Math.pow(Math.E, -(Math.pow(avePoints, 2)/Math.pow(2 * 5, 2))) * 100;

                res.status(200);
                res.json({
                    nickname: nickname,
                    ranking: ranking,
                    games_played: count,
                    accuracy: Math.round(accuracy),
                    marks_farmed: marksFarmed
                });
            });
        });
    });
}