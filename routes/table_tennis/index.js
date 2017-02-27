var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/table_tennis.db');

module.exports = function(router) {
    router.post('/add-player', addPlayer);
    router.post('/challenge', challengePlayer);
    router.post('/accept', reserveMatch); // potentially unneeded
    router.post('/shotgun', reserveTable);
    router.post('/record', addMatch);
};

function addPlayer(req, res) {
    db.all("SELECT * FROM player WHERE username='" + req.body.user_name + "'", function(err, rows) {
        if (rows.length === 0) {
            db.run("INSERT INTO player(username, ranking) VALUES('" + req.body.user_name + "', 1500)");
            res.json({
                message: req.body.user_name + ' added to the player list.'
            });
        } else {
            res.json({
                message: 'Player ' + req.body.user_name + ' already exists.'
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
    var substring = req.body.text,
        p1 = req.body.user_name,
        p2,
        p1Score,
        p2Score,
        index,
        dateInSeconds,
        tempUsername,
        tempScore,
        returnMessage;

    // string manipulation nonsense
    index = substring.indexOf(' ');
    p1Score = Number(substring.substring(0, index));
    substring = substring.substring(index + 1);
    index = substring.indexOf(' ');
    p2Score = Number(substring.substring(0, index));
    substring = substring.substring(index + 1);
    p2 = substring;

    // in case the loser is the one inputting the match results
    if (p1Score < p2Score) {
        tempUsername = p1;
        tempScore = p1Score;
        p1 = p2;
        p1Score = p2Score;
        p2 = tempUsername;
        p2Score = tempScore;
    }

    // work out new ranking
    var p1Ranking,
        p2Ranking,
        p1NewRanking,
        p2NewRanking,
        gamesPlayed,
        expectedScore,
        rankingChange;

    db.all("SELECT ranking FROM player WHERE username='" + p1 + "'", function(err, rows) {
        if (rows.length === 0) {
            // can't find player 1
            res.json({
                message: 'Can\'t find ' + p1 + ' in the player list.'
            });
            return;
        }
        p1Ranking = Number(rows[0].ranking);

        db.all("SELECT ranking FROM player WHERE username='" + p2 + "'", function(err, rows) {
            if (rows.length === 0) {
                // can't find player 2
                res.json({
                    message: 'Can\'t find ' + p2 + ' in the player list.'
                });
                return;
            }
            p2Ranking = Number(rows[0].ranking);

            dateInSeconds = Date.now();

            db.run("INSERT INTO match(winner, winner_wins, loser, loser_wins, date) VALUES('" + p1 + "', '" + p1Score + "', '" + p2 + "', '" + p2Score + "', '" + dateInSeconds + "')");

            // do math
            gamesPlayed = p1Score + p2Score;
            rankingChange = 0;
            for (var i = 0; i < gamesPlayed; i++) {
                if (p1Score - i > 0) {
                    expectedScore = 1 / (1 + Math.pow(10, ((p1Ranking - p2Ranking) / 400)));
                    rankingChange += Math.round(expectedScore * 32);
                } else {
                    expectedScore = 1 / (1 + Math.pow(10, ((p2Ranking - p1Ranking) / 400)));
                    rankingChange -= Math.round(expectedScore * 32);
                }
            }
            p1NewRanking = p1Ranking + rankingChange;
            p2NewRanking = p2Ranking - rankingChange;

            db.run("UPDATE player SET ranking = " + p1NewRanking + " WHERE username = '" + p1 + "'");
            db.run("UPDATE player SET ranking = " + p2NewRanking + " WHERE username = '" + p2 + "'");

            res.json({
                message: 'Added match to the database and updated players\' rankings: ' + p1 + ' (' + p1NewRanking + '); ' + p2 + ' (' + p2NewRanking + ').'
            });
        });
    });

    /*res.json({
        message: 'Works.',
        route: 'table_tennis',
        score: req.body.user_name + ' ' + req.body.text
    });*/
}