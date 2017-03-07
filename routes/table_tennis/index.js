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

    db.all("SELECT * FROM player WHERE username='" + username + "'", function(err, rows) {
        if (rows.length > 0) {
            res.status(409);
            res.json({ error: 'Player ' + username + ' already exists.' });
            return;
        } else {
            db.run("INSERT INTO player(username, ranking) VALUES('" + username + "', 1500)");
            res.status(201);
            res.json({
                text: username + ' added to the player list.'
            });
            return;
        }
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

    db.all("SELECT * FROM player WHERE username='" + username + "'", function(err, rows) {
        if (rows.length == 0) {
            res.status(404);
            res.json({ error: 'Player ' + username + ' doesn\'t exists.' });
            return;
        } else {
            db.all("SELECT * FROM match WHERE winner='" + username + "' OR loser='" + username + "'", function(err, rows) {
                if (rows.length > 0) {
                    res.status(409);
                    res.json({ error: 'Player ' + username + ' has recorded matches.' });
                    return;
                } else {
                    db.run("DELETE FROM player WHERE username='" + username + "'");
                    res.status(200);
                    res.json({
                        text: 'Player deleted.'
                    });
                    return;
                }
            });
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

    if (!p1 || !p2 || p1Score < 0 || p2Score < 0) {
        res.status(400);
        res.json({ error: 'Input invalid.' });
        return;
    }

    var p1Ranking, p2Ranking,
        p1Expected, p2Expected,
        rankingChange,

        p1Sign, p2Sign,

        dateInSeconds;

    db.all("SELECT ranking FROM player WHERE username='" + p1 + "'", function(err, rows) {
        if (rows.length === 0) {
            res.status(404);
            res.json({ error: 'Can\'t find ' + p1 + ' in the player list.' });
            return;
        }
        p1Ranking = Number(rows[0].ranking);

        db.all("SELECT ranking FROM player WHERE username='" + p2 + "'", function(err, rows) {
            if (rows.length === 0) {
                res.status(404);
                res.json({ error: 'Can\'t find ' + p2 + ' in the player list.' });
                return;
            }
            p2Ranking = Number(rows[0].ranking);

            dateInSeconds = Date.now();
            db.run("INSERT INTO match(winner, winner_wins, loser, loser_wins, date) VALUES('" +p1 + "', '" + p1Score + "', '" + p2 + "', '" + p2Score + "', '" + dateInSeconds + "')");

            // work out new ranking
            p1Expected = 1 / (1 + Math.pow(10, ((p1Ranking - p2Ranking) / 400)));
            p2Expected = 1 - p1Expected;
            rankingChange = Math.round(RATINGS_CONSTANT * ((p1Expected * p1Score) - (p2Expected * p2Score)));
            p1Ranking += rankingChange;
            p2Ranking -= rankingChange;

            db.run("UPDATE player SET ranking = " + p1Ranking + " WHERE username = '" + p1 + "'");
            db.run("UPDATE player SET ranking = " + p2Ranking + " WHERE username = '" + p2 + "'");

            if (rankingChange >= 0) {
                p1Sign = '+';
                p2Sign = '-';
            } else {
                p1Sign = '-';
                p2Sign = '+';
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
}

function fetchRankings(req, res) {
    var rankings = [];

    db.all("SELECT * FROM player ORDER BY ranking", function(err, rows) {
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
        res.json(rankings);
    });
}