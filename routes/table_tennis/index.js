module.exports = function(router) {
    router.post('/score', addMatch);
};

function addMatch(req, res) {
    res.json({
        message: 'Works.',
        route: 'table_tennis',
        score: req.body.user_name + req.body.text
    });
}