const RATINGS_CONSTANT = 32;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function(router) {
    router.post('/add-player', addPlayer);
    router.post('/challenge', challengePlayer);
    router.post('/accept', reserveMatch); // potentially unneeded
    router.post('/shotgun', reserveTable);
    router.post('/record', addMatch);
    router.get('/rankings', fetchRankings);
};

function addPlayer(req, res) {
    var username = req.body.username;

    if (username === undefined || username === null || username === '') {
        res.status(400);
        res.json({
            text:'Username entered is invalid.'
        });
        return;
    }

    db.all("SELECT * FROM player WHERE username='" + username + "'", function(err, rows) {
        if (rows.length === 0) {
            db.run("INSERT INTO player(username, ranking) VALUES('" + username + "', 1500)");
            res.status(201);
            res.json({
                text: username + ' added to the player list.'
            });
        } else {
            res.status(409);
            res.json({
                text: 'Player ' + username + ' already exists.'
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

// add match to the databse and update rankings
function addMatch(req, res) {

    var p1 = req.body.player1,
        p2 = req.body.player2,
        p1Score = Number(req.body.score1),
        p2Score = Number(req.body.score2),

        p1Ranking,
        p2Ranking,
        p1Expected,
        p2Expected,

        rankingChange,

        dateInSeconds;

    db.all("SELECT ranking FROM player WHERE username='" + p1 + "'", function(err, rows) {
        if (rows.length === 0) {
            // can't find player 1
            res.json({
                text: 'Can\'t find ' + p1 + ' in the player list.'
            });
            return;
        }
        p1Ranking = Number(rows[0].ranking);

        db.all("SELECT ranking FROM player WHERE username='" + p2 + "'", function(err, rows) {
            if (rows.length === 0) {
                // can't find player 2
                res.json({
                    text: 'Can\'t find ' + p2 + ' in the player list.'
                });
                return;
            }
            p2Ranking = Number(rows[0].ranking);

            dateInSeconds = Date.now();
            db.run("INSERT INTO match(winner, winner_wins, loser, loser_wins, date) VALUES('" + p1 + "', '" + p1Score + "', '" + p2 + "', '" + p2Score + "', '" + dateInSeconds + "')");

            // work out new ranking
            p1Expected = 1 / (1 + Math.pow(10, ((p1Ranking - p2Ranking) / 400)));
            p2Expected = 1 - p1Expected;
            rankingChange = Math.round(RATINGS_CONSTANT * ((p1Expected * p1Score) - (p2Expected * p2Score)));
            p1Ranking += rankingChange;
            p2Ranking -= rankingChange;

            db.run("UPDATE player SET ranking = " + p1Ranking + " WHERE username = '" + p1 + "'");
            db.run("UPDATE player SET ranking = " + p2Ranking + " WHERE username = '" + p2 + "'");

            res.status(201);
            res.json({
                username: 'Table Tennis',
                text: 'Added match to the database and updated players\' rankings.',
                attachments: [
                    {
                        text: p1 + ': ' + p1Ranking + '\n' + p2 + ': ' + p2Ranking
                    }
                ]
            });
        });
    });
}

function fetchRankings(req, res) {
    rankings = [];

    db.all("SELECT * FROM player ORDER BY ranking", function(err, rows) {
        for (var i = 0; i < rows.length; i++) {
            rankings.push({ username: rows[i].username, ranking: rows[i].ranking });
        }

        res.json(rankings);
    });
}