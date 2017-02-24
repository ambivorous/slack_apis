module.exports = function(router) {
    router.post('/add-player', addPlayer);
    router.post('/challenge', challengePlayer);
    router.post('/accept', reserveMatch); // potentially unneeded
    router.post('/shotgun', reserveTable);
    router.post('/record', addMatch);
};

function addPlayer(req, res) {
    // add a player
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
    res.json({
        message: 'Works.',
        route: 'table_tennis',
        score: req.body.user_name + ' ' + req.body.text
    });
}