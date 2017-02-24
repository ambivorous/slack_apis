var _ = require('lodash');

var endpoints = [
    'table_tennis',
];

module.exports = function(router) {
    _.each(endpoints, function(endpoint) {
        require('./' + endpoint).call(this, router);
    });
};
