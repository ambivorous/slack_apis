// server.js

'user strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

// test route to make sure everything is working
router.get('/', function(req, res) {
    res.json({ message: 'Works.' });
});

// the rest of our routes
require('./routes')(router);

// prefix routes with /slack_apis
app.use('/slack_apis', router);

var port = process.env.PORT || 8080;

// start the server
app.listen(port, function() {
    console.log('Listening on port ' + port);
});