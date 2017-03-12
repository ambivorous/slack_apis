// rankings controller

'use strict';

var angular = require('angular');

module.exports = angular.module('table-tennis.rankingsCtrl', []).app.controller('rankingsCtrl', [
    '$scope', '$http',
    function($scope, $http) {

    function init() {
        $http.get('/slack-apis/table-tennis/rankings/')
        .success(function(data, status, headers, config) {
            var rankings = data.rankings;
            var records = [];
            var displayName;

            for (var i = 0; i < rankings.length; i++) {
                if (rankings[i].nickname) {
                    displayName = rankings[i].nickname + ' (' + rankings[i].username + ')';
                } else {
                    displayName = rankings[i].username;
                }

                records.push({
                    index: i + 1,
                    display_name: displayName,
                    ranking: rankings[i].ranking
                });
            }

            $scope.records = records;
        })
        .error(function(data, status, headers, config) {
            console.log("(" + status + ") " + data);
        });
    }

    init();
}]);