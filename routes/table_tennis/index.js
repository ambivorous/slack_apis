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
    var p1 = req.body.user_name,
        p2,
        p1Score,
        p2Score,
        index,
        substring;

    index = req.body.text.indexOf(' ');
    p1Score = req.body.text.substring(0,)
    p2 = 

    db.run("INSERT INTO match(winner, winner_wins, loser, loser_wins, date) VALUES('" + req.body.user_name + "', 1500)");
    res.json({
        message: req.body.user_name + ' added to the player list.'
    });
    res.json({
        message: 'Works.',
        route: 'table_tennis',
        score: req.body.user_name + ' ' + req.body.text
    });
}