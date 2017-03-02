const RATINGS_CONSTANT = 32;

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

    var message = req.body.text,
        index,

        p1 = req.body.user_name,
        p2,
        p1Score,
        p2Score,

        p1Ranking,
        p2Ranking,
        p1Expected,
        p2Expected,

        rankingChange,

        dateInSeconds;

    // string manipulation nonsense
    index = message.indexOf(' ');
    p1Score = Number(message.substring(0, index));

    message = message.substring(index + 1);
    index = message.indexOf(' ');
    p2Score = Number(message.substring(0, index));

    message = message.substring(index + 1);
    p2 = message;

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

            // work out new ranking
            p1Expected = 1 / (1 + Math.pow(10, ((p1Ranking - p2Ranking) / 400)));
            p2Expected = 1 - p1Expected;
            rankingChange = Math.round(RATINGS_CONSTANT * ((p1Expected * p1Score) - (p2Expected * p2Score)));
            p1Ranking += rankingChange;
            p2Ranking -= rankingChange;

            db.run("UPDATE player SET ranking = " + p1Ranking + " WHERE username = '" + p1 + "'");
            db.run("UPDATE player SET ranking = " + p2Ranking + " WHERE username = '" + p2 + "'");

            res.json({
                message: 'Added match to the database and updated players\' rankings: ' + p1 + ' (' + p1Ranking + '); ' + p2 + ' (' + p2Ranking + ').'
            });
        });
    });
}