// server.js

'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    app = express();

// update the database on each startup
require('./data/table_tennis/update_database.js')();

// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// user EJS for templates
app.engine('html', ejs.renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// set up paths for webpages
app.get('/table-tennis', function(req, res) {
    res.render('index');
});
app.use('/table-tennis', express.static(__dirname + '/www'));

var router = express.Router();

// the rest of our routes
require('./routes')(router);

// prefix routes with /slack_apis
app.use('/slack-apis', router);

var port = process.env.PORT || 5000;

// start the server
app.listen(port, function() {
    console.log('Listening on port ' + port);
});
